"""arxiv.

Usage:
  scholia.arxiv get-metadata <arxiv>
  scholia.arxiv get-quickstatements [options] <arxiv>

Options:
  -o --output=file  Output filename, default output to stdout

References
----------
  https://arxiv.org

"""

from __future__ import absolute_import, division, print_function

import json

import os

import re

import sys

import requests

from feedparser import parse as parse_api


USER_AGENT = 'Scholia'

ARXIV_URL = 'https://export.arxiv.org/'


def get_metadata(arxiv):
    """Get metadata about an arxiv publication from website.

    Scrapes the arXiv webpage corresponding to the paper with the `arxiv`
    identifier and return the metadata for the paper in a dictionary.

    Parameters
    ----------
    arxiv : str
        ArXiv identifier.

    Returns
    -------
    metadata : dict or None
        Dictionary with metadata. None is returned if the identifier is not
        found.

    Notes
    -----
    This function queries arXiv. It must not be used to crawl arXiv.
    It does not look at robots.txt.

    References
    ----------
    - https://arxiv.org
    - https://arxiv.org/help/robots

    Examples
    --------
    >>> metadata = get_metadata('1503.00759')
    >>> metadata['doi'] == '10.1109/JPROC.2015.2483592'
    True

    """
    arxiv = arxiv.strip()

    url = ARXIV_URL + "api/query?id_list=" + arxiv
    response = requests.get(url)

    if not response.status_code == 200:
        return None

    feed = parse_api(response.content)
    entry = feed.entries[0]

    metadata = {
        'arxiv': arxiv,
        'authornames': [author.name for author in entry.authors],
        'full_text_url': 'https://arxiv.org/pdf/' + arxiv + '.pdf',
        'publication_date': entry.published[:10],

        # Some titles may have a newline in them. This should be converted to
        # an ordinary space character
        'title': re.sub(r'\s+', ' ', entry.title),

        'arxiv_classifications': [tag.term for tag in entry.tags],
    }

    # Optional DOI
    if "arxiv_doi" in entry:
        metadata['doi'] = entry.arxiv_doi.upper()

    return metadata


def metadata_to_quickstatements(metadata):
    """Convert metadata to quickstatements.

    Convert metadata about a ArXiv article represented in a dict to a
    format so it can copy and pasted into Magnus Manske quickstatement web tool
    to populate Wikidata.

    Parameters
    ----------
    metadata : dict
        Dictionary with metadata.

    Returns
    -------
    quickstatements : str
        String with quickstatements.

    Notes
    -----
    English is added as the default language.

    This function does not check whether the item already exists.

    References
    ----------
    - https://wikidata-todo.toolforge.org/quick_statements.php

    """
    qs = u"CREATE\n"
    qs += u'LAST\tP31\tQ13442814\n'

    # arXiv ID
    qs += u'LAST\tP818\t"{}"'.format(metadata['arxiv'])
    # No line break, to accommodate the following qualifiers

    # arXiv classifications such as "cs.LG", as qualifier to arXiv ID
    for classification in metadata['arxiv_classifications']:
        qs += u'\tP820\t"{}"'.format(
            classification.replace('"', '\"'))

    # Line break for the P818 statement
    qs += u"\n"

    qs += u'LAST\tLen\t"{}"\n'.format(metadata['title'].replace('"', '\"'))
    qs += u'LAST\tP1476\ten:"{}"\n'.format(
        metadata['title'].replace('"', '\"'))
    qs += u'LAST\tP577\t+{}T00:00:00Z/11\n'.format(
        metadata['publication_date'][:10])
    qs += u'LAST\tP953\t"{}"\n'.format(
        metadata['full_text_url'].replace('"', '\"'))

    # Always add English as the default language
    qs += u'LAST\tP407\tQ1860\n'

    # Optional DOI
    if 'doi' in metadata:
        qs += u'LAST\tP356\t"{}"\n'.format(
            metadata['doi'].replace('"', '\"'))

    # DOI based on arXiv identifier
    qs += u'LAST\tP356\t"10.48550/ARXIV.{}"\n'.format(
            metadata['arxiv'])

    for n, authorname in enumerate(metadata['authornames'], start=1):
        qs += u'LAST\tP2093\t"{}"\tP1545\t"{}"\n'.format(
            authorname.replace('"', '\"'), n)
    return qs


def string_to_arxivs(string):
    """Extract arxiv IDs from string.

    Multiple arXiv identifier part of `string` will be extracted, where the
    identifier pattern should be in the format of a series of digits
    followed by a period followed by a series of digits. Other formats
    will not be matched. If multiple identifier patterns are in the input
    string then only the first is returned.

    Parameters
    ----------
    string : str
        String with arxiv ID.

    Returns
    -------
    arxivs : list of str
        String with arxiv IDs.

    Examples
    --------
    >>> string = "2210.03493 http://arxiv.org/abs/1103.2903"
    >>> arxivs = string_to_arxivs(string)
    >>> '1103.2903' in arxivs
    True
    >>> "2210.03493" in arxivs
    True

    """
    PATTERN = re.compile(r'\d{4}\.\d+', flags=re.DOTALL | re.UNICODE)
    arxivs = PATTERN.findall(string)
    return arxivs


def string_to_arxiv(string):
    """Extract arxiv id from string.

    The arXiv identifier part of `string` will be extracted, where the
    identifier pattern should be in the format of a series of digits
    followed by a period followed by a series of digits. Other formats
    will not be matched. If multiple identifier patterns are in the input
    string then only the first is returned.

    Parameters
    ----------
    string : str
        String with arxiv ID.

    Returns
    -------
    arxiv : str or None
        String with arxiv ID.

    Examples
    --------
    >>> string = "http://arxiv.org/abs/1103.2903"
    >>> arxiv = string_to_arxiv(string)
    >>> arxiv == '1103.2903'
    True

    """
    arxivs = string_to_arxivs(string)
    if len(arxivs) > 0:
        return arxivs[0]
    return None


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['--output']:
        output_filename = arguments['--output']
        output_file = os.open(output_filename, os.O_RDWR | os.O_CREAT)
    else:
        # stdout
        output_file = 1

    output_encoding = 'utf-8'

    if arguments['get-metadata']:
        string = arguments['<arxiv>']
        arxiv = string_to_arxiv(string)
        if not arxiv:
            sys.exit("No arXiv identifier matched")
        metadata = get_metadata(arxiv)
        if not metadata:
            sys.exit("Could not get metadata for arXix {}".format(arxiv))
        print(json.dumps(metadata))

    elif arguments['get-quickstatements']:
        string = arguments['<arxiv>']
        arxiv = string_to_arxiv(string)
        if not arxiv:
            sys.exit("No arXiv identifier matched")
        metadata = get_metadata(arxiv)
        if not metadata:
            sys.exit("Could not get metadata for arXix {}".format(arxiv))
        quickstatements = metadata_to_quickstatements(metadata)
        os.write(output_file, quickstatements.encode(output_encoding))

    else:
        assert False


if __name__ == '__main__':
    main()
