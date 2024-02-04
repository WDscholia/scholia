r"""Scraping CEUR Workshop Proceedings.

Usage:
  scholia.scrape.ceurws proceedings-url-to-quickstatements [options] <url>

Options:
  --iso639=iso639  Overwrite default iso639 [default: en]
  -o --output=file  Output filename, default output to stdout
  --oe=encoding     Output encoding [default: utf-8]

Examples
--------
$ python -m scholia.scrape.ceurws proceedings-url-to-quickstatements \
    http://ceur-ws.org/Vol-3235/

"""


import os
import os.path

import re

import signal

from six import b, u

from lxml import etree

import requests

from ..qs import paper_to_quickstatements, proceedings_to_quickstatements
from ..query import iso639_to_q, SPARQL_ENDPOINT as WDQS_URL
from ..utils import escape_string, pages_to_number_of_pages


USER_AGENT = 'Scholia'

HEADERS = {'User-Agent': USER_AGENT}

PAPER_TO_Q_QUERY = u("""
SELECT ?paper WHERE {{
  OPTIONAL {{ ?label rdfs:label "{label}"@en . }}
  OPTIONAL {{ ?title wdt:P1476 "{title}"@en . }}
  OPTIONAL {{ ?full_text_url wdt:P953 <{url}> . }}
  OPTIONAL {{ ?url wdt:P856 <{url}> . }}
  BIND(COALESCE(?full_text_url, ?url, ?label, ?title, ?doi) AS ?paper)
}}
""")

SHORT_TITLED_PAPER_TO_Q_QUERY = u("""
SELECT ?paper WHERE {{
  OPTIONAL {{ ?full_text_url wdt:P953 <{url}> . }}
  OPTIONAL {{ ?url wdt:P856 <{url}> . }}
  BIND(COALESCE(?full_text_url, ?url) AS ?paper)
}}
""")


def url_to_volume(url):
    """Extract volume from CEUR WS URL.

    Parameters
    ----------
    url : str
        URL to a CEUR WS proceedings.

    Returns
    -------
    str : str or None
        String representing volume number.

    Example
    -------
    >>> url = "http://ceur-ws.org/Vol-3235/"
    >>> url_to_volume(url)
    '3235'

    """
    volumes = re.findall(r'Vol-(\d+)', url)
    if len(volumes) == 1:
        return volumes[0]
    else:
        return None


def tree_to_papers(tree, proceedings, proceedings_q, iso639='en'):
    """Extract the set of individual CEUR WD papers.

    Parameters
    ----------
    tree : etree.HTML
        Object with parsed HTML.
    proceedings : dict
        Dictionary with proceedings
    proceedings_q : str
        String with Q-identifier for proceedings
    iso639 : str, optional
        ISO 639 language specification. The default is 'en'.

    Returns
    -------
    papers : list of dictionaries
        List with papers as dictionaries.

    """
    n = 1
    papers = []
    toc_elements = tree.xpath('//div[@class="CEURTOC"]')
    if not toc_elements:
        # Cannot find papers
        return papers

    # paper_elements = toc_elements[0].xpath(".//li")
    # Above insufficient for http://ceur-ws.org/Vol-3240/
    # Is the following too broad?
    paper_elements = toc_elements[0].xpath("//li")

    # Iterate over papers on HTML page
    for element in paper_elements:
        title_elements = element.xpath(".//span[@class='CEURTITLE']")
        if not title_elements:
            # Probably a preface
            continue

        paper = {
            'published_in_q': proceedings_q,
            'date': proceedings['date'],
        }
        paper['full_text_url'] = os.path.join(
            proceedings['url'],
            element.xpath(".//a")[0].attrib['href'])
        paper['title'] = re.sub(r'\s+', ' ', title_elements[0].text).strip()

        # Authors
        authors = [
            author_element.text for author_element in
            element.xpath(".//span[@class='CEURAUTHOR']")
        ]
        if not authors:
            # http://ceur-ws.org/Vol-1191/ has "CEURAUTHORS" for authors
            authors_element = element.xpath(".//span[@class='CEURAUTHORS']")
            if len(authors_element) == 1:
                authors = authors_element[0].text.split(', ')
        if authors:
            paper['authors'] = authors

        # Pages
        pages_element = element.xpath(".//span[@class='CEURPAGES']")
        if len(pages_element) == 1 and pages_element[0].text:
            # At least one CEURPAGES element and the first one should be
            # none-empty
            pages = pages_element[0].text
            paper['pages'] = pages
            number_of_pages = pages_to_number_of_pages(pages)
            if number_of_pages:
                paper['number_of_pages'] = number_of_pages

        # Language
        if iso639 is not None:
            paper['iso639'] = iso639
            paper['language_q'] = iso639_to_q(iso639)

        papers.append(paper)
        n += 1

    return papers


def proceedings_url_to_quickstatements(url, iso639='en'):
    """Return Quickstatements for a CEUR WD.

    From a CEUR Workshop Proceedings URL extract metadata for the proceedings
    and the individual papers and format them in the Quickstatement format for
    entry in Wikidata.

    Parameters
    ----------
    url : str
        URL for a CEUR Workshop Series proceedings.
    iso639 : str, optional
        String with ISO639 code. Default is 'en', meaning English.

    Returns
    -------
    qs : str
        String with quickstatements.

    """
    proceedings, tree = proceedings_url_to_proceedings(url, return_tree=True)

    # Check if proceedings is already in Wikidata
    q = paper_to_q(proceedings)
    if q:
        qs = "# {} is https://www.wikidata.org/entity/{}\n".format(url, q)
        papers = tree_to_papers(tree, proceedings, proceedings_q=q,
                                iso639=iso639)
        for paper in papers:

            # Check if paper is already in Wikidata
            q = paper_to_q(paper)
            if q:
                qs += "# {} is https://www.wikidata.org/entity/{}\n".format(
                    paper['full_text_url'], q)
            else:
                qs += paper_to_quickstatements(paper)
                qs += '\n'
    else:
        if iso639 is not None:
            proceedings['iso639'] = iso639
            proceedings['language_q'] = iso639_to_q(iso639)

        qs = proceedings_to_quickstatements(proceedings)
    return qs


