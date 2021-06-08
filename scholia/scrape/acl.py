r"""Scraping ACL.

Usage:
  scholia.scrape.acl scrape-paper-from-url <url>
  scholia.scrape.acl scrape-proceedings-from-url <url>
  scholia.scrape.acl paper-url-to-q <url>
  scholia.scrape.acl paper-url-to-quickstatements [options] <url>
  scholia.scrape.acl proceedings-url-to-quickstatements [options] <url>

Options:
  -o --output=file  Output filename, default output to stdout
  --oe=encoding     Output encoding [default: utf-8]

Examples
--------
$ python -m scholia.scrape.ojs paper-url-to-quickstatements \
    https://www.aclweb.org/anthology/2020.findings-emnlp.1/

"""


import json

import os

import signal

from six import b, print_, u

from time import sleep

from lxml import etree

import requests

from ..qs import paper_to_quickstatements, proceedings_to_quickstatements
from ..utils import escape_string, pages_to_number_of_pages


USER_AGENT = 'Scholia'

HEADERS = {'User-Agent': USER_AGENT}

PAPER_TO_Q_QUERY = u("""
SELECT ?paper WHERE {{
  OPTIONAL {{ ?label rdfs:label "{label}"@en . }}
  OPTIONAL {{ ?title wdt:P1476 "{title}"@en . }}
  OPTIONAL {{ ?full_text_url wdt:P953 <{url}> . }}
  OPTIONAL {{ ?url wdt:P856 <{url}> . }}
  OPTIONAL {{ ?acl_id wdt:P7506 "{{acl_id}}" . }}
  BIND(COALESCE(?full_text_url, ?url, ?label, ?title, ?doi, ?acl) AS ?paper)
}}
""")

SHORT_TITLED_PAPER_TO_Q_QUERY = u("""
SELECT ?paper WHERE {{
  OPTIONAL {{ ?full_text_url wdt:P953 <{url}> . }}
  OPTIONAL {{ ?url wdt:P856 <{url}> . }}
  OPTIONAL {{ ?acl_id wdt:P7506 "{{acl_id}}" . }}
  BIND(COALESCE(?full_text_url, ?url, ?acl) AS ?paper)
}}
""")


# SPARQL Endpoint for Wikidata Query Service
WDQS_URL = 'https://query.wikidata.org/sparql'


def url_to_acl_id(url):
    """Extract ACL identifier from URL.

    Parameters
    ----------
    url : str
        String representing a ACL URL.

    Returns
    -------
    acl_id : str or None
        ACL identifier as a string.

    Examples
    --------
    >>> url = "https://www.aclweb.org/anthology/2020.findings-emnlp.447/"
    >>> url_to_acl_id(url)
    '2020.findings-emnlp.447'

    >>> url = "https://www.aclweb.org/anthology/volumes/W19-61/"
    >>> url_to_acl_id(url)
    'W19-61'

    """
    acl_id = None
    if url.startswith('https://www.aclweb.org/anthology/volumes/'):
        acl_id = url[41:]
    elif url.startswith('https://www.aclweb.org/anthology/'):
        acl_id = url[33:]
    if acl_id is not None and acl_id.endswith('/'):
        acl_id = acl_id[:-1]
    return acl_id


def proceedings_url_to_paper_urls(url):
    """Scrape paper URLs from proceedings URL.

    Scrape paper (article) URLs from a given proceedings URL.

    Parameters
    ----------
    url : str
        URL to an OJS issue.

    Returns
    -------
    urls : list of strs
        List of URLs to papers.

    Examples
    --------
    >>> url = "https://www.aclweb.org/anthology/volumes/W19-61/"
    >>> urls = proceedings_url_to_paper_urls(url)

    """
    response = requests.get(url, headers=HEADERS)
    tree = etree.HTML(response.content)
    urls = tree.xpath("//strong/a/@href")
    urls = ["https://www.aclweb.org" + url for url in urls]
    return urls


