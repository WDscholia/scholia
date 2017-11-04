"""rss

Usage:
  scholia.rss author-latest <q>


Description:
  Interface to the Wikidata API and its bibliographic data.

Examples:
  $ python -m scholia.rss author-latest Q27061849
  <rss />

"""


from __future__ import print_function

import requests
from dateutil.parser import parse as parse_datetime
from email.utils import formatdate
import time
# from uuid import uuid3, NAMESPACE_URL

SPARQL_QUERY = """
PREFIX bd: <http://www.bigdata.com/rdf#>
SELECT ?work ?workLabel ?date
WITH {{
  SELECT
    (MIN(?dates) AS ?date) ?work
  WHERE {{
    ?work wdt:P50 wd:{q} .
    ?work wdt:P577 ?datetimes .
    BIND(xsd:date(?datetimes) AS ?dates)
  }}
  GROUP BY ?work ?workLabel
  ORDER BY DESC(?date)
  LIMIT 10
}} AS %content {{
  INCLUDE %content
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
}} ORDER BY DESC(?date)
"""

VENUE_SPARQL_QUERY = """
PREFIX bd: <http://www.bigdata.com/rdf#>
SELECT ?work ?workLabel ?date
WITH {{
  SELECT
    (MIN(?dates) AS ?date) ?work
  WHERE {{
    ?work wdt:P50 wd:{q} .
    ?work wdt:P577 ?datetimes .
    BIND(xsd:date(?datetimes) AS ?dates)
  }}
  GROUP BY ?work ?workLabel
  ORDER BY DESC(?date)
  LIMIT 10
}} AS %content {{
  INCLUDE %content
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
}} ORDER BY DESC(?date)
"""

def _value(item, field):
    return item[field]['value'] if field in item else ''

def wb_get_author_latest_articles(q):
    if not q:
        return {}

    rssBody = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rssBody += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rssBody += '<channel>\n'
    rssBody += ' <title>Scholia - Latest Articles by ' + q + '</title>\n'
    rssBody += ' <description>The author''s most recent articles</description>\n'
    rssBody += ' <link>https://tools.wmflabs.org/scholia/</link>\n'
    rssBody += ' <atom:link href="https://tools.wmflabs.org/scholia/author/' + q + '/latest/rss" rel="self" type="application/rss+xml" />\n'

    query = SPARQL_QUERY.format(q=q)
    url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    for item in data['results']['bindings']:
        rssBody += '<item>\n'
        rssBody += '  <title>' + _value(item, 'workLabel') + '</title>\n'
        qid = _value(item, 'work').encode('ascii','ignore')[31:]
        url = 'https://tools.wmflabs.org/scholia/work/' + qid
        rssBody += '  <link>' + url + '</link>\n'
        # uuid = uuid3(NAMESPACE_URL, url).urn()
        # rssBody += ('  <guid>' + uuid + '</guid>\n')
        mydate = parse_datetime(_value(item, 'date'))
        nowtuple = mydate.timetuple()
        nowtimestamp = time.mktime(nowtuple)
        rssBody += '  <pubDate>' + formatdate(nowtimestamp) + '</pubDate>\n'
        rssBody += '</item>\n'

    rssBody += '</channel>\n'
    rssBody += '</rss>'
    
    return rssBody


def wb_get_venue_latest_articles(q):
    if not q:
        return {}

    rssBody = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rssBody += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rssBody += '<channel>\n'
    rssBody += ' <title>Scholia - Latest Articles in ' + q + '</title>\n'
    rssBody += ' <description>The venue''s most recent articles</description>\n'
    rssBody += ' <link>https://tools.wmflabs.org/scholia/</link>\n'
    rssBody += ' <atom:link href="https://tools.wmflabs.org/scholia/venue/' + q + '/latest/rss" rel="self" type="application/rss+xml" />\n'

    query = VENUE_SPARQL_QUERY.format(q=q)
    url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    for item in data['results']['bindings']:
        rssBody += '<item>\n'
        rssBody += '  <title>' + _value(item, 'workLabel') + '</title>\n'
        qid = _value(item, 'work').encode('ascii','ignore')[31:]
        url = 'https://tools.wmflabs.org/scholia/work/' + qid
        rssBody += '  <link>' + url + '</link>\n'
        # uuid = uuid3(NAMESPACE_URL, url).urn()
        # rssBody += ('  <guid>' + uuid + '</guid>\n')
        mydate = parse_datetime(_value(item, 'date'))
        nowtuple = mydate.timetuple()
        nowtimestamp = time.mktime(nowtuple)
        rssBody += '  <pubDate>' + formatdate(nowtimestamp) + '</pubDate>\n'
        rssBody += '</item>\n'

    rssBody += '</channel>\n'
    rssBody += '</rss>'

    return rssBody

def main():
    """Handle command-line arguments."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['author-latest']:
        q = arguments['<q>']
        print(wb_get_author_latest_articles(q))


if __name__ == '__main__':
    main()
