r"""tex.

Usage:
  scholia.tex extract-qs-from-aux <file>
  scholia.tex write-bbl-from-aux <file>
  scholia.tex write-bib-from-aux <file>

Description:
  Work with latex and bibtex.

  The functionality is not complete.


Example latex document:

\documentclass{article}
\pdfoutput=1
\usepackage[utf8]{inputenc}

\begin{document}
Scientific citations \cite{Q26857876,Q21172284}.
Semantic relatedness \cite{Q26973018}.
\bibliographystyle{unsrt}
\bibliography{}
\end{document}

"""


from __future__ import print_function

import os
from os import write
from os.path import splitext

import re
import unicodedata

from six import ensure_text, u

from .api import (
    entity_to_authors, entity_to_classes, entity_to_doi,
    entity_to_full_text_url,
    entity_to_journal_title, entity_to_month,
    entity_to_pages, entity_to_title, entity_to_volume, entity_to_year,
    wb_get_entities)
from .query import doi_to_qs


STRING_TO_TEX = {
    u('\xc5'): r'{\AA}',
    u('\xc1'): r"{\'A}",
    '<': r'\textless{}',
    '>': r'\textgreater{}',
    '~': r'\~{}',
    '{': r'\{',
    '}': r'\}',
    '_': r'\_',
    '\\': r'\textbackslash{}',
    '#': r'\#',
    '&': r'\&',
    '^': r'\^{}',
    '%': r'\%',
    '$': r'\$',
}

STRING_TO_TEX_URL = {
    '{': u(r'\{'),
    '}': u(r'\}'),
    '#': u(r'\#'),
    '&': u(r'\&'),
    '^': u(r'\^{}'),
    '%': u(r'\%'),
    '$': u(r'\$'),
    '_': u(r'\_'),
}

COMBINING_DIACRITIC_TO_TEX = {
    u'\u0300': r'\`',
    u'\u0301': r"\'",
    u'\u0302': r'\^',
    u'\u0303': r'\~',
    u'\u0304': r'\=',
    u'\u0308': r'\"',
    u'\u0327': r'\c',
    u'\u0331': r'\b',
    u'\u0306': r'\u',
    u'\u030C': r'\v',
    u'\u0307': r'\.',
    u'\u0323': r'\d',
    u'\u030A': r'\r',
    u'\u030B': r'\H',
    u'\u0328': r'\k'
}

STRING_TO_TEX_PATTERN = re.compile(
    u('|').join(re.escape(key) for key in STRING_TO_TEX),
    flags=re.UNICODE)

STRING_TO_TEX_URL_PATTERN = re.compile(
    u('|').join(re.escape(key) for key in STRING_TO_TEX_URL),
    flags=re.UNICODE)

COMBINING_DIACRITIC_TO_TEX_PATTERN = re.compile(
    u('(.)({})').format(
        u'|'.join(re.escape(key)for key in COMBINING_DIACRITIC_TO_TEX)),
    flags=re.UNICODE)


def escape_to_tex(string, escape_type='normal'):
    r"""Escape a text to a tex/latex safe text.

    Parameters
    ----------
    string : str or None
        Unicode string to be escaped.
    escape_type : normal or url, default normal
        Type of escaping.

    Returns
    -------
    escaped_string : str
        Escaped unicode string. If the input is None then an empty string is
        returned.

    Examples
    --------
    >>> escape_to_tex("^^") == r'\^{}\^{}'
    True

    >>> escaped = escape_to_tex('10.1007/978-3-319-18111-0_26', 'url')
    >>> escaped == '10.1007/978-3-319-18111-0\\_26'
    True

    References
    ----------
    - https://en.wikibooks.org/wiki/LaTeX/Special_Characters
    - http://stackoverflow.com/questions/16259923/

    """
    if string is None:
        return u('')

    string = ensure_text(string)

    if escape_type == 'normal':
        escaped_string = STRING_TO_TEX_PATTERN.sub(
            lambda match: STRING_TO_TEX[match.group()], string)
    elif escape_type == 'url':
        escaped_string = STRING_TO_TEX_URL_PATTERN.sub(
            lambda match: STRING_TO_TEX_URL[match.group()], string)
    else:
        raise ValueError('Wrong value for parameter "escape_type": {}'.format(
            escape_type))

    escaped_string = COMBINING_DIACRITIC_TO_TEX_PATTERN.sub(
        lambda match: u('{{{} {}}}').format(
            COMBINING_DIACRITIC_TO_TEX[match.group(2)],
            match.group(1)),
        unicodedata.normalize('NFD', escaped_string))
    return escaped_string