def proceedings_url_to_quickstatements(url, crawl_delay=5):
    """Return Quickstatements for papers in an proceedings.

    From an ACL proceeding URL extract metadata for the proceedings and
    individual papers and format them in the Quickstatement format for entry in
    Wikidata.

    Parameters
    ----------
    url : str
        URL for a OJS issue.
    crawl_delay : int
        Time in seconds between repeated web requests

    Returns
    -------
    qs : str
        String with quickstatements.

    """
    proceedings_q = paper_url_to_q(url)
    if proceedings_q is None:
        proceedings = scrape_proceedings_from_url(url)
        qs = proceedings_to_quickstatements(proceedings)
    else:
        paper_urls = proceedings_url_to_paper_urls(url)
        qs = ''
        for n, paper_url in enumerate(paper_urls):
            if not n == 0:
                sleep(crawl_delay)
            qs += paper_url_to_quickstatements(
                paper_url, proceedings_q=proceedings_q) + "\n"
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
    This function might be used to test if a scraped ACL paper is already
    present in Wikidata.

    The match on title is using an exact query, meaning that any variation in
    lowercase/uppercase will not find the Wikidata item. If the title is
    shorter than 21 character then only the URL is used to match.

    Examples
    --------
    >>> paper = {
    ...     'title': 'Cross-lingual Name Tagging and Linking for 282 Languages'
    ...     'url': 'https://www.aclweb.org/anthology/P17-1178/'}
    >>> paper_to_q(paper)
    'Q54488065'

    >>> proceedings = {'acl_id': 'W19-6104' }
    >>> paper_to_q(proceedings)
    'Q66317585'

    """
    if 'acl_id' in paper:
        acl_id = paper['acl_id']
    else:
        acl_id = "* NO MATCH *"

    if 'title' in paper:
        title = escape_string(paper['title'])
    else:
        title = "* NO MATCH *"

    query = PAPER_TO_Q_QUERY.format(
        label=title, title=title,
        url=paper['url'],
        acl_id=acl_id)

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

    Scrape ACL HTML page with paper and use the extracted information on a
    query on Wikidata Query Service to find the Wikidata Q identifier.

    Parameters
    ----------
    url : str
        URL to Open Journal System article webpage.

    Returns
    -------
    q : str or None
        Q identifier for Wikidata or None if not found.

    Examples
    --------
    >>> url ='https://www.aclweb.org/anthology/P17-1178/'
    >>> paper_url_to_q(url)
    'Q54488065'

    """
    paper = scrape_paper_from_url(url)
    q = paper_to_q(paper)
    return q


def paper_url_to_quickstatements(url, proceedings_q=None):
    """Scrape ACL paper and return quickstatements.

    Given a URL to a HTML web page representing a paper formatted by ACL,
    return quickstatements for data entry in Wikidata with the
    Magnus Manske Quickstatement tool.

    Parameters
    ----------
    url : str
        URL to OJS paper as a string.

    Returns
    -------
    qs : str
        Quickstatements for paper as a string.

    Notes
    -----
    It the paper is already entered in Wikidata then a comment will just
    be produced, - no quickstatements.

    The quickstatement tool is available at
    https://quickstatements.toolforge.org.

    """
    if url.endswith('/'):
        # remove trailing '/' from the URL
        url = url[:-1]

    paper = scrape_paper_from_url(url, proceedings_q=proceedings_q)

    q = paper_to_q(paper)
    if q:
        return "# {q} is {url}".format(q=q, url=url)

    qs = paper_to_quickstatements(paper)
    return qs


