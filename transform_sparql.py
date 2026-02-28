#!/usr/bin/env python3
"""
Script to transform SPARQL queries in scholia/app/templates/:
1. Comment out lines starting with "SERVICE wikibase:label"
2. Eliminate WITH { ... } AS %template by replacing the template with subquery
3. Add missing PREFIX declarations at the top
"""

import os
import re
import glob
from typing import List, Tuple, Set

def extract_prefixes_from_query(content: str) -> Set[str]:
    """Extract all namespace prefixes used in the query."""
    prefixes = set()

    # Common prefixes used in Wikidata SPARQL queries
    common_prefixes = {
        'wd': '<http://www.wikidata.org/entity/>',
        'wdt': '<http://www.wikidata.org/prop/direct/>',
        'wikibase': '<http://wikiba.se/ontology#>',
        'bd': '<http://www.bigdata.com/rdf#>',
        'rdfs': '<http://www.w3.org/2000/01/rdf-schema#>',
        'schema': '<http://schema.org/>',
        'skos': '<http://www.w3.org/2004/02/skos/core#>',
        'prov': '<http://www.w3.org/ns/prov#>',
        'ps': '<http://www.wikidata.org/prop/statement/>',
        'pq': '<http://www.wikidata.org/prop/qualifier/>',
        'p': '<http://www.wikidata.org/prop/>',
        'wdref': '<http://www.wikidata.org/reference/>',
        'pr': '<http://www.wikidata.org/prop/reference/>',
        'wdno': '<http://www.wikidata.org/prop/novalue/>',
        'wds': '<http://www.wikidata.org/entity/statement/>',
        'wdv': '<http://www.wikidata.org/value/>',
        'wdtn': '<http://www.wikidata.org/prop/direct-normalized/>',
        'psv': '<http://www.wikidata.org/prop/statement/value/>',
        'psn': '<http://www.wikidata.org/prop/statement/value-normalized/>',
        'pqv': '<http://www.wikidata.org/prop/qualifier/value/>',
        'pqn': '<http://www.wikidata.org/prop/qualifier/value-normalized/>',
        'prv': '<http://www.wikidata.org/prop/reference/value/>',
        'prn': '<http://www.wikidata.org/prop/reference/value-normalized/>',
        'xsd': '<http://www.w3.org/2001/XMLSchema#>'
    }

    # Look for prefix usage patterns in the content
    for prefix_name in common_prefixes:
        # Check for patterns like "wd:Q123", "wdt:P123", etc.
        pattern = rf'\b{prefix_name}:[A-Za-z0-9_-]+'
        if re.search(pattern, content):
            prefixes.add(f"PREFIX {prefix_name}: {common_prefixes[prefix_name]}")

    return prefixes

def extract_with_templates(content: str) -> List[Tuple[str, str, str]]:
    """Extract WITH {...} AS %template patterns and return (full_match, template_name, subquery)."""
    templates = []

    # Find all WITH statements by parsing them more carefully
    # This handles nested braces better
    pos = 0
    while True:
        # Look for "WITH" keyword
        with_match = re.search(r'\bWITH\s*\{', content[pos:], re.IGNORECASE)
        if not with_match:
            break

        start_pos = pos + with_match.start()
        brace_pos = pos + with_match.end() - 1  # Position of opening brace

        # Count braces to find the matching closing brace
        brace_count = 1
        i = brace_pos + 1
        while i < len(content) and brace_count > 0:
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1

        if brace_count == 0:
            end_brace_pos = i - 1
            # Look for AS %template_name after the closing brace
            template_match = re.search(r'\s*AS\s*%(\w+)', content[end_brace_pos + 1:], re.IGNORECASE)
            if template_match:
                template_name = template_match.group(1)
                full_end_pos = end_brace_pos + 1 + template_match.end()
                full_match = content[start_pos:full_end_pos]
                subquery = content[brace_pos + 1:end_brace_pos].strip()
                templates.append((full_match, template_name, subquery))

        pos = start_pos + 1

    return templates

