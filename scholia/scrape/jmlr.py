"""Scraper for Journal of Machine Learning Research.

Usage:
  scholia.scrape.jlmr scrape
  scholia.scrape.jlmr load-and-print <file>

"""

import json

from re import findall, sub, UNICODE

from docopt import docopt

from lxml import etree

import requests


class Jmrl(object):
    """Scraper for Journal of Machine Learning Research."""

    def __init__(self):
        self.entries = []

    def load(self, filename):
        """Load scrape papers from file.

        Parameters
        ----------
        filename : str
            Filename for JSON file.

        """
        self.entries = json.load(open(filename))

    def scrape_paper_from_url(self, url):
        entry = {'homepage': url}
        entry['volume'] = url.split('/')[4][1:]
        response = requests.get(url)
        tree = etree.HTML(response.content)
        content_element = tree.xpath("//div[@id='content']")[0]
        texts = [text for text in content_element.itertext()]
        entry['title'] = texts[1]
        entry['authors'] = texts[3]
        volume, month_string, pages, year = findall(
            '; \n(\d+)\((.{3})\):(\d+-\d+), (\d{4})', texts[4])[0]
        entry['pages'] = pages
        entry['year'] = year
        entry['month_string'] = month_string
        abstract = texts[7].strip()
        abstract = sub('\s+', ' ', abstract, flags=UNICODE)
        entry['abstract'] = abstract
        return entry

    def scrape_papers(self):
        entries = []
        for volume in range(1, 2):
            url = 'http://jmlr.org/papers/v{}'.format(volume)
            response = requests.get(url)
            tree = etree.HTML(response.content)

            elements = tree.xpath('//a')
            for element in elements:
                if element.text == '[abs]':
                    paper_url = url + '/' + element.attrib['href']
                    entry = self.scrape_paper_from_url(paper_url)
                    entries.append(entry)
        return entries


def main():
    jmlr = Jmrl()

    arguments = docopt(__doc__)

    if arguments['scrape']:
        print(json.dumps(jmlr.scrape_papers()))


if __name__ == '__main__':
    main()
