"""rss.

Usage:
  scholia.rss author-latest-works <q>
  scholia.rss venue-latest-works <q>
  scholia.rss topic-latest-works <q>
  scholia.rss organization-latest-works <q>
  scholia.rss sponsor-latest-works <q>

Description:
  Functions related to feed.

Examples
--------
  $ python -m scholia.rss author-latest-works Q27061849
  ...

  $ python -m scholia.rss venue-latest-works Q5936947
  ...

  $ python -m scholia.rss topic-latest-works Q130983
  ...

  $ python -m scholia.rss organization-latest-works Q1137652
  ...

  $ python -m scholia.rss sponsor-latest-works Q1377836

References
----------
  https://validator.w3.org/feed/docs/rss2.html

"""


from __future__ import print_function

import requests

from dateutil.parser import parse as parse_datetime

from email.utils import formatdate

from calendar import timegm

from xml.sax.saxutils import escape

from re import sub

from six import u


WORK_ITEM_RSS = u("""
    <item>
      <title>{title}</title>
      <description>{description}</description>
      <link>{link}</link>
      <pubDate>{pub_date}</pubDate>
    </item>
""")


AUTHOR_WORKS_SPARQL_QUERY = """
SELECT ?work ?workLabel ?date (?published_in AS ?description)
WITH {{
  SELECT
    (MIN(?dates) AS ?date)
    ?work
    (GROUP_CONCAT(?published_in_label; separator=", ") AS ?published_in)
  WHERE {{
    ?work wdt:P50 wd:{q} .
    ?work wdt:P577 ?datetimes .
    BIND(xsd:date(?datetimes) AS ?dates)
    OPTIONAL {{
      ?work wdt:P1433 / rdfs:label ?published_in_label .
      FILTER(LANG(?published_in_label) = 'en')
    }}
  }}
  GROUP BY ?work
  ORDER BY DESC(?date)
  LIMIT 10
}} AS %content {{
  INCLUDE %content
  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language
    "[AUTO_LANGUAGE],en,da,es,fr,jp,nl,no,ru,sv,zh". }}
}}
ORDER BY DESC(?date)
"""

VENUE_SPARQL_QUERY = """
SELECT ?work ?workLabel ?date (?author AS ?description)
WITH {{
  SELECT
    (MIN(?dates) AS ?date)
    ?work
    (GROUP_CONCAT(?author_label; separator=', ') AS ?author)
  WHERE {{
    ?work wdt:P1433 wd:{q} .
    ?work wdt:P577 ?datetimes .
    BIND(xsd:date(?datetimes) AS ?dates)
    OPTIONAL {{
      ?work wdt:P50 / rdfs:label ?author_label .
      FILTER(LANG(?author_label) = 'en')
    }}
  }}
  GROUP BY ?work
  ORDER BY DESC(?date)
  LIMIT 10
}} AS %content {{
  INCLUDE %content
  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
}}
ORDER BY DESC(?date)
"""

TOPIC_SPARQL_QUERY = """
SELECT ?work ?workLabel ?date (?author AS ?description)
WITH {{
  SELECT
    (MIN(?dates) AS ?date)
    ?work
    (GROUP_CONCAT(?author_label; separator=', ') AS ?author)
  WHERE {{
    ?work
      wdt:P921 / (wdt:P361+ | wdt:P1269+ | (wdt:P31* / wdt:P279*) )
      wd:{q} .
    ?work wdt:P577 ?datetimes .
    BIND(xsd:date(?datetimes) AS ?dates)
    OPTIONAL {{
      ?work wdt:P50 / rdfs:label ?author_label .
      FILTER(LANG(?author_label) = 'en')
    }}
  }}
  GROUP BY ?work
  ORDER BY DESC(?date)
  LIMIT 20
}} AS %content {{
  INCLUDE %content
  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
}}
ORDER BY DESC(?date)
"""

ORGANIZATION_SPARQL_QUERY = """
SELECT ?work ?workLabel ?date (?author AS ?description)
WITH {{
  SELECT
    (MIN(?dates) AS ?date)
    ?work
    (GROUP_CONCAT(DISTINCT ?author_label; separator=', ') AS ?author)
  WHERE {{
    ?researcher ( wdt:P108 | wdt:P463 | wdt:P1416 ) / wdt:P361* wd:{q} .
    ?work wdt:P50 ?researcher .
    ?work wdt:P577 ?datetimes .
    BIND(xsd:date(?datetimes) AS ?dates)
    OPTIONAL {{
      ?work wdt:P50 / rdfs:label ?author_label .
      FILTER(LANG(?author_label) = 'en')
    }}
  }}
  GROUP BY ?work
  ORDER BY DESC(?date)
  LIMIT 10
}} AS %content {{
  INCLUDE %content
  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }}
}}
ORDER BY DESC(?date)
"""

