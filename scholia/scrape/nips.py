"""Scraper for NIPS.

Usage:
  scholia.scrape.nips scrape-url <url>

"""

from six import print_

import json

from lxml import etree

import requests


YEAR_TO_Q = {
    "2017": "Q39502823",
}


def scrape_paper_from_url(url):
    """Scrape NIPS paper from url

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
    url_paper_base = "https://papers.nips.cc/paper/"
    if url[:29] != url_paper_base:
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
    book_url = 'https://paper.nips.cc' + \
               book_element.xpath('a')[0].attrib['href']

    year = book_url[-4:]
    entry['year'] = year

    entry['published_in_q'] = YEAR_TO_Q.get(year, None)

    return entry


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['scrape-url']:
        url = arguments['<url>']
        entry = scrape_paper_from_url(url)
        print_(json.dumps(entry))
    else:
        assert False


if __name__ == "__main__":
    main()