def paper_to_q(paper):
    """Find Q identifier for paper.

    Parameters
    ----------
    paper : dict
        Paper represented as dictionary.

    Returns
    -------
    q : str or None
        Q identifier in Wikidata. None is returned if the paper is not found.

    Notes
    -----
    This function might be used to test if a scraped CEUR WS paper is already
    present in Wikidata.

    The match on title is using an exact query, meaning that any variation in
    lowercase/uppercase will not find the Wikidata item. If the title is
    shorter than 21 character then only the URL is used to match.

    Examples
    --------
    >>> paper = {
    ...     'title': ('Wikibase as an Infrastructure for Community Documents: '
    ...               'The example of the Disability Wiki Platform'),
    ...     'full_text_url': 'http://ceur-ws.org/Vol-3235/paper14.pdf'}
    >>> paper_to_q(paper)
    'Q114774462'

    """
    if 'full_text_url' in paper:
        url = paper['full_text_url']
    elif 'url' in paper:
        url = paper['url']
    else:
        raise Exception("`url` field missing in paper dictionary")

    if 'title' in paper and len(paper['title']) > 20:
        title = escape_string(paper['title'])

        query = PAPER_TO_Q_QUERY.format(
            label=title, title=title,
            url=url)
    else:
        # The title is too short to match. Too many wrong matches.
        query = SHORT_TITLED_PAPER_TO_Q_QUERY.format(
            url=url)

    response = requests.get(WDQS_URL,
                            params={'query': query, 'format': 'json'},
                            headers=HEADERS)
    if not response.ok:
        response.raise_for_status()

    data = response.json()['results']['bindings']

    if len(data) == 0 or not data[0]:
        # Not found
        return None

    return str(data[0]['paper']['value'][31:])


def paper_url_to_q(url):
    """Return Q identifier based on URL.

    From CEUR WS URL query Wikidata Query Service to find the Wikidata Q
    identifier.

    Parameters
    ----------
    url : str
        URL to CEUR WD paper.

    Returns
    -------
    q : str or None
        Q identifier for Wikidata or None if not found.

    Examples
    --------
    >>> url ='http://ceur-ws.org/Vol-3235/paper14.pdf'
    >>> paper_url_to_q(url)
    'Q114774462'

    """
    paper = {'full_text_url': url}
    q = paper_to_q(paper)
    return q


def proceedings_url_to_proceedings(url, return_tree=False):
    """Scrape OJS paper from URL.

    Arguments
    ---------
    url : str
        URL to paper as a string
    return_tree : Bool
        Whether to return HTML etree.

    Returns
    -------
    proceedings : dict
        Paper represented as a dictionary.
    tree : etree.HTML
        Object with parse HTML.

    Example
    -------
    >>> url = 'http://ceur-ws.org/Vol-3235/'
    >>> proceedings = proceedings_url_to_proceedings(url)
    >>> proceedings['shortname'] == 'SEMPDW 2022'
    True
    >>> proceedings['volume'] == '3235'
    True
    >>> proceedings['urn'] == 'urn:nbn:de:0074-3235-0'
    True
    >>> proceedings['title'].startswith('Proceedings of Poster and Demo Track')
    True

    """
    proceedings = {
        'url': url,
        'volume': url_to_volume(url),
    }

    # Download a paper from ceur-ws.org
    response = requests.get(url)
    tree = etree.HTML(response.content)

    acronym_elements = tree.xpath("//span[@class='CEURVOLACRONYM']")
    if len(acronym_elements) == 1:
        proceedings['shortname'] = acronym_elements[0].text
    else:
        acronym_elements = tree.xpath("//h1/a")
        if len(acronym_elements) == 1:
            proceedings['shortname'] = acronym_elements[0].text

    proceedings['urn'] = \
        tree.xpath("//span[@class='CEURURN']")[0].text

    proceedings['title'] = re.sub(
        r'\s+', ' ',
        tree.xpath("//span[@class='CEURFULLTITLE']")[0].text).strip()

    proceedings['date'] = \
        tree.xpath("//span[@class='CEURPUBDATE']")[0].text

    proceedings['published_in_q'] = 'Q27230297'

    if return_tree:
        return (proceedings, tree)
    else:
        return proceedings


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['--iso639']:
        iso639 = arguments['--iso639']
    else:
        iso639 = None

    if arguments['--output']:
        output_filename = arguments['--output']
        output_file = os.open(output_filename, os.O_RDWR | os.O_CREAT)
    else:
        # stdout
        output_file = 1
    output_encoding = arguments['--oe']

    # Ignore broken pipe errors
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)

    if arguments['proceedings-url-to-quickstatements']:
        url = arguments['<url>']
        qs = proceedings_url_to_quickstatements(url, iso639=iso639)
        os.write(output_file, qs.encode(output_encoding) + b('\n'))

    else:
        assert False


if __name__ == "__main__":
    main()