"""query.

Usage:
  scholia.query arxiv-to-q <arxiv>
  scholia.query cas-to-q <cas>
  scholia.query cordis-to-q <cordis>
  scholia.query count-scientific-articles
  scholia.query doi-to-q <doi>
  scholia.query github-to-q <github>
  scholia.query inchikey-to-q <inchikey>
  scholia.query issn-to-q <issn>
  scholia.query mesh-to-q <meshid>
  scholia.query orcid-to-q <orcid>
  scholia.query q-to-label <q>
  scholia.query viaf-to-q <viaf>
  scholia.query q-to-class <q>
  scholia.query random-author
  scholia.query twitter-to-q <twitter>
  scholia.query website-to-q <url>

Examples
--------
  $ python -m scholia.query orcid-to-q 0000-0001-6128-3356
  Q20980928

  $ python -m scholia.query github-to-q vrandezo
  Q18618629

  $ python -m scholia.query doi-to-q 10.475/123_4
  Q41533080

  $ python -m schoia.query q-to-label Q80
  Tim Berners-Lee

"""


from __future__ import absolute_import, division, print_function

from random import choice

import requests

from simplejson import JSONDecodeError

from six import u

USER_AGENT = 'Scholia'

HEADERS = {'User-Agent': USER_AGENT}


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
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['work']['value'][31:]
            for item in data['results']['bindings']]


def count_scientific_articles():
    """Return count for the number of scientific articles.

    Returns
    -------
    count : int
        Number of scientific articles in Wikidata.

    """
    query = """
        SELECT (COUNT(*) AS ?count) WHERE { [] wdt:P31 wd:Q13442814 }"""

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return int(data['results']['bindings'][0]['count']['value'])


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
    response = requests.get(url, params=params, headers=HEADERS)
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
    response = requests.get(url, params=params, headers=HEADERS)
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
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['author']['value'][31:]
            for item in data['results']['bindings']]


def mesh_to_qs(meshid):
    """Convert MeSH ID to Wikidata ID.

    Parameters
    ----------
    meshid : str
        MeSH identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> mesh_to_qs('D028441') == ['Q33659470']
    True

    """
    query = 'select ?cmp where {{ ?cmp wdt:P486 "{meshid}" }}'.format(
        meshid=meshid)

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['cmp']['value'][31:]
            for item in data['results']['bindings']]


def q_to_label(q, language='en'):
    """Get label for Q item.

    Parameters
    ----------
    q : str
        String with Wikidata Q item.
    language : str
        String with language identifier

    Returns
    -------
    label : str
        String with label corresponding to Wikidata item.

    Examples
    --------
    >>> q_to_label('Q80') == "Tim Berners-Lee"
    True

    """
    query = """SELECT ?label WHERE {{ wd:{q} rdfs:label ?label .
        FILTER (LANG(?label) = "{language}") }}""".format(
        q=q, language=language)

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    results = data['results']['bindings']
    if len(results) == 1:
        return results[0]['label']['value']
    else:
        return None


def search_article_titles(q, search_string=None):
    """Search articles with q item.

    Parameters
    ----------
    q : str
        String with Wikidata Q item.
    search_string : str, optional
        String with query string. If it is not provided then the label of
        q items is used as the query string.

    Returns
    -------
    results : list of dict
        List of dicts with query result.

    Notes
    -----
    This function uses the Egon Willighagen trick with iterating
    over batches of 500'000 thousand articles and performing a search
    in the (scientific) article title for the query string via the `CONTAINS`
    SPARQL function. Case is ignored.

    """
    if search_string is None:
        search_string = q_to_label(q)

    query_template = """
      SELECT
        ?article ?title
      WITH {{
        SELECT ?article WHERE {{
          ?article wdt:P31 wd:Q13442814
        }}
        LIMIT {batch_size}
        OFFSET {offset}
      }} AS %results
      WHERE {{
        INCLUDE %results
        ?article wdt:P1476 ?title .
        MINUS {{ ?article wdt:P921 / wdt:P279* wd:{q} }}
        FILTER (CONTAINS(LCASE(?title), "{label}"))
      }}"""

    # Number of articles and a bit more to account for possible
    # addition during query.
    article_count = count_scientific_articles() + 1000

    url = 'https://query.wikidata.org/sparql'

    batch_size = 500000
    loops = article_count // batch_size + 1

    results = []
    for loop in range(loops):
        offset = loop * batch_size
        query = query_template.format(
            batch_size=batch_size, offset=offset,
            label=search_string.lower(), q=q)

        params = {'query': query, 'format': 'json'}
        response = requests.get(url, params=params, headers=HEADERS)
        data = response.json()
        batch_results = [
            {
                'title': item['title']['value'],
                'q': item['article']['value'][31:]
            }
            for item in data['results']['bindings']]
        results.extend(batch_results)
    return results


