"""Scraper for Journal of Machine Learning Research.

Usage:
  scholia.scrape.jmlr scrape
  scholia.scrape.jmlr scrape-paper-from-url <url>
  scholia.scrape.jmlr paper-url-to-quickstatements <url>

Examples
--------
$ URL=http://www.jmlr.org/papers/v12/pedregosa11a.html
$ python -m scholia.scrape.jmlr scrape-paper-from-url $URL

"""

from __future__ import print_function, unicode_literals

import json

from six.moves.urllib.parse import urlparse

from docopt import docopt

from lxml import etree

import requests

from ..model import Work


class Jmlr(object):
    """Scraper for Journal of Machine Learning Research."""

    def __init__(self):
        """Set up entries."""
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
        """Scrape JMLR paper based on URL.

        Parameters
        ----------
        url : str
            URL to JMLR paper of either the HTML or the PDF.

        Returns
        -------
        entry : dict
            Scraped paper represented as a dict where the field representes,
            e.g., year, title, etc.

        Notes
        -----
        Extracts various bibliographic fields. ISSN is not always present.

        Examples
        --------
        >>> jmlr = Jmlr()
        >>> url = "http://www.jmlr.org/papers/v12/pedregosa11a.html"
        >>> work = jmlr.scrape_paper_from_url(url)
        >>> 'year' in work
        True
        >>> '2011' == work['year']
        True

        """
        parsed_url = urlparse(url)
        if parsed_url.netloc != 'www.jmlr.org':
            message = (
                "URL should contain the 'www.jmlr.org' host: {}"
            ).format(url)
            raise ValueError(message)

        url_directories = urlparse(url).path.split('/')

        if url.endswith('.html'):
            if len(url_directories) != 4:
                message = "Could not interpret URL: {}".format(url)
                raise ValueError(message)
        elif url.endswith('.pdf'):
            if len(url_directories) != 5:
                message = "Could not interpret URL: {}".format(url)
                raise ValueError(message)
            volume = url_directories[2][6:]
            paper_id = url_directories[3]
            url = 'http://www.jmlr.org/papers/v{}/{}.html'.format(
                volume, paper_id)
        else:
            message = "URL should end with html or pdf: {}".format(url)
            raise ValueError(message)

        paper = {'homepage': url}
        paper['volume'] = url.split('/')[4][1:]

        response = requests.get(url)
        tree = etree.HTML(response.content)

        def _get_content(name):
            match = "//meta[@name='citation_{}']".format(name)
            return tree.xpath(match)[0].attrib['content']

        paper['title'] = _get_content('title')
        paper['year'] = _get_content('publication_date')
        paper['published_in_q'] = "Q1660383"

        # ISSN information may apparently be missing for some articles.
        # For instance http://www.jmlr.org/papers/v18/16-365.html
        # For other it is present, e.g.,
        # http://www.jmlr.org/papers/v8/garcia-pedrajas07a.html
        try:
            paper['issn'] = _get_content('issn')[5:]
        except IndexError:
            pass

        paper['month_string'] = _get_content('issue')
        paper['pages'] = (_get_content('firstpage') + "-" +
                          _get_content('lastpage'))
        paper['full_text_url'] = _get_content('pdf_url')
        paper['language_q'] = "Q1860"  # English

        authors = []
        match = "//meta[@name='citation_author']"
        for element in tree.xpath(match):
            author = element.attrib['content']
            if "," in author:
                name_parts = author.split(', ')
                authors.append(name_parts[1] + " " + name_parts[0])
            else:
                authors.append(author)
        paper['authors'] = authors

        return Work(paper)

    def scrape_papers(self):
        """Scrape and return papers.

        Returns
        -------
        entries : list of dict
            Papers represented in a list of dictionaries.

        """
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
    """Handle command-line interface."""
    jmlr = Jmlr()

    arguments = docopt(__doc__)

    if arguments['scrape']:
        print(json.dumps(jmlr.scrape_papers()))

    elif arguments['scrape-paper-from-url']:
        url = arguments['<url>']
        work = jmlr.scrape_paper_from_url(url)
        print(json.dumps(work))

    elif arguments['paper-url-to-quickstatements']:
        url = arguments['<url>']
        work = jmlr.scrape_paper_from_url(url)
        print(work.to_quickstatements())


if __name__ == '__main__':
    main()