def replace_include_statements(content: str, template_name: str, subquery: str) -> str:
    """Replace INCLUDE %template_name with the actual subquery wrapped in {}."""
    pattern = rf'\bINCLUDE\s*%{template_name}\b'
    replacement = f'{{ {subquery} }}'
    return re.sub(pattern, replacement, content, flags=re.IGNORECASE)

def comment_service_lines(content: str) -> str:
    """Comment out lines starting with SERVICE wikibase:label."""
    lines = content.split('\n')
    result_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith('SERVICE wikibase:label'):
            # Comment out the line
            result_lines.append(f'# {line}')
        else:
            result_lines.append(line)

    return '\n'.join(result_lines)

def transform_sparql_file(file_path: str) -> str:
    """Transform a single SPARQL file according to the requirements."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Comment out SERVICE wikibase:label lines
    content = comment_service_lines(content)

    # Step 2: Extract and replace WITH templates
    templates = extract_with_templates(content)

    # Process templates in reverse order to handle nested templates correctly
    for full_match, template_name, subquery in reversed(templates):
        # Replace INCLUDE statements with the subquery
        content = replace_include_statements(content, template_name, subquery)
        # Remove the WITH statement
        content = content.replace(full_match, '')

    # Step 3: Extract existing PREFIX declarations
    existing_prefixes = set()
    prefix_pattern = r'^PREFIX\s+\w+:\s*<[^>]+>'
    for line in content.split('\n'):
        if re.match(prefix_pattern, line.strip(), re.IGNORECASE):
            existing_prefixes.add(line.strip())

    # Extract needed prefixes from the query
    needed_prefixes = extract_prefixes_from_query(content)

    # Filter out prefixes that already exist
    existing_prefix_names = set()
    for existing in existing_prefixes:
        match = re.match(r'PREFIX\s+(\w+):', existing, re.IGNORECASE)
        if match:
            existing_prefix_names.add(match.group(1))

    new_prefixes = []
    for prefix in needed_prefixes:
        match = re.match(r'PREFIX\s+(\w+):', prefix, re.IGNORECASE)
        if match and match.group(1) not in existing_prefix_names:
            new_prefixes.append(prefix)

    # Step 4: Add missing PREFIX declarations at the top
    if new_prefixes:
        lines = content.split('\n')

        # Find where to insert prefixes (after existing prefixes or at the beginning)
        insert_index = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('#') or line.strip().startswith('PREFIX') or line.strip() == '':
                insert_index = i + 1
            else:
                break

        # Insert new prefixes
        for prefix in sorted(new_prefixes):
            lines.insert(insert_index, prefix)
            insert_index += 1

        # Add empty line after prefixes if needed
        if new_prefixes and insert_index < len(lines) and lines[insert_index].strip() != '':
            lines.insert(insert_index, '')

        content = '\n'.join(lines)

    # Clean up extra whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

    return content

def main():
    """Main function to transform all SPARQL files in scholia/app/templates/."""
    templates_dir = 'scholia/app/templates'

    if not os.path.exists(templates_dir):
        print(f"Error: Directory {templates_dir} not found!")
        return

    sparql_files = glob.glob(os.path.join(templates_dir, '*.sparql'))

    if not sparql_files:
        print(f"No .sparql files found in {templates_dir}")
        return

    print(f"Found {len(sparql_files)} SPARQL files to transform...")

    for file_path in sorted(sparql_files):
        try:
            print(f"Transforming {os.path.basename(file_path)}...")
            transformed_content = transform_sparql_file(file_path)

            # Write the transformed content back to the file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(transformed_content)

            print(f"✓ Successfully transformed {os.path.basename(file_path)}")

        except Exception as e:
            print(f"✗ Error transforming {os.path.basename(file_path)}: {e}")

    print("Transformation complete!")

if __name__ == '__main__':
    main()