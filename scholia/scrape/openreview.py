"""
Module for scraping metadata from OpenReview.net submissions.

This module can be used as a script or imported as a module to extract metadata
from OpenReview.net submissions. It downloads the submission page and extracts
metadata such as title, authors, date of publication, OpenReview submission ID,
PDF link, and license (if available) and output it in the QuickStatement format.

Usage:
  scholia.scrape.openreview paper-url-to-quickstatements <url>

As a module:
  html = paper_url_to_html('aVh9KRZdRk')
  data = html_to_paper(html)

"""

import datetime
import json

from lxml import etree

import requests

from ..config import config 
from ..qs import paper_to_quickstatements


USER_AGENT = config['requests'].get('user_agent')


def paper_url_to_html(identifier):
    """Download the HTML content from an OpenReview.net submission page.

    Parameters
    ----------
    identifier : str
        The URL or the submission ID of the OpenReview.net submission.

    Returns
    -------
    str
        The HTML content of the page.

    Examples
    --------
    >>> html = paper_url_to_html('https://openreview.net/forum?id=aVh9KRZdRk')

    """
    if identifier.startswith('http'):
        url = identifier
    else:
        url = f'https://openreview.net/forum?id={identifier}'
    headers = {'User-Agent': USER_AGENT}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.text


def html_to_paper(html):
    """Extract metadata from the OpenReview.net submission page HTML.

    Parameters
    ----------
    html : str
        The HTML content of the OpenReview.net submission page.

    Returns
    -------
    dict
        A dictionary containing metadata about the submission.

    Examples
    --------
    >>> html = paper_url_to_html('https://openreview.net/forum?id=aVh9KRZdRk')
    >>> paper = html_to_paper(html)
    >>> paper['title'].startswith('Learning to grok')
    True

    """
    tree = etree.HTML(html)
    data = {}

    # Find the script tag with id="__NEXT_DATA__"
    script_elements = tree.xpath('//script[@id="__NEXT_DATA__"]')
    if script_elements:
        json_text = script_elements[0].text
        json_data = json.loads(json_text)
        # Navigate through the JSON to get to the content
        content = json_data.get('props', {}).get('pageProps', {}).get('forumNote', {}).get('content', {})

        if 'title' in content and 'value' in content['title']:
            data['title'] = content['title']['value']
        if 'authors' in content and 'value' in content['authors']:
            data['authors'] = content['authors']['value']
        if 'abstract' in content and 'value' in content['abstract']:
            data['abstract'] = content['abstract']['value']
       
        forum_note = json_data.get('props', {}).get('pageProps', {}).get('forumNote', {})
        if 'id' in forum_note:
            data['openreview_id'] = forum_note['id']
            data['url'] = 'https://openreview.net/forum?id=' + forum_note['id']
            data['full_text_url'] = 'https://openreview.net/pdf?id=' + forum_note['id']
        if 'pdate' in forum_note:
            pdate = forum_note['pdate']
            # pdate is in milliseconds since epoch
            dt = datetime.datetime.utcfromtimestamp(pdate / 1000)
            data['date'] = dt.date().isoformat()
        if 'licence' in forum_note:
            data['license'] = forum_note['license']
            
    return data


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)
    
    if arguments['paper-url-to-quickstatements']:
        url = arguments['<url>']
        html = paper_url_to_html(url)
        paper = html_to_paper(html)
    
        # Output the data in QuickStatement format or as needed
        qs = paper_to_quickstatements(paper)
        print(qs)
        
    else:
        assert False

if __name__ == '__main__':
    main()
