"""Scraper for NIPS.

Usage:
  scholia.scrape.nips scrape-paper-from-url <url>
  scholia.scrape.nips scrape-paper-urls-from-proceedings-url [options] <url>
  scholia.scrape.nips scrape-proceedings-from-url <url>
  scholia.scrape.nips paper-url-to-q <url>
  scholia.scrape.nips paper-url-to-quickstatements <url>
  scholia.scrape.nips paper-urls-to-quickstatements [options] <filename>

Options:
  -o --output=file  Output filename, default output to stdout
  --oe=encoding     Output encoding [default: utf-8]

Notes
-----
NIPS papers are available from https://papers.nips.cc.

Papers may be published the year after the conference. Newer conferences seems
to publish the same year while older conferences published the year after,
e.g., NIPS 2008 is published in 2009, while NIPS 2009 is published in the same
year, i.e., 2009.

For `scrape-paper-urls-from-proceedings-url` the proceedings URL should be one
listed at https://papers.nips.cc/. It will return a JSON with a list of URLs
for the individual papers.

The generated quickstatements from `paper-url-to-quickstatements` can be
submitted to https://tools.wmflabs.org/quickstatements/.

"""

from six import b, print_, u

import json

import os

import signal

from time import sleep

from lxml import etree

import requests

from ..qs import paper_to_quickstatements
from ..utils import escape_string


PAPER_TO_Q_QUERY = u("""
SELECT ?paper WHERE {{
  OPTIONAL {{ ?label rdfs:label "{label}"@en . }}
  OPTIONAL {{ ?title wdt:P1476 "{title}"@en . }}
  OPTIONAL {{ ?full_text_url wdt:P856 <{full_text_url}> . }}
  OPTIONAL {{ ?url wdt:P953 <{url}> . }}
  BIND(COALESCE(?full_text_url, ?url, ?label, ?title) AS ?paper)
}}
""")

URL_BASE = "https://papers.nips.cc"

USER_AGENT = "Scholia"

WDQS_URL = 'https://query.wikidata.org/sparql'

