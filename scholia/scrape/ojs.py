r"""Scraping Open Journal Systems.

Usage:
  scholia.scrape.ojs scrape-paper-from-url <url>
  scholia.scrape.ojs paper-url-to-q <url>
  scholia.scrape.ojs paper-url-to-quickstatements [options] <url>

Options:
  -o --output=file  Output filename, default output to stdout
  --oe=encoding     Output encoding [default: utf-8]

Examples
--------
$ python -m scholia.scrape.ojs paper-url-to-quickstatements \
    https://journals.uio.no/index.php/osla/article/view/5855

"""


import json

import os

import signal

from six import b, print_, u

from lxml import etree

import requests

from ..qs import paper_to_quickstatements
from ..query import iso639_to_q, issn_to_qs
from ..utils import escape_string


USER_AGENT = 'Scholia'

HEADERS = {'User-Agent': USER_AGENT}

PAPER_TO_Q_QUERY = u("""
SELECT ?paper WHERE {{
  OPTIONAL {{ ?label rdfs:label "{label}"@en . }}
  OPTIONAL {{ ?title wdt:P1476 "{title}"@en . }}
  OPTIONAL {{ ?url wdt:P953 <{url}> . }}
  BIND(COALESCE(?full_text_url, ?url, ?label, ?title) AS ?paper)
}}
""")

# SPARQL Endpoint for Wikidata Query Service
WDQS_URL = 'https://query.wikidata.org/sparql'


def pages_to_number_of_pages(pages):
    """Compute number of pages based on pages represented as string.

    Parameters
    ----------
    pages : str
        Pages represented as a string.

    Returns
    -------
    number_of_pages : int or None
        Number of pages returned as an integer. If the conversion is not
        possible then None is returned.

    Examples
    --------
    >>> pages_to_number_of_pages('61-67')
    7

    """
    number_of_pages = None
    page_elements = pages.split('-')
    if len(page_elements) == 2:
        try:
            number_of_pages = int(page_elements[1]) - int(page_elements[0]) + 1
        except ValueError:
            pass
    return number_of_pages


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
    This function might be used to test if a scraped OJS paper is already
    present in Wikidata.

    The match on title is using an exact query, meaning that any variation in
    lowercase/uppercase will not find the Wikidata item.

    Examples
    --------
    >>> paper = {
    ...     'title': ('Linguistic Deviations in the Written Academic Register '
    ...               'of Danish University Students'),
    ...     'url': 'https://journals.uio.no/index.php/osla/article/view/5855'}
    >>> paper_to_q(paper)
    'Q61708017'

    """
    title = escape_string(paper['title'])
    query = PAPER_TO_Q_QUERY.format(
        label=title, title=title,
        url=paper['url'])

    response = requests.get(WDQS_URL,
                            params={'query': query, 'format': 'json'},
                            headers=HEADERS)
    data = response.json()['results']['bindings']

    if len(data) == 0 or not data[0]:
        # Not found
        return None

    return str(data[0]['paper']['value'][31:])


def paper_url_to_q(url):
    """Return Q identifier based on URL.

    Scrape OJS HTML page with paper and use the extracted information on a
    query on Wikidata Query Service to find the Wikidata Q identifier.

    Parameters
    ----------
    url : str
        URL to NIPS HTML page.

    Returns
    -------
    q : str or None
        Q identifier for Wikidata or None if not found.

    Examples
    --------
    >>> url = 'https://journals.uio.no/index.php/osla/article/view/5855'
    >>> paper_url_to_q(url)
    'Q61708017'

    """
    paper = scrape_paper_from_url(url)
    q = paper_to_q(paper)
    return q


def paper_url_to_quickstatements(url):
    """Scrape OJS paper and return quickstatements.

    Given a URL to a HTML web page representing a paper formatted by the Open
    Journal Systems, return quickstatements for data entry in Wikidata with the
    Magnus Manske Quickstatement tool.

    Parameters
    ----------
    url : str
        URL to OJS paper as a string.

    Returns
    -------
    qs : str
        Quickstatements for paper as a string.

    """
    paper = scrape_paper_from_url(url)
    qs = paper_to_quickstatements(paper)
    return qs


def scrape_paper_from_url(url):
    """Scrape OJS paper from URL.

    Arguments
    ---------
    url : str
        URL to paper as a string

    Returns
    -------
    paper : dict
        Paper represented as a dictionary.

    Example
    -------
    >>> url = 'https://tidsskrift.dk/carlnielsenstudies/article/view/27763'
    >>> paper = scrape_paper_from_url(url)
    >>> paper['authors'] == ['John Fellow']
    True

    """
    def _field_to_content(field):
        elements = tree.xpath("//meta[@name='{}']".format(field))
        if len(elements) == 0:
            return None
        content = elements[0].attrib['content']
        return content

    entry = {'url': url}

    response = requests.get(url)
    tree = etree.HTML(response.content)

    entry['authors'] = [
        author_element.attrib['content']
        for author_element in tree.xpath("//meta[@name='citation_author']")
    ]

    entry['title'] = _field_to_content('citation_title')

    entry['date'] = _field_to_content('citation_date').replace('/', '-')

    doi = _field_to_content('citation_doi')
    if doi is not None:
        entry['doi'] = doi.upper()

    volume = _field_to_content('citation_volume')
    if volume is not None:
        entry['volume'] = volume

    issue = _field_to_content('citation_issue')
    if issue is not None:
        entry['issue'] = issue

    # Handle page information
    pages = None
    first_page = _field_to_content('citation_firstpage')
    last_page = _field_to_content('citation_lastpage')
    if first_page is not None and last_page is not None:
        pages = "{}-{}".format(first_page, last_page)
    else:
        pages = _field_to_content('DC.Identifier.pageNumber')
    if pages is not None:
        entry['pages'] = pages

        number_of_pages = pages_to_number_of_pages(pages)
        if number_of_pages is not None:
            entry['number_of_pages'] = number_of_pages

    pdf_url = _field_to_content('citation_pdf_url')
    if pdf_url is not None:
        entry['full_text_url'] = pdf_url

    language_as_iso639 = _field_to_content('citation_language')
    if language_as_iso639 is None:
        language_as_iso639 = _field_to_content('DC.Language')
    language_q = iso639_to_q(language_as_iso639)
    if language_q:
        entry['language_q'] = language_q

    entry['published_in_title'] = _field_to_content('citation_journal_title')

    # Find journal/venue based on ISSN information
    issn = _field_to_content('citation_issn')
    if len(issn) == 8:
        # Oslo Studies in Language OJS does not have a dash between the numbers
        issn = issn[:4] + '-' + issn[4:]
    qs = issn_to_qs(issn)
    if len(qs) == 1:
        entry['published_in_q'] = qs[0]

    return entry


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
    output_encoding = arguments['--oe']

    # Ignore broken pipe errors
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)

    if arguments['paper-url-to-q']:
        url = arguments['<url>']
        entry = paper_url_to_q(url)
        print_(entry)

    elif arguments['paper-url-to-quickstatements']:
        url = arguments['<url>']
        qs = paper_url_to_quickstatements(url)
        os.write(output_file, qs.encode(output_encoding) + b('\n'))

    elif arguments['scrape-paper-from-url']:
        url = arguments['<url>']
        entry = scrape_paper_from_url(url)
        print_(json.dumps(entry))

    else:
        assert False


if __name__ == "__main__":
    main()
