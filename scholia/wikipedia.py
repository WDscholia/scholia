"""wikipedia.

Usage:
  scholia.wikipedia q-to-bibliography-templates <q> [options]

Options:
  --debug             Debug messages.
  -h --help           Help message
  --oe=encoding       Output encoding [default: utf-8]
  -o --output=<file>  Output filename, default output to stdout
  --verbose           Verbose messages.

Examples
--------
  $ python -m scholia.wikipedia q-to-bibliography-templates --debug Q20980928

"""


from __future__ import absolute_import, print_function

import logging

import os
from os import write

import signal

import requests

from six import b, u


BIBLIOGRAPHY_SPARQL_QUERY = """
select ?work ?title ?venueLabel ?date ?volume ?issue ?pages
       ?license ?doi ?url ?type where {{
  ?work wdt:P50 wd:{q} .
  ?work wdt:P1476 ?title .
  optional {{ ?work wdt:P31 ?type . }}
  optional {{ ?work wdt:P1433 ?venue . }}
  optional {{ ?work wdt:P577 ?date . }}
  optional {{ ?work wdt:P478 ?volume . }}
  optional {{ ?work wdt:P433 ?issue . }}
  optional {{ ?work wdt:P304 ?pages . }}
  optional {{ ?work wdt:P275 ?license_ .
              ?license_ rdfs:label ?license .
              filter(lang(?license) = 'en') }}
  optional {{ ?work wdt:P356 ?doi . }}
  optional {{ ?work wdt:P953 ?url . }}
  service wikibase:label {{
    bd:serviceParam wikibase:language "en,da,no,sv,de,fr,es,ru,jp,ru,zh" . }}
}}
order by desc(?date)
"""

CITE_JOURNAL_TEMPLATE = u("""
* {{{{Cite journal
  | title = {title}
  | journal = {journal}
  | date = {date}
  | volume = {volume}
  | issue = {issue}
  | pages = {pages}
  | doi = {doi}
  | url = {url}
}}}}""")


CITE_NEWS_TEMPLATE = u("""
* {{{{Cite news
  | title = {title}
  | work = {work}
  | date = {date}
  | url = {url}
}}}}""")


def _value(item, field):
    return item[field]['value'] if field in item else ''


def q_to_bibliography_templates(q):
    """Construct bibliography for Wikidata based on Wikidata identifier.

    Parameters
    ----------
    q : str
        String with Wikidata item identifier.

    Returns
    -------
    wikitext : str
        String with wikipedia template formatted bibliography.

    References
    ----------
    https://en.wikipedia.org/wiki/Template:Cite_journal

    Examples
    --------
    >>> wikitext = q_to_bibliography_templates("Q28923929")
    >>> wikitext.find('Cite journal') != -1
    True

    """
    query = BIBLIOGRAPHY_SPARQL_QUERY.format(q=q)
    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    wikitext = ('<!-- Generated with scholia.wikipedia '
                'q-to-bibliography-templates {q}\n').format(q=q)
    wikitext += ('     or http://scholia.toolforge.org/'
                 'q-to-bibliography-templates?q={q} -->\n').format(q=q)
    for item in data['results']['bindings']:
        if (_value(item, 'type').endswith('Q5707594') or
                _value(item, 'type').endswith('Q17928402')):
            # news article or blog post
            wikitext += CITE_NEWS_TEMPLATE.format(
                title=_value(item, 'title'),
                work=_value(item, 'venueLabel'),
                date=_value(item, 'date').split('T')[0],
                url=_value(item, 'url'),
            )
        else:
            wikitext += CITE_JOURNAL_TEMPLATE.format(
                title=_value(item, 'title'),
                journal=_value(item, 'venueLabel'),
                volume=_value(item, 'volume'),
                issue=_value(item, 'issue'),
                date=_value(item, 'date').split('T')[0],
                pages=_value(item, 'pages'),
                license=_value(item, 'license'),
                doi=_value(item, 'doi'),
                url=_value(item, 'url'),
            )

    return wikitext


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    logging_level = logging.WARN
    if arguments['--debug']:
        logging_level = logging.DEBUG
    elif arguments['--verbose']:
        logging_level = logging.INFO

    logger = logging.getLogger()
    logger.setLevel(logging_level)
    logging_handler = logging.StreamHandler()
    logging_handler.setLevel(logging_level)
    logging_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logging_handler.setFormatter(logging_formatter)
    logger.addHandler(logging_handler)

    # Ignore broken pipe errors
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)

    if arguments['--output']:
        output_filename = arguments['--output']
        output_file = os.open(output_filename, os.O_RDWR | os.O_CREAT)
    else:
        # stdout
        output_file = 1
    output_encoding = arguments['--oe']

    if arguments['q-to-bibliography-templates']:
        q = arguments['<q>']
        wikitext = q_to_bibliography_templates(q)
        write(output_file, wikitext.encode(output_encoding) + b('\n'))


if __name__ == "__main__":
    main()