SPONSOR_SPARQL_QUERY = """
SELECT ?work ?workLabel ?date (?author AS ?description)
WITH {{
  SELECT
    (MIN(?dates) AS ?date)
    ?work
    (GROUP_CONCAT(DISTINCT ?author_label; separator=', ') AS ?author)
  WHERE {{
    ?work p:P859 ?sponsor_statement ;
          wdt:P577 ?datetimes .
    ?sponsor_statement ps:P859 wd:{q} .
    BIND(xsd:date(?datetimes) AS ?dates)
    OPTIONAL {{
      ?work wdt:P50 / rdfs:label ?author_label .
      FILTER(LANG(?author_label) = 'en')
    }}
  }}
  GROUP BY ?work
  ORDER BY DESC(?date)
  LIMIT 10
}} AS %result
WHERE {{
  INCLUDE %result
  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".
  }}
}} ORDER BY DESC(?date)
"""


def _value(item, field):
    return item[field]['value'] if field in item else ''


def entities_to_works_rss(entities):
    """Convert Wikidata entities to works rss.

    Parameters
    ----------
    entities : list
        List of Wikidata items in nested structure.

    Returns
    -------
    rss : str
        RSS-formatted list of work items.

    """
    rss = u('')
    for entity in entities:
        qid = _value(entity, 'work')[31:]
        url = 'https://tools.wmflabs.org/scholia/work/' + qid
        item_date = parse_datetime(_value(entity, 'date'))

        # Dirty hack to get around the problem with dates before 1900
        old_year = item_date.year
        if old_year < 1900:
            datetime_string = _value(entity, 'date')
            index = datetime_string.index('-')
            datetime_string = "1900" + datetime_string[index:]
            item_date = parse_datetime(datetime_string)

        date_tuple = item_date.timetuple()

        # We should use UTC time here, - not mktime that is local
        timestamp = timegm(date_tuple)

        publication_date = formatdate(timestamp)

        # Continuing dirty hack with setting to old year
        if old_year < 1900:
            publication_date = sub('1900', str(old_year),
                                   publication_date)

        description = _value(entity, 'description')
        rss += WORK_ITEM_RSS.format(
            title=escape(_value(entity, 'workLabel')),
            description=escape(description),
            link=url,
            pub_date=publication_date)
    return rss


def wb_get_author_latest_works(q):
    """Return RSS-formated list of latest work for author.

    Query the Wikidata Query Service for latest work from of the author
    specified with the Wikidata identifier `q`. Return the list formatted as a
    RSS feed.

    Parameters
    ----------
    q : str
        Wikidata identifier.

    Returns
    -------
    rss : str
        Feed in XML.

    Notes
    -----
    The Wikidata Query Service may have problems for dates before 0.
    The SPARQL will fail in such instances [1]_. This function will then
    return an empty list.

    References
    ----------
    .. [1] https://stackoverflow.com/questions/47562736

    """
    if not q:
        return ''

    rss_body = u('<?xml version="1.0" encoding="UTF-8" ?>\n')
    rss_body += '<rss version="2.0" ' + \
                'xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rss_body += '  <channel>\n'
    rss_body += '   <title>Scholia - Latest Articles by ' + q + '</title>\n'
    rss_body += '   <description>The author''s most ' + \
                'recent articles</description>\n'
    rss_body += '   <link>https://tools.wmflabs.org/scholia/</link>\n'
    rss_body += '   <atom:link ' + \
                'href="https://tools.wmflabs.org/scholia/author/' \
                + q + '/latest-works/rss" rel="self" ' + \
                'type="application/rss+xml" />\n'

    query = AUTHOR_WORKS_SPARQL_QUERY.format(q=q)
    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)

    if response.ok:
        data = response.json()
        rss_body += entities_to_works_rss(data['results']['bindings'])
    else:
        # If there are dates before BC then the SPARQL will fails
        pass

    rss_body += '  </channel>\n'
    rss_body += '</rss>'

    return rss_body


def wb_get_venue_latest_works(q):
    """Return feed for latest work from venue.

    Parameters
    ----------
    q : str
        Wikidata identifer

    Returns
    -------
    rss : str
        RSS-formatted feed with latest work from venue.

    """
    if not q:
        return ''

    rss_body = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rss_body += '<rss version="2.0" ' + \
                'xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rss_body += '  <channel>\n'
    rss_body += '    <title>Scholia - Latest articles published in ' + \
                q + '</title>\n'
    rss_body += "    <description>The venue's most " + \
                "recent articles</description>\n"
    rss_body += '    <link>https://tools.wmflabs.org/scholia/venue/</link>\n'
    rss_body += '    <atom:link ' + \
                'href="https://tools.wmflabs.org/scholia/venue/' + \
                q + '/latest-works/rss" rel="self" ' + \
                'type="application/rss+xml" />\n'

    query = VENUE_SPARQL_QUERY.format(q=q)
    url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    rss_body += entities_to_works_rss(data['results']['bindings'])

    rss_body += '  </channel>\n'
    rss_body += '</rss>'

    return rss_body