def search_article_titles_to_quickstatements(q, search_string=None):
    """Search article titles and return quickstatements.

    Parameters
    ----------
    q : str
        String with Wikidata Q identifier.
    search_string : str, optional
        Search string

    Returns
    -------
    quickstatements : str
       String with quickstatement formated commands.

    """
    articles = search_article_titles(q, search_string=search_string)
    quickstatements = u('')
    for article in articles:
        quickstatements += u(
            "{article_q}\twdt:P921\t{topic_q} /* {title} */\n").format(
            article_q=article['q'], topic_q=q, title=article['title'])
    return quickstatements


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
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['author']['value'][31:]
            for item in data['results']['bindings']]


def q_to_class(q):
    """Return Scholia class of Wikidata item.

    The 'class', i.e., which kind of instance, the item is by querying
    the Wikidata Query Service.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    class_ : 'author', 'venue', 'organization', ...
        Scholia class represented as a string.

    Notes
    -----
    The Wikidata Query Service will be queried for P31 value. The value
    is compared against a set of hardcoded matches.

    """
    query = 'select ?class where {{ wd:{q} p:P31/ps:P31 ?class }}'.format(
        q=escape_string(q))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    try:
        data = response.json()
    except JSONDecodeError:
        # If the Wikidata MediaWiki API does not return a proper
        # response, then fallback on nothing.
        classes = []
    else:
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
    elif set(classes).intersection([
            'Q5633421',  # scientific journal
            'Q1143604',  # proceedings
    ]):
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
            'Q170584',  # project
            'Q1298668',  # research project
    ]):
        class_ = 'project'
    elif set(classes).intersection([
            'Q7187',  # gene
    ]):
        class_ = 'gene'
    elif set(classes).intersection([
            'Q191067',  # article
            'Q1980247',  # chapter
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
            'Q47258130',  # scientific conference series
            'Q47459256',  # academic workshop series
            ]):
        class_ = 'event_series'
    elif set(classes).intersection([
            'Q1656682',  # event
            'Q27968055',  # recurrent event edition (event in a series)
            ]):
        class_ = 'event'
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
            'Q17339814',  # group of chemical substances
            ]):
        class_ = 'chemical_class'
    elif set(classes).intersection([
            'Q4915012',  # biological pathway
            ]):
        class_ = 'pathway'
    elif set(classes).intersection([
            'Q16521',  # taxon
            ]):
        class_ = 'taxon'
    elif set(classes).intersection([
            'Q46855',  # hackathon
            'Q625994',  # conference
            'Q2020153',  # scientific conference
            'Q40444998',  # akademic workshop
            ]):
        class_ = 'event'
    elif set(classes).intersection([
            'Q7397',  # software
            'Q1172284',  # dataset
            'Q1639024',  # mathematical software
            'Q21127166',  # Java software library
            'Q21129801',  # natural language processing toolkit
            'Q22811662',  # image database
            'Q24529812',  # statistical package
            ]):
        class_ = 'use'
    else:
        query = 'select ?class where {{ wd:{q} wdt:P279+ ?class }}'.format(
            q=escape_string(q))

        url = 'https://query.wikidata.org/sparql'
        params = {'query': query, 'format': 'json'}
        response = requests.get(url, params=params, headers=HEADERS)
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
    response = requests.get(url, params=params, headers=HEADERS)
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
    response = requests.get(url, params=params, headers=HEADERS)
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
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['item']['value'][31:]
            for item in data['results']['bindings']]


def cordis_to_qs(cordis):
    """Convert CORDIS project ID to Wikidata ID.

    Parameters
    ----------
    cordis : str
        CORDIS identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> cordis_to_qs('604134') == ['Q27990087']
    True

    """
    # This query only matches on exact match
    query = """select ?item
               where {{ ?item wdt:P3400 "{cordis}" }}""".format(
        cordis=escape_string(cordis))

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
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
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['item']['value'][31:]
            for item in data['results']['bindings']]


def website_to_qs(url):
    """Convert URL for website to Wikidata ID.

    Parameters
    ----------
    url : str
        URL for official website.

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> url = ("https://papers.nips.cc/paper/"
               "6498-online-and-differentially-private-tensor-decomposition")
    >>> website_to_qs == ['']
    True

    """
    query = 'SELECT ?work WHERE {{ ?work wdt:P856 <{url}> }}'.format(
        url=url.strip())

    url_ = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url_, params=params, headers=HEADERS)
    data = response.json()

    return [item['work']['value'][31:]
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
    response = requests.get(url, params=params, headers=HEADERS)
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

    elif arguments['cordis-to-q']:
        qs = cordis_to_qs(arguments['<cordis>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['count-scientific-articles']:
        count = count_scientific_articles()
        print(count)

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

    elif arguments['mesh-to-q']:
        qs = mesh_to_qs(arguments['<meshid>'])
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

    elif arguments['q-to-label']:
        label = q_to_label(arguments['<q>'])
        print(label)

    elif arguments['random-author']:
        q = random_author()
        print(q)

    elif arguments['twitter-to-q']:
        qs = twitter_to_qs(arguments['<twitter>'])
        if len(qs) > 0:
            print(qs[0])
    elif arguments['website-to-q']:
        qs = website_to_qs(arguments['<url>'])
        if len(qs) > 0:
            print(qs[0])


if __name__ == '__main__':
    main()
