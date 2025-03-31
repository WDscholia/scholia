"""
Module for scraping metadata from OpenReview.net submissions.

This module can be used as a script or imported as a module to extract metadata
from OpenReview.net submissions. It downloads the submission page and extracts
metadata such as title, authors, date of publication, OpenReview submission ID,
PDF link, and license (if available) and output it in the QuickStatement
format.

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
from ..query import escape_string


SPARQL_ENDPOINT = config['query-server'].get('sparql_endpoint')

USER_AGENT = config['requests'].get('user_agent')

HEADERS = {'User-Agent': USER_AGENT}

PAPER_TO_Q_QUERY = """
SELECT ?paper WHERE {{
  OPTIONAL {{ ?label rdfs:label "{title}"@en . }}
  OPTIONAL {{ ?title wdt:P1476 "{title}"@en . }}
  OPTIONAL {{ ?full_text_url wdt:P953 <{url}> . }}
  OPTIONAL {{ ?url wdt:P856 <{url}> . }}
  OPTIONAL {{ ?openreview wdt:P8968 "{openreview_id}" . }}
  BIND(COALESCE(?openreview, ?full_text_url, ?url, ?label, ?title, ?doi)
    AS ?paper)
}}
"""


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
    This function might be used to test if a scraped OpenReview paper is
    already present in Wikidata.

    The match on title is using an exact query, meaning that any variation in
    lowercase/uppercase will not find the Wikidata item.

    Examples
    --------
    >>> paper = {
    ...     'title': 'Gradients of Functions of Large Matrices',
    ...     'url': 'https://openreview.net/forum?id=RL4FXrGcTw',
    ...     'openreview_id': 'RL4FXrGcTw'}
    >>> paper_to_q(paper)
    'Q130601472'

    """
    title = escape_string(paper['title'])
    query = PAPER_TO_Q_QUERY.format(
        title=title,
        url=paper['url'],
        openreview_id=paper['openreview_id'])

    response = requests.get(SPARQL_ENDPOINT,
                            params={'query': query, 'format': 'json'},
                            headers=HEADERS)
    data = response.json()['results']['bindings']

    if len(data) == 0 or not data[0]:
        # Not found
        return None

    return str(data[0]['paper']['value'][31:])


def html_to_paper(html):
    """Extract metadata from the OpenReview.net submission page HTML.

    Return a dictionary with metadata about a submissions scrape from the HTML
    at a page on OpenReview.net corresponding to a paper.

    Parameters
    ----------
    html : str
        The HTML content of the OpenReview.net submission page.

    Returns
    -------
    dict
        A dictionary containing metadata about the submission.

    Notes
    -----
    The function with look at the JSON in the HTML. If title and author are not
    found in JSON the the metatags are examined, citation_title and
    citation_author.

    The paper is not matched to proceedings.

    Examples
    --------
    >>> html = paper_url_to_html('https://openreview.net/forum?id=aVh9KRZdRk')
    >>> paper = html_to_paper(html)
    >>> paper['title'].startswith('Learning to grok')
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

        return None

    tree = etree.HTML(html)
    data = {}

    # Find the script tag with id="__NEXT_DATA__"
    script_elements = tree.xpath('//script[@id="__NEXT_DATA__"]')
    if script_elements:
        json_text = script_elements[0].text
        json_data = json.loads(json_text)
        # Navigate through the JSON to get to the content
        content = json_data.get(
            'props', {}).get(
                'pageProps', {}).get('forumNote', {}).get('content', {})

        if 'title' in content and 'value' in content['title']:
            data['title'] = content['title']['value']
        if 'authors' in content and 'value' in content['authors']:
            data['authors'] = content['authors']['value']
        if 'abstract' in content and 'value' in content['abstract']:
            data['abstract'] = content['abstract']['value']

        forum_note = json_data.get('props', {}).get('pageProps',
                                                    {}).get('forumNote', {})
        if 'id' in forum_note:
            data['openreview_id'] = forum_note['id']
            data['url'] = 'https://openreview.net/forum?id=' + forum_note['id']
            data['full_text_url'] = 'https://openreview.net/pdf?id=' + \
                forum_note['id']
        if 'pdate' in forum_note:
            pdate = forum_note['pdate']
            # pdate is in milliseconds since epoch
            dt = datetime.datetime.utcfromtimestamp(pdate / 1000)
            data['date'] = dt.date().isoformat()
        if 'licence' in forum_note:
            data['license'] = forum_note['license']

    # Look for JSON. However, JSON seems not always to be available.
    # For instance https://openreview.net/forum?id=0g0X4H8yN4I
    # Instead we at the metadags

    if 'authors' not in data:
        authors = [
            author_element.attrib['content']
            for author_element in tree.xpath("//meta[@name='citation_author']")
        ]
        if len(authors) > 0:
            data['authors'] = authors
        else:
            authors = [
                author_element.attrib['content']
                for author_element in
                tree.xpath("//meta[@name='DC.Creator.PersonalName']")
            ]
            if len(authors) > 0:
                data['authors'] = authors

    if 'title' not in data:
        title = _fields_to_content(['citation_title', 'DC.Title',
                                    'DC.Title.Alternative'])
        if title:
            data['title'] = title

    return data


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['paper-url-to-quickstatements']:
        url = arguments['<url>']
        html = paper_url_to_html(url)
        paper = html_to_paper(html)

        q = paper_to_q(paper)
        if q:
            print(f"# {url} is http://www.wikidata.org/entity/{q}")
        else:
            # Output the data in QuickStatement format or as needed
            qs = paper_to_quickstatements(paper)
            print(qs)

    else:
        assert False


if __name__ == '__main__':
    main()