# Year should be the nominal year, - not the year of publication
YEAR_TO_Q = {
    "2019": "Q68600639",
    "2018": "Q56580288",
    "2017": "Q39502823",
    "2016": "Q30715037",
    "2015": "Q28374318",
    "2014": "Q28949180",
    "2013": "Q28709138",
    "2012": "Q32962684",
    "2011": "Q43904402",
    "2010": "Q43904497",
    "2009": "Q28698531",
    "2008": "Q57745355",
    "2007": "Q57745520",
    "2006": "Q57745572",
    "2005": "Q50412869",  # NIPS 2005
    "2004": "Q27789295",
    "2003": "Q51687233",
    "2002": "Q56231205",
    "2001": "Q56739400",
    "2000": "Q33040753",
    "1999": "Q41661180",
    "1998": "Q57745702",
    "1997": "Q50413005",  # NIPS 1997
    "1996": "Q57745778",
    "1995": "Q57745835",
    "1994": "Q57745887",
    "1993": "Q57745933",
    "1992": "Q47012467",
    "1991": "Q57745985",
    "1990": "Q57746010",
    "1989": "Q57746049",
    "1988": "Q57746081",
    "1987": "Q47032920",
}


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
    This function might be use to test if a scraped NIPS paper is already
    present in Wikidata.

    The match on title is using an exact query, meaning that any variation in
    lowercase/uppercase will not find the Wikidata item.

    Examples
    --------
    >>> paper = {
    ...     'title': 'Hash Embeddings for Efficient Word Representations',
    ...     'url': ('https://papers.nips.cc/paper/7078-hash-embeddings-for-'
    ...             'efficient-word-representations'),
    ...     'full_text_url': ('https://papers.nips.cc/paper/7078-hash-'
    ...                       'embeddings-for-efficient-word-'
    ...                       'representations.pdf')}
    >>> paper_to_q(paper)
    'Q39502551'

    """
    title = escape_string(paper['title'])
    query = PAPER_TO_Q_QUERY.format(
        label=title, title=title,
        url=paper['url'], full_text_url=paper['full_text_url'])

    response = requests.get(
        WDQS_URL, params={'query': query, 'format': 'json'},
        headers={'User-Agent': USER_AGENT})
    if not response.ok:
        raise Exception("Wikidata API response error: {}".format(
            response.status_code))

    data = response.json()['results']['bindings']

    if len(data) == 0 or not data[0]:
        # Not found
        return None

    return str(data[0]['paper']['value'][31:])


def paper_url_to_q(url):
    """Return Q identifier based on URL.

    Scrape NIPS HMTL page with paper and use the extracted information on a
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
    >>> url = ('https://papers.nips.cc/paper/7078-hash-embeddings-for-'
    ...        'efficient-word-representations')
    >>> paper_url_to_q(url)
    'Q39502551'

    """
    paper = scrape_paper_from_url(url)
    q = paper_to_q(paper)
    return q


def paper_url_to_quickstatements(url):
    """Return Quickstatements for paper URL.

    For a given URL pointing to a NIPS paper, scrape the bibliographic
    information from the NIPS website and return the corresponding
    Quickstatements command for entry into Wikidata.

    Parameters
    ----------
    url : str
        URL to NIPS paper.

    Returns
    -------
    qs : str
        String with paper formatted as Quickstatements.

    Notes
    -----
    The function tests whether the paper is already entered into Wikidata
    and return a comment line with the corresponding Wikidata identifier.

    """
    # Check whether the paper is in Wikidata
    q = paper_url_to_q(url)
    if q:
        return "# {q} is {url}".format(q=q, url=url)

    paper = scrape_paper_from_url(url)
    quickstatements = paper_to_quickstatements(paper)
    return quickstatements


def scrape_paper_from_url(url):
    """Scrape NIPS paper from uURL.

    Download HTML page from https://papers.nips.cc/paper/, extract and return
    bibliographic metadata.

    Parameters
    ----------
    url : str
        URL to NIPS paper. Should start with https://papers.nips.cc/paper/
        The URL may either be to the HTML page or the PDF.

    Returns
    -------
    paper : dict
        Dictionary with paper.

    Notes
    -----
    The information is scraped from the individual HTML pages on the website
    https://papers.nips.cc.

    The returned `paper` dict contains url, title, authors as list,
    full_text_url, abstract, year and published_in_q. The year is corrected
    from the nominal to the actual publication year, such that papers published
    before NIPS 2009 has the publication year set to the year after the
    conference.

    If the abstract is not listed on the papers.nips.cc HTML page then the
    `abstract` field is not available in the returned `paper` variable. Some
    of the earliest conferences does not list the abstract.

    """
    url_paper_base = URL_BASE + "/paper/"
    if url[:len(url_paper_base)] != url_paper_base:
        raise ValueError("url should start with {}. It was {}.".format(
            url_paper_base, url))

    if url.endswith('.pdf'):
        url = url[:-4] + '.html'

    entry = {'url': url}

    response = requests.get(url)
    tree = etree.HTML(response.content)

    # In this field there might be markup. For instance,
    # <h2 class="subtitle"><var>\ell_1</var>-regression with Heavy-tailed ...
    # So this is not sufficient:
    # entry['title'] = tree.xpath("//h2[@class='subtitle']")[0].text
    title_element = tree.xpath("//h2[@class='subtitle']")[0]
    entry['title'] = "".join(text for text in title_element.itertext())

    authors_element = tree.xpath("//ul[@class='authors']")[0]
    entry['authors'] = [element.text
                        for element in authors_element.xpath('li/a')]

    full_text_url = tree.xpath("//a[text()='[PDF]']")[0].attrib['href']
    entry['full_text_url'] = 'https://papers.nips.cc' + full_text_url

    abstract = tree.xpath("//p[@class='abstract']")[0].text
    if abstract != "Abstract Missing":
        entry['abstract'] = abstract

    book_element = tree.xpath("//p[contains(text(), 'Part of:')]")[0]
    book_url = URL_BASE + book_element.xpath('a')[0].attrib['href']

    nominal_year = book_url[-4:]
    year = int(nominal_year)
    if year < 2009:
        year += 1
    entry['year'] = str(year)

    entry['published_in_q'] = YEAR_TO_Q.get(nominal_year, None)

    # All NIPS papers are in English
    entry['language_q'] = "Q1860"

    return entry


def scrape_paper_urls_from_proceedings_url(url):
    """Return paper URLs wrt. to proceedings.

    Parameters
    ----------
    url : str
        HTTPS URL for NIPS proceedings

    Returns
    -------
    urls : list of str
        Scraped URLs for papers in proceedings.

    """
    # Check URL
    url_proceedings_base = URL_BASE + '/book/'
    if url[:len(url_proceedings_base)] != url_proceedings_base:
        raise ValueError('url should begin with {}. It was {}'.format(
            url_proceedings_base, url))

    # Download proceedings HTML
    response = requests.get(url)
    tree = etree.HTML(response.content)

    # Extract paper URLs
    main_element = tree.xpath("(//div[@class='main-container'])[1]")[0]
    paper_elements = main_element.xpath('div/ul/li')
    paper_urls = [URL_BASE + element.xpath('a/@href')[0]
                  for element in paper_elements]

    return paper_urls


def scrape_proceedings_from_url(url):
    """Scrape all papers from proceedings.

    Parameters
    ----------
    url : str
        HTTPS URL for NIPS proceedings

    Returns
    -------
    entries : list of dict
        Scraped papers in list of dictionaries

    """
    paper_urls = scrape_paper_urls_from_proceedings_url(url)

    # Scrape each paper
    entries = []
    for paper_url in paper_urls:
        entry = scrape_paper_from_url(paper_url)
        entries.append(entry)

    return entries


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

    elif arguments['paper-urls-to-quickstatements']:
        filename = arguments['<filename>']

        # Number of seconds to pause between downloads
        pause = 2

        with open(filename) as fid:
            for index, url in enumerate(fid):
                qs = paper_url_to_quickstatements(url.strip())
                os.write(output_file, qs.encode(output_encoding) + b('\n'))
                sleep(pause)

    elif arguments['scrape-paper-from-url']:
        url = arguments['<url>']
        entry = scrape_paper_from_url(url)
        print_(json.dumps(entry))

    elif arguments['scrape-paper-urls-from-proceedings-url']:
        url = arguments['<url>']
        entries = scrape_paper_urls_from_proceedings_url(url)
        for entry in entries:
            os.write(output_file, entry.encode(output_encoding) + b('\n'))

    elif arguments['scrape-proceedings-from-url']:
        url = arguments['<url>']
        entry = scrape_proceedings_from_url(url)
        print_(json.dumps(entry))

    else:
        assert False


if __name__ == "__main__":
    main()