def guess_bibtex_entry_type(entity):
    """Guess Bibtex entry type.

    Parameters
    ----------
    entity : dict
        Wikidata item.

    Returns
    -------
    entry_type : str
        Entry type as a string: 'Article', 'InProceedings', etc.

    """
    classes = entity_to_classes(entity)
    if "Q13442814" in classes:
        # TODO
        # Scientific article: Article, InProceedings, Misc, ...
        entry_type = 'Article'

    elif 'Q1143604' in classes:
        entry_type = 'Proceedings'

    elif 'Q26995865' in classes:
        entry_type = 'PhdThesis'

    elif 'Q571' in classes:
        entry_type = 'Book'

    else:
        pass

    return entry_type


def extract_dois_from_aux_string(string):
    r"""Extract DOIs from string.

    Parameters
    ----------
    string : str
        Extract Wikidata identifiers from citations.

    Returns
    -------
    dois : list of str
        List of strings.

    Examples
    --------
    >>> string = "\citation{10.1186/S13321-016-0161-3}"
    >>> extract_dois_from_aux_string(string)
    ['10.1186/S13321-016-0161-3']

    """
    matches = re.findall(r'^\\citation{(.+?)}', string,
                         flags=re.MULTILINE | re.UNICODE)
    dois = []
    for submatches in matches:
        for doi in submatches.split(','):
            if re.match(r'10\.\d{4}/.+', doi):
                dois.append(doi)
    return dois


def extract_qs_from_aux_string(string):
    r"""Extract qs from string.

    Parameters
    ----------
    string : str
        Extract Wikidata identifiers from citations.

    Returns
    -------
    qs : list of str
        List of strings.

    Examples
    --------
    >>> string = "\citation{Q28042913}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913']

    >>> string = "\citation{Q28042913,Q27615040}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913', 'Q27615040']

    >>> string = "\citation{Q28042913,Q27615040,Q27615040}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913', 'Q27615040', 'Q27615040']

    >>> string = "\citation{Q28042913,NielsenF2002Neuroinformatics,Q27615040}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913', 'Q27615040']

    >>> string = "\citation{Q28042913,Q27615040.Q27615040}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913']

    """
    matches = re.findall(r'^\\citation{(.+?)}', string,
                         flags=re.MULTILINE | re.UNICODE)
    qs = []
    for submatches in matches:
        for q in submatches.split(','):
            if re.match(r'^Q\d+$', q):
                qs.append(q)

    return qs


def authors_to_bibtex_authors(authors):
    """Convert a Wikidata entity to an author in BibTeX.

    Parameters
    ----------
    authors : dict
        Wikidata entity as hierarchical structure.

    Returns
    -------
    entry : str
        Bibtex entry in Unicode string.

    """
    bibtex_authors = []
    for n, (author, humanness) in enumerate(authors):
        if humanness:
            bibtex_authors.append(escape_to_tex(author))
        else:
            bibtex_authors.append(u('{') + escape_to_tex(author) + '}')
    return bibtex_authors


