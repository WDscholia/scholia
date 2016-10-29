"""query.

Usage:
  scholia.query orcid-to-q <orcid>
  scholia.query q-to-class <q>
  scholia.query twitter-to-q <twitter>

Examples:
  $ python -m scholia.query orcid-to-q 0000-0001-6128-3356
  Q20980928

"""


from __future__ import absolute_import, division, print_function

import requests


def escape_string(string):
    r"""Escape string to be used in SPARQL query.

    Parameters
    ----------
    string : str
        String to be escaped.

    Returns
    -------
    escaped_string : str
        Excaped string.

    Examples
    --------
    >>> escape_string('"hello"')
    '\\"hello\\"'

    >>> escape_string(r'\"hello"')
    '\\\\\\"hello\\"'

    """
    return string.replace('\\', '\\\\').replace('"', r'\"')


def orcid_to_qs(orcid):
    """Convert orcid to Wikidata ID.

    Parameters
    ----------
    orcid : str
        ORCID identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> orcid_to_qs('0000-0001-6128-3356') == ['Q20980928']
    True

    """
    query = 'select ?author where {{ ?author wdt:P496 "{orcid}" }}'.format(
        orcid=escape_string(orcid))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['author']['value'][31:]
            for item in data['results']['bindings']]


def q_to_class(q):
    """Return Scholia class of Wikidata item.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    class_ : 'author', 'venue', 'organization', ...
        Scholia class represented as a string.

    """
    query = 'select ?class where {{ wd:{q} wdt:P31 ?class }}'.format(
        q=escape_string(q))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()
    classes = [item['class']['value'][31:] for item in data['results']['bindings']] 

    # Hard-coded matching match
    if ('Q5' in classes):  # human
        class_ = 'author'
    elif ('Q2217301' in classes):  # serial (publication series)
        class_ = 'series'
    elif ('Q5633421' in classes):  # scientific journal
        class_ = 'venue'
    elif ('Q2085381' in classes):  # publisher
        class_ = 'publisher'
    elif ('Q13442814' in classes):  # scientific journal
        class_ = 'work'
    elif ('Q3918' in classes):  # university
        class_ = 'organization'
    else:
        class_ = 'topic'

    return class_


def twitter_to_qs(twitter):
    """Convert Twitter account name to Wikidata ID.

    Parameters
    ----------
    twitter : str
        Twitter account identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> twitter_to_qs('utafrith') == ['Q8219']
    True

    """
    query = 'select ?author where {{ ?author wdt:P2002 "{twitter}" }}'.format(
        twitter=escape_string(twitter))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['author']['value'][31:]
            for item in data['results']['bindings']]


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['orcid-to-q']:
        qs = orcid_to_qs(arguments['<orcid>'])
        if len(qs) > 0:
            print(qs[0])
    elif arguments['q-to-class']:
        class_ = q_to_class(arguments['<q>'])
        print(class_)
    elif arguments['twitter-to-q']:
        qs = twitter_to_qs(arguments['<twitter>'])
        if len(qs) > 0:
            print(qs[0])


if __name__ == '__main__':
    main()
