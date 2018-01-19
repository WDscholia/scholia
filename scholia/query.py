"""query.

Usage:
  scholia.query arxiv-to-q <arxiv>
  scholia.query cas-to-q <cas>
  scholia.query doi-to-q <doi>
  scholia.query github-to-q <github>
  scholia.query inchikey-to-q <inchikey>
  scholia.query issn-to-q <issn>
  scholia.query orcid-to-q <orcid>
  scholia.query viaf-to-q <viaf>
  scholia.query q-to-class <q>
  scholia.query random-author
  scholia.query twitter-to-q <twitter>

Examples
--------
  $ python -m scholia.query orcid-to-q 0000-0001-6128-3356
  Q20980928

  $ python -m scholia.query github-to-q vrandezo
  Q18618629

  $ python -m scholia.query doi-to-q 10.475/123_4
  Q41533080

"""


from __future__ import absolute_import, division, print_function

from random import choice

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

    Wikidata Query Service is used to resolve the DOI.

    The DOI string is converted to uppercase before any
    query is made. Uppercase DOIs are default in Wikidata.

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


def issn_to_qs(issn):
    """Convert ISSN to Wikidata ID.

    Parameters
    ----------
    issn : str
        ISSN identifier as a string.

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> issn_to_qs('1533-7928') == ['Q1660383']
    True

    """
    query = 'select ?author where {{ ?author wdt:P236 "{issn}" }}'.format(
        issn=escape_string(issn))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['author']['value'][31:]
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


def viaf_to_qs(viaf):
    """Convert VIAF identifier to Wikidata ID.

    Parameters
    ----------
    viaf : str
        VIAF identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> viaf_to_qs('59976288') == ['Q3259614']
    True

    """
    query = 'select ?author where {{ ?author wdt:P214 "{viaf}" }}'.format(
        viaf=escape_string(viaf))

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
    elif set(classes).intersection([
            'Q277759',  # book series
            'Q2217301',  # serial (publication series)
            'Q27785883',  # conference proceedings series
    ]):
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
    elif set(classes).intersection([
            'Q8054',  # protein
    ]):
        class_ = 'protein'
    elif set(classes).intersection([
            'Q7187',  # gene
    ]):
        class_ = 'gene'
    elif set(classes).intersection([
            'Q3331189',  # edition
            'Q13442814',  # scientific article
    ]):
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
            'Q38723',  # higher education institution
            'Q875538',  # public university
            'Q902104',  # private university
            'Q1371037',  # technical university
            'Q2467461',  # university department
            'Q3354859',  # collegiate university
            'Q4358176',  # council
            'Q7315155',  # research center
            'Q15936437',  # research university
            'Q23002054',  # "private not-for-profit educational"
            ]):
        class_ = 'organization'
    elif set(classes).intersection([
            'Q12136',  # disease
            'Q389735',  # cardiovascular system disease
            'Q18965518',  # artery disease
            ]):
        class_ = 'disease'
    elif set(classes).intersection([
            'Q11173',  # chemical compound
            'Q36496',  # ion
            'Q79529',  # chemical substance
            'Q407595',  # metabolite
            'Q2393187',  # molecular entity
            ]):
        class_ = 'chemical'
    elif set(classes).intersection([
            'Q4915012',  # biological pathway
            ]):
        class_ = 'pathway'
    elif set(classes).intersection([
            'Q16521',  # taxon
            ]):
        class_ = 'taxon'
    elif set(classes).intersection([
            'Q7397',  # software
            'Q1639024',  # mathematical software
            'Q21127166',  # Java software library
            'Q21129801',  # natural language processing toolkit
            'Q24529812',  # statistical package
            ]):
        class_ = 'software'
    else:
        query = 'select ?class where {{ wd:{q} wdt:P279+ ?class }}'.format(
            q=escape_string(q))

        url = 'https://query.wikidata.org/sparql'
        params = {'query': query, 'format': 'json'}
        response = requests.get(url, params=params)
        data = response.json()
        parents = [item['class']['value'][31:]
                   for item in data['results']['bindings']]

        if set(parents).intersection([
                'Q11173',  # chemical compound
                'Q79529',  # chemical substance
                ]):
            class_ = 'chemical_class'
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


def inchikey_to_qs(inchikey):
    """Convert InChIKey to Wikidata ID.

    Parameters
    ----------
    inchikey : str
        inchikey identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> inchikey_to_qs('UHOVQNZJYSORNB-UHFFFAOYSA-N') == ['Q2270']
    True

    """
    # This query only matches on exact match
    query = """select ?item
               where {{ ?item wdt:P235 "{inchikey}" }}""".format(
        inchikey=escape_string(inchikey))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['item']['value'][31:]
            for item in data['results']['bindings']]


def cas_to_qs(cas):
    """Convert a CAS registry number to Wikidata ID.

    Parameters
    ----------
    cas : str
        CAS registry number

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> cas_to_qs('50-00-0') == ['Q161210']
    True

    """
    # This query only matches on exact match
    query = """select ?item
               where {{ ?item wdt:P231 "{cas}" }}""".format(
        cas=cas)

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()

    return [item['item']['value'][31:]
            for item in data['results']['bindings']]


def random_author():
    """Return random author.

    Sample a scientific author randomly from Wikidata.

    The SPARQL query is somewhat inefficient returning all
    authors.

    Returns
    -------
    q : str
        Wikidata identifier.

    """
    query = """SELECT DISTINCT ?author WHERE {
       ?work wdt:P31 wd:Q13442814 ; wdt:P50 ?author . }"""
    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()
    authors = [author['author']['value'][31:]
               for author in data['results']['bindings']]
    author = choice(authors)
    return author


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['arxiv-to-q']:
        qs = arxiv_to_qs(arguments['<arxiv>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['cas-to-q']:
        qs = cas_to_qs(arguments['<cas>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['doi-to-q']:
        qs = doi_to_qs(arguments['<doi>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['github-to-q']:
        qs = github_to_qs(arguments['<github>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['inchikey-to-q']:
        qs = inchikey_to_qs(arguments['<inchikey>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['issn-to-q']:
        qs = issn_to_qs(arguments['<issn>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['orcid-to-q']:
        qs = orcid_to_qs(arguments['<orcid>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['viaf-to-q']:
        qs = viaf_to_qs(arguments['<viaf>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['q-to-class']:
        class_ = q_to_class(arguments['<q>'])
        print(class_)

    elif arguments['random-author']:
        q = random_author()
        print(q)

    elif arguments['twitter-to-q']:
        qs = twitter_to_qs(arguments['<twitter>'])
        if len(qs) > 0:
            print(qs[0])


if __name__ == '__main__':
    main()