def wb_get_topic_latest_works(q):
    """Return feed for latest work on topic.

    Parameters
    ----------
    q : str
        Wikidata identifier

    Returns
    -------
    rss : str
        RSS-formatted feed with latest work on topic.

    """
    if not q:
        return ''

    rss_body = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rss_body += '<rss version="2.0" ' + \
                'xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rss_body += '  <channel>\n'
    rss_body += '    <title>Scholia - Latest Articles for ' + q + '</title>\n'
    rss_body += "    <description>The topic's most " + \
                "recent articles</description>\n"
    rss_body += '    <link>https://tools.wmflabs.org/scholia/</link>\n'
    rss_body += '    <atom:link ' + \
                'href="https://tools.wmflabs.org/scholia/topic/' \
                + q + '/latest-works/rss" rel="self" ' + \
                'type="application/rss+xml" />\n'

    query = TOPIC_SPARQL_QUERY.format(q=q)
    url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    rss_body += entities_to_works_rss(data['results']['bindings'])

    rss_body += '</channel>\n'
    rss_body += '</rss>'

    return rss_body


def wb_get_organization_latest_works(q):
    """Return feed for latest work from an organization.

    Parameters
    ----------
    q : str
        Wikidata identifer

    Returns
    -------
    rss : str
        RSS-formatted feed with latest work from an organization.

    """
    if not q:
        return ''

    rss_body = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rss_body += '<rss version="2.0" ' + \
                'xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rss_body += '  <channel>\n'
    rss_body += '    <title>Scholia - Latest articles published by ' + \
                q + '</title>\n'
    rss_body += "    <description>The organization's most " + \
                "recent articles</description>\n"
    rss_body += ('    <link>https://tools.wmflabs.org/'
                 'scholia/organization/</link>\n')
    rss_body += '    <atom:link ' + \
                'href="https://tools.wmflabs.org/scholia/organization/' + \
                q + '/latest-works/rss" rel="self" ' + \
                'type="application/rss+xml" />\n'

    query = ORGANIZATION_SPARQL_QUERY.format(q=q)
    url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    rss_body += entities_to_works_rss(data['results']['bindings'])

    rss_body += '  </channel>\n'
    rss_body += '</rss>'

    return rss_body


def wb_get_sponsor_latest_works(q):
    """Return feed for latest work from a sponsor.

    Parameters
    ----------
    q : str
        Wikidata identifer

    Returns
    -------
    rss : str
        RSS-formatted feed with latest work from a sponsor.

    """
    if not q:
        return ''

    rss_body = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rss_body += '<rss version="2.0" ' + \
                'xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rss_body += '  <channel>\n'
    rss_body += '    <title>Scholia - Latest articles sponsored by ' + \
                q + '</title>\n'
    rss_body += "    <description>The sponsor's most " + \
                "recent articles</description>\n"
    rss_body += ('    <link>https://tools.wmflabs.org/'
                 'scholia/sponsor/</link>\n')
    rss_body += '    <atom:link ' + \
                'href="https://tools.wmflabs.org/scholia/sponsor/' + \
                q + '/latest-works/rss" rel="self" ' + \
                'type="application/rss+xml" />\n'

    query = SPONSOR_SPARQL_QUERY.format(q=q)
    url = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    rss_body += entities_to_works_rss(data['results']['bindings'])

    rss_body += '  </channel>\n'
    rss_body += '</rss>'

    return rss_body


def main():
    """Handle command-line arguments."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['author-latest-works']:
        q = arguments['<q>']
        # TODO: UTF-8 encoding for Python 2
        print(wb_get_author_latest_works(q))
    elif arguments['topic-latest-works']:
        q = arguments['<q>']
        print(wb_get_topic_latest_works(q))
    elif arguments['venue-latest-works']:
        q = arguments['<q>']
        print(wb_get_venue_latest_works(q))
    elif arguments['organization-latest-works']:
        q = arguments['<q>']
        print(wb_get_organization_latest_works(q))
    elif arguments['sponsor-latest-works']:
        q = arguments['<q>']
        print(wb_get_sponsor_latest_works(q))
    else:
        assert False


if __name__ == '__main__':
    main()
