"""Scraper for NIPS.

Usage:
  scholia.scrape.nips scrape-paper-from-url <url>
  scholia.scrape.nips scrape-paper-urls-from-proceedings-url <url>
  scholia.scrape.nips scrape-proceedings-from-url <url>
  scholia.scrape.nips paper-url-to-q <url>
  scholia.scrape.nips paper-url-to-quickstatements <url>

"""

from six import print_, u

import json

from lxml import etree

import requests


PAPER_TO_Q_QUERY = u("""
SELECT ?paper WHERE {{
  OPTIONAL {{ ?label rdfs:label "{label}"@en . }}
  OPTIONAL {{ ?title wdt:P1476 "{title}"@en . }}
  OPTIONAL {{ ?url wdt:P856 <{full_text_url}> . }}
  OPTIONAL {{ ?full_text_url wdt:P953 <{url}> . }}
  BIND(COALESCE(?full_text_url, ?url, ?label, ?title) AS ?paper)
}}
""")

URL_BASE = "https://papers.nips.cc"

WDQS_URL = 'https://query.wikidata.org/sparql'

YEAR_TO_Q = {
    "2017": "Q39502823",
    "2016": "Q30715037",
    "2015": "Q28374318",
    "2014": "Q28949180",
    "2013": "Q28709138",
    "2012": "Q32962684",
    "2011": "Q43904402",
    "2010": "Q43904497",
}


def escape_string(string):
    """Escape string.

    Parameters
    ----------
    string : str
        String to be escaped

    Returns
    -------
    escaped_string : str
        Escaped string

    Examples
    --------
    >>> string = 'String with " in it'
    >>> escape_string(string)

    """
    return string.replace(r'\\', r'\\\\').replace('"', r'\"')


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
    Q39502823

    """
    title = escape_string(paper['title'])
    query = PAPER_TO_Q_QUERY.format(
        label=title, title=title,
        url=paper['url'], full_text_url=paper['full_text_url'])

    response = requests.get(WDQS_URL,
                            params={'query': query, 'format': 'json'})
    data = response.json()['results']['bindings']

    if len(data) == 0 or not data[0]:
        # Not found
        return None

    return data[0]['paper']['value'][31:]


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
               'efficient-word-representations')
    >>> paper_url_to_q(url)
    Q39502823

    """
    paper = scrape_paper_from_url(url)
    q = paper_to_q(paper)
    return q


def paper_to_quickstatements(paper):
    """Convert paper to Quickstatements.

    Convert a NIPS paper represented as a dict in to Magnus Manske's
    Quickstatement format for entry into Wikidata.

    Parameters
    ----------
    paper : dict
        Scraped paper represented as a dict.

    Returns
    -------
    qs : str
        Quickstatements as a string

    References
    ----------
    https://tools.wmflabs.org/wikidata-todo/quick_statements.php

    """
    qs = u("CREATE\n")

    title = escape_string(paper['title'])
    qs += u('LAST\tLen\t"{}"\n').format(title)

    # Instance of scientific article
    qs += 'LAST\tP31\tQ13442814\n'

    # Title
    qs += u('LAST\tP1476\ten:"{}"\n').format(title)

    # Authors
    for n, author in enumerate(paper['authors'], start=1):
        qs += u('LAST\tP2093\t"{}"\tP1545\t"{}"\n').format(author, n)

    # Published in
    qs += 'LAST\t577\t+{}-01-01T00:00:00Z/9\n'.format(paper['year'])

    # Language
    qs += 'LAST\tP407\tQ1860\n'

    # Homepage
    qs += 'LAST\tP856\t"{}"\n'.format(paper['url'])

    # Fulltext URL
    qs += 'LAST\tP953\t"{}"\n'.format(paper['full_text_url'])

    # Published in
    qs += 'LAST\tP1433\t{}\n'.format(paper['published_in_q'])

    return qs


def paper_url_to_quickstatements(url):
    """Return Quickstatements for paper URL.

    Parameters
    ----------
    url : str
        URL to NIPS paper.

    Returns
    -------
    qs : str
        Paper formatted as Quickstatements.

    """
    paper = scrape_paper_from_url(url)
    qs = paper_to_quickstatements(paper)
    return qs


def scrape_paper_from_url(url):
    """Scrape NIPS paper from uURL.

    Download HTML page from https://papers.nips.cc/paper/, extract and return
    bibliographic metadata.

    Parameters
    ----------
    url : str
        URL to NIPS paper. Should start with https://papers.nips.cc/paper/

    Returns
    -------
    paper : dict
        Dictionary with paper.

    """
    url_paper_base = URL_BASE + "/paper/"
    if url[:len(url_paper_base)] != url_paper_base:
        raise ValueError("url should start with " + url_paper_base)

    entry = {'url': url}

    response = requests.get(url)
    tree = etree.HTML(response.content)

    entry['title'] = tree.xpath("//h2[@class='subtitle']")[0].text

    authors_element = tree.xpath("//ul[@class='authors']")[0]
    entry['authors'] = [element.text
                        for element in authors_element.xpath('li/a')]

    full_text_url = tree.xpath("//a[text()='[PDF]']")[0].attrib['href']
    entry['full_text_url'] = 'https://papers.nips.cc' + full_text_url

    entry['abstract'] = tree.xpath("//p[@class='abstract']")[0].text

    book_element = tree.xpath("//p[contains(text(), 'Part of:')]")[0]
    book_url = URL_BASE + book_element.xpath('a')[0].attrib['href']

    year = book_url[-4:]
    entry['year'] = year

    entry['published_in_q'] = YEAR_TO_Q.get(year, None)

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
        raise ValueError('url should begin with {}'.format(
            url_proceedings_base))

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

    if arguments['paper-url-to-q']:
        url = arguments['<url>']
        entry = paper_url_to_q(url)
        print_(entry)

    elif arguments['paper-url-to-quickstatements']:
        url = arguments['<url>']
        qs = paper_url_to_quickstatements(url)
        print_(qs)

    elif arguments['scrape-paper-from-url']:
        url = arguments['<url>']
        entry = scrape_paper_from_url(url)
        print_(json.dumps(entry))

    elif arguments['scrape-paper-urls-from-proceedings-url']:
        url = arguments['<url>']
        entry = scrape_paper_urls_from_proceedings_url(url)
        print_(json.dumps(entry))

    elif arguments['scrape-proceedings-from-url']:
        url = arguments['<url>']
        entry = scrape_proceedings_from_url(url)
        print_(json.dumps(entry))
    else:
        assert False


if __name__ == "__main__":
    main()