def scrape_paper_from_url(url, proceedings_q=None):
    """Scrape ACL paper from URL.

    Arguments
    ---------
    url : str
        URL to paper as a string.
    proceedings_q : str
        Wikidata Q-identifier for proceedings where the paper is published in.

    Returns
    -------
    paper : dict
        Paper represented as a dictionary.

    Example
    -------
    >>> url = 'https://www.aclweb.org/anthology/2020.findings-emnlp.447/'
    >>> paper = scrape_paper_from_url(url)
    >>> paper['authors'] == ['Qi He', 'Han Wang', 'Yue Zhang']
    True

    """
    def _field_to_content(field):
        elements = tree.xpath("//meta[@name='{}']".format(field))
        if len(elements) == 0:
            return None
        content = elements[0].attrib['content']
        return content

    def _fields_to_content(fields):
        for field in fields:
            content = _field_to_content(field)
            if content is not None and content != '':
                return content
        else:
            return None

    entry = {
        'url': url,
        'acl_id': url_to_acl_id(url),
    }
    response = requests.get(url, headers=HEADERS)
    tree = etree.HTML(response.content)

    authors = [
        author_element.attrib['content']
        for author_element in tree.xpath("//meta[@name='citation_author']")
    ]
    if len(authors) > 0:
        entry['authors'] = authors

    title = _fields_to_content(['citation_title'])
    if title is not None:
        entry['title'] = title

    citation_date = _fields_to_content(['citation_publication_date'])
    if citation_date is not None:
        entry['date'] = citation_date.replace('/', '-')

    doi = _fields_to_content(['citation_doi', 'DC.Identifier.DOI'])
    if doi is not None:
        entry['doi'] = doi.upper()

    # Handle page information
    pages = None
    first_page = _field_to_content('citation_firstpage')
    last_page = _field_to_content('citation_lastpage')
    if first_page is not None and last_page is not None:
        pages = "{}-{}".format(first_page, last_page)
    if pages is not None:
        entry['pages'] = pages

        number_of_pages = pages_to_number_of_pages(pages)
        if number_of_pages is not None:
            entry['number_of_pages'] = number_of_pages

    pdf_url = _field_to_content('citation_pdf_url')
    if pdf_url is not None:
        entry['full_text_url'] = pdf_url

    language_as_iso639 = 'en'
    entry['iso639'] = language_as_iso639
    language_q = "Q1860"
    entry['language_q'] = language_q

    return entry


def scrape_proceedings_from_url(url):
    """Scrape ACL proceedings from URL.

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
    >>> url = 'https://www.aclweb.org/anthology/volumes/2020.findings-emnlp/'
    >>> paper = scrape_proceedings_from_url(url)
    >>> paper['editors'] == ['Trevor Cohn', 'Yulan He', 'Yang Liu']
    True

    """
    entry = {
        'url': url,
        'acl_id': url_to_acl_id(url),
    }
    response = requests.get(url, headers=HEADERS)
    tree = etree.HTML(response.content)

    editors = [
        editor
        for editor in tree.xpath("//p[@class='lead']/a/text()")
    ]
    if len(editors) > 0:
        entry['editors'] = editors

    titles = tree.xpath("//title/text()")
    if len(titles) > 0:
        if titles[0].endswith(' - ACL Anthology'):
            entry['title'] = titles[0][:-len(' - ACL Anthology')]
        else:
            entry['title'] = titles[0]

    match = "//dt[text()='Publisher:']/following-sibling::dd[1]/text()"
    publishers = tree.xpath(match)
    if len(publishers) > 0:
        if publishers[0] == 'Association for Computational Linguistics':
            entry['publisher_q'] = "Q4346375"

    match = "//dt[text()='DOI:']/following-sibling::dd[1]/text()"
    dois = tree.xpath(match)
    if len(dois) > 0:
        entry['doi'] = dois[0].upper()

    match = "//dt[text()='Year:']/following-sibling::dd[1]/text()"
    years = tree.xpath(match)
    if len(years) > 0:
        entry['date'] = years[0]

    language_as_iso639 = 'en'
    entry['iso639'] = language_as_iso639
    language_q = "Q1860"
    entry['language_q'] = language_q

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

    if arguments['proceedings-url-to-quickstatements']:
        url = arguments['<url>']
        qs = proceedings_url_to_quickstatements(url)
        os.write(output_file, qs.encode(output_encoding) + b('\n'))

    elif arguments['paper-url-to-q']:
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
