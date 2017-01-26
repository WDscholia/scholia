"""arxiv.

Usage:
  scholia.arxiv get-metadata <arxiv>
  scholia.arxiv get-quickstatements [options] <arxiv>

Options:
  -o --output=file  Output filename, default output to stdout

References:
  https://arxiv.org

"""

from __future__ import absolute_import, division, print_function

from dateutil.parser import parse as parse_datetime

import json

import os
from os import write

import re

from lxml import etree

import requests


def get_metadata(arxiv):
    """Get metadata about an arxiv publication from website.

    Parameters
    ----------
    arxiv : str
        ArXiv identifier.

    Returns
    -------
    metadata : dict
        Dictionary with metadata.

    References
    ----------
    - https://arxiv.org

    """
    arxiv = arxiv.strip()
    url = 'https://arxiv.org/abs/' + arxiv
    response = requests.get(url)
    tree = etree.HTML(response.content)

    datetime_as_string = tree.xpath(
        '//div[@class="submission-history"]/text()')[-2][5:30]
    isodatetime = parse_datetime(datetime_as_string).isoformat()
    metadata = {
        'arxiv': arxiv,
        'authornames': tree.xpath('//div[@class="authors"]/a/text()'),
        'full_text_url': 'https://arxiv.org/pdf/' + arxiv + '.pdf',
        'publication_date': isodatetime,
        'title': re.sub('\s+', ' ', tree.xpath('//h1/text()')[-1].strip()),
    }
    return metadata


def metadata_to_quickstatements(metadata):
    """Convert metadata to quickstatements.

    Convert metadata about a ArXiv article represented in a dict to a
    format so it can copy and pasted into Magnus Manske quickstatement web tool
    to populate Wikidata.

    This function does not check whether the item already exists.

    Parameters
    ----------
    metadata : dict
        Dictionary with metadata.

    Returns
    -------
    quickstatements : str
        String with quickstatements.

    References
    ----------
    - https://tools.wmflabs.org/wikidata-todo/quick_statements.php

    """
    qs = u"CREATE\n"
    qs += u'LAST\tP818\t"{}"\n'.format(metadata['arxiv'])
    qs += u'LAST\tP31\tQ13442814\n'
    qs += u'LAST\tLen\t"{}"\n'.format(metadata['title'].replace('"', '\"'))
    qs += u'LAST\tP1476\ten:"{}"\n'.format(
        metadata['title'].replace('"', '\"'))
    qs += u'LAST\tP577\t+{}T00:00:00Z/11\n'.format(
        metadata['publication_date'][:10])
    qs += u'LAST\tP953\t"{}"\n'.format(
        metadata['full_text_url'].replace('"', '\"'))
    for n, authorname in enumerate(metadata['authornames'], start=1):
        qs += u'LAST\tP2093\t"{}"\tP1545\t"{}"\n'.format(
            authorname.replace('"', '\"'), n)
    return qs


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
        arxiv = arguments['<arxiv>']
        metadata = get_metadata(arxiv)
        print(json.dumps(metadata))

    elif arguments['get-quickstatements']:
        arxiv = arguments['<arxiv>']
        metadata = get_metadata(arxiv)
        quickstatements = metadata_to_quickstatements(metadata)
        write(output_file, quickstatements.encode(output_encoding))

    else:
        assert False


if __name__ == '__main__':
    main()
