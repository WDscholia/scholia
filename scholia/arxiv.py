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

from .config import config
from .qs import paper_to_quickstatements


USER_AGENT = config['requests'].get('user_agent')

HEADERS = {'User-Agent': USER_AGENT}

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

    The language is set to English.

    References
    ----------
    - https://arxiv.org
    - https://arxiv.org/help/robots

    Examples
    --------
    >>> metadata = get_metadata('1503.00759')
    >>> metadata['doi'] == '10.1109/JPROC.2015.2483592'
    True
    >>> 'error' in get_metadata('5432.01234')
    True

    """
    arxiv = arxiv.strip()

    url = ARXIV_URL + "api/query?id_list=" + arxiv
    try:
        response = requests.get(url, headers=HEADERS)

        if response.status_code == 200:
            feed = parse_api(response.content)
            entry = feed.entries[0]

            if "link" not in entry:
                return {'error': "Not found"}
            publication_date = entry.published[:10]
            metadata = {
                'arxiv': arxiv,
                'authors': [author.name for author in entry.authors],
                'full_text_url': f'https://arxiv.org/pdf/{arxiv}.pdf',
                'date_P577': f'+{publication_date}T00:00:00Z/11',
                'date': publication_date,

                # Some titles may have a newline in them. This should be
                # converted to an ordinary space character
                'title': re.sub(r'\s+', ' ', entry.title),

                # Take that arXiv articles are always in English
                'language_q': "Q1860",

                'arxiv_classifications': [tag.term for tag in entry.tags],
            }

            # Optional DOI
            if "arxiv_doi" in entry:
                metadata['doi'] = entry.arxiv_doi.upper()

            return metadata
        else:
            # Handle non-200 status codes (e.g., 404, 500) appropriately
            status_code = response.status_code
            return {'error': f'Request failed with status code {status_code}'}

    except requests.exceptions.RequestException:
        # connection timeout, DNS resolution error, etc
        return {'error': 'Request failed due to a network error'}
    except Exception:
        return {'error': 'An unexpected error occurred'}


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
        quickstatements = paper_to_quickstatements(metadata)
        os.write(output_file, quickstatements.encode(output_encoding))

    else:
        assert False


if __name__ == '__main__':
    main()