def entity_to_bibtex_entry(entity, key=None):
    """Convert Wikidata entity to bibtex-formatted entry.

    Parameters
    ----------
    entity : dict
        Wikidata entity as hierarchical structure.
    key : str
        Bibtex key.

    Returns
    -------
    entry : str
        Bibtex entry in Unicode string.

    """
    if key is None:
        entry = u("@Article{%s,\n") % entity['id']
    else:
        entry = u("@Article{%s,\n") % escape_to_tex(key)
    authors = authors_to_bibtex_authors(
        entity_to_authors(entity, return_humanness=True))
    entry += "  author =   {%s},\n" % u" and ".join(authors)
    entry += "  title =    {{%s}},\n" % escape_to_tex(entity_to_title(entity))
    entry += "  journal =  {%s},\n" % (
        escape_to_tex(entity_to_journal_title(entity)))
    entry += "  year =     {%s},\n" % escape_to_tex(entity_to_year(entity))
    entry += "  volume =   {%s},\n" % escape_to_tex(entity_to_volume(entity))
    entry += "  number =   {},\n"
    entry += "  month =    {%s},\n" % escape_to_tex(entity_to_month(entity))
    entry += "  pages =    {%s},\n" % escape_to_tex(entity_to_pages(entity))
    entry += "  DOI =      {%s},\n" % escape_to_tex(
        entity_to_doi(entity), 'url')
    entry += "  URL =      {%s},\n" % escape_to_tex(
        entity_to_full_text_url(entity), 'url')
    entry += "  wikidata = {%s}\n" % escape_to_tex(entity['id'])
    entry += '}\n'
    return entry


def main():
    """Handle command-line arguments."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['extract-qs-from-aux']:
        string = open(arguments['<file>']).read()
        print(" ".join(extract_qs_from_aux_string(string)))

    elif arguments['write-bbl-from-aux']:
        aux_filename = arguments['<file>']
        base_filename, _ = splitext(aux_filename)
        bbl_filename = base_filename + '.bbl'

        string = open(aux_filename).read()
        qs = extract_qs_from_aux_string(string)
        entities = wb_get_entities(qs)

        widest_label = max([len(q) for q in qs])
        bbl = u'\\begin{thebibliography}{%d}\n\n' % widest_label

        for q in qs:
            entity = entities[q]
            bbl += '\\bibitem{%s}\n' % q
            bbl += u", ".join(entity_to_authors(entity)) + '.\n'
            bbl += entity_to_title(entity) + '.\n'

            bbl += '\n'

        bbl += '\\end{thebibliography}\n'

        with open(bbl_filename, 'w') as f:
            f.write(bbl.encode('utf-8'))

        with open(aux_filename, 'a') as f:
            for n, q in enumerate(qs, 1):
                f.write('\\bibcite{%s}{%d}\n' % (q, n))

    elif arguments['write-bib-from-aux']:
        aux_filename = arguments['<file>']
        base_filename, _ = splitext(aux_filename)
        bib_filename = base_filename + '.bib'

        string = open(aux_filename).read()
        qs = list(set(extract_qs_from_aux_string(string)))
        keys = qs[:]
        dois = list(set(extract_dois_from_aux_string(string)))
        for doi in dois:
            qs_doi = doi_to_qs(doi)
            if len(qs_doi) == 0:
                print('Could not find Wikidata item for {doi}'.format(doi))
                continue
            if len(qs_doi) > 1:
                print(('Multiple Wikidata items for {doi}: {qs}.'
                       'Using first.').format(doi, qs_doi))
            q = qs_doi[0]
            qs.append(q)
            keys.append(doi)

        entities = wb_get_entities(qs)

        bib = u("")
        for q, key in zip(qs, keys):
            entity = entities[q]
            bib += entity_to_bibtex_entry(entity, key=key)
            bib += '\n'

        # Write BibTeX-formatted string to file
        output_file = os.open(bib_filename, os.O_RDWR | os.O_CREAT)
        output_encoding = "utf-8"
        write(output_file, bib.encode(output_encoding))


if __name__ == '__main__':
    main()
