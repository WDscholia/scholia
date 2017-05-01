"""query.

Usage:
  scholia.query orcid-to-q <orcid>
  scholia.query q-to-class <q>
  scholia.query twitter-to-q <twitter>
  scholia.query github-to-q <github>
  scholia.query arxiv-to-q <arxiv>

Examples:
  $ python -m scholia.query orcid-to-q 0000-0001-6128-3356
  Q20980928

  $ python -m scholia.query github-to-q vrandezo
  Q18618629

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


def arxiv_to_qs(arxiv):
    """Convert arxiv ID to Wikidata ID.

    Parameters
    ----------
    arxiv : str
        ArXiv identifier.

    Returns
    -------
    qs : list of str
        List of string with Wikidata IDs.

    Examples
    --------
    >>> arxiv_to_qs('1507.04180') == ['Q27036443']
    True

    """
    query = 'select ?work where {{ ?work wdt:P818 "{arxiv}" }}'.format(
        arxiv=escape_string(arxiv))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['work']['value'][31:]
            for item in data['results']['bindings']]


def doi_to_qs(doi):
    """Convert DOI to Wikidata ID.

    Parameters
    ----------
    doi : str
        DOI identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> doi_to_qs('10.1186/S13321-016-0161-3') == ['Q26899110']
    True

    >>> doi_to_qs('10.1016/j.stem.2016.02.016') == ['Q23008981']
    True

    """
    query = 'select ?work where {{ ?work wdt:P356 "{doi}" }}'.format(
        doi=escape_string(doi.upper()))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['work']['value'][31:]
            for item in data['results']['bindings']]


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

    The 'class', i.e., which kind of instance, the item is.

    The Wikidata Query Service will be queried for P31 value. The value
    is compared against a set of hardcoded matches.

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
    classes = [item['class']['value'][31:]
               for item in data['results']['bindings']]

    # Hard-coded matching match
    if ('Q5' in classes):  # human
        class_ = 'author'
    elif ('Q2217301' in classes or  # serial (publication series)
          'Q27785883' in classes):  # conference proceedings series
        class_ = 'series'
    elif ('Q5633421' in classes or  # scientific journal
          'Q1143604' in classes):  # proceedings
        class_ = 'venue'
    elif ('Q157031' in classes or  # foundation
          'Q10498148' in classes):  # research council
        class_ = 'sponsor'
    elif ('Q2085381' in classes or  # publisher
          'Q479716' in classes):  # university publisher
        class_ = 'publisher'
    elif ('Q13442814' in classes):  # scientific article
        class_ = 'work'
    elif set(classes).intersection([
            'Q7191',  # Nobel prize
            'Q193622',  # order
            'Q230788',  # grant
            'Q378427',  # litarary award
            'Q618779',  # award
            'Q1364556',  # music award
            'Q1407225',  # television award
            'Q1709894',  # journalism award
            'Q1792571',  # art prize
            'Q1829324',  # architecture award
            'Q4220917',  # film award
            'Q11448906',  # science prize
            'Q15383322',  # culture award
    ]):
        class_ = 'award'
    elif set(classes).intersection([
            'Q3918',  # university
            'Q31855',  # research institute
            'Q875538',  # public university
            'Q902104',  # private university
            'Q2467461',  # university department
            'Q3354859',  # collegiate university
            'Q4358176',  # council
            'Q7315155',  # research center
            'Q15936437',  # research university
            'Q23002054',  # "private not-for-profit educational"
            ]):
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
    # This query only matches on exact match
    query = """select ?item
               where {{ ?item wdt:P2002 "{twitter}" }}""".format(
        twitter=escape_string(twitter))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['item']['value'][31:]
            for item in data['results']['bindings']]


def github_to_qs(github):
    """Convert GitHub account name to Wikidata ID.

    Parameters
    ----------
    github : str
        github account identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> github_to_qs('vrandezo') == ['Q18618629']
    True

    """
    # This query only matches on exact match
    query = """select ?item
               where {{ ?item wdt:P2037 "{github}" }}""".format(
        github=escape_string(github))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['item']['value'][31:]
            for item in data['results']['bindings']]


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['arxiv-to-q']:
        qs = arxiv_to_qs(arguments['<arxiv>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['github-to-q']:
        qs = github_to_qs(arguments['<github>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['orcid-to-q']:
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
