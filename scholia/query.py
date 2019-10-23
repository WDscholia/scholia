"""query.

Usage:
  scholia.query arxiv-to-q <arxiv>
  scholia.query cas-to-q <cas>
  scholia.query atomic-symbol-to-q <symbol>
  scholia.query cordis-to-q <cordis>
  scholia.query count-authorships
  scholia.query count-scientific-articles
  scholia.query doi-to-q <doi>
  scholia.query github-to-q <github>
  scholia.query inchikey-to-q <inchikey>
  scholia.query issn-to-q <issn>
  scholia.query lipidmaps-to-q <lmid>
  scholia.query atomic-number-to-q <atomicnumber>
  scholia.query mesh-to-q <meshid>
  scholia.query orcid-to-q <orcid>
  scholia.query pubchem-to-q <cid>
  scholia.query pubmed-to-q <pmid>
  scholia.query q-to-label <q>
  scholia.query q-to-class <q>
  scholia.query random-author
  scholia.query ror-to-q <rorid>
  scholia.query twitter-to-q <twitter>
  scholia.query viaf-to-q <viaf>
  scholia.query website-to-q <url>
  scholia.query wikipathways-to-q <wpid>

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

from random import random

import requests

from simplejson import JSONDecodeError

from six import u

USER_AGENT = 'Scholia'

HEADERS = {'User-Agent': USER_AGENT}

# Instead of of querying common ISO 639 codes, they are just listed here
ISO639_TO_Q = {'en': 'Q1860'}


class QueryResultError(Exception):
    """Generic query error."""

    pass


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


def query_to_bindings(query):
    """Return response bindings from SPARQL query.

    Query the Wikidata Query Service with the given query and return the
    response data as binding.

    Parameters
    ----------
    query : str
        SPARQL query as string

    Returns
    -------
    bindings : list
        Data as list of dicts.

    """
    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return data['results']['bindings']


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


def count_authorships():
    """Count the number of authorships.

    Query the Wikidata Query Service to determine the number of authorships as
    the number of P50 relationships.

    Returns
    -------
    count : int
        Number of authorships.

    Notes
    -----
    The count is determined from the SPARQL query

    `SELECT (COUNT(*) AS ?count) { [] wdt:P50 [] }`

    Examples
    --------
    >>> count_authorships() > 1000000  # More than a million authorships
    True

    """
    query = "SELECT (COUNT(*) AS ?count) { [] wdt:P50 [] }"
    bindings = query_to_bindings(query)
    count = int(bindings[0]['count']['value'])
    return count


def count_scientific_articles():
    """Return count for the number of scientific articles.

    Returns
    -------
    count : int
        #Number of scientific articles in Wikidata.

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


def iso639_to_q(language):
    """Convert ISO639 to Q item.

    Arguments
    ---------
    language : str
        language represented as a ISO 639 format

    Returns
    -------
    q : str or None
        Language represented as a q identifier.

    Examples
    --------
    >>> iso639_to_q('en') == 'Q1860'
    True

    >>> iso639_to_q('dan') == 'Q9035'
    True

    """
    if language in ISO639_TO_Q:
        return ISO639_TO_Q[language]

    # Fallback on query
    if len(language) == 2:
        query = "SELECT * {{ ?language wdt:P218 '{}' }}".format(language)
    elif len(language) == 3:
        query = "SELECT * {{ ?language wdt:P219 '{}' }}".format(language)
    else:
        raise ValueError('ISO639 language code not recognized')

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()
    qs = [item['language']['value'][31:]
          for item in data['results']['bindings']]
    if len(qs) == 1:
        return qs[0]
    elif len(qs) == 0:
        return None
    else:
        # There shouldn't be multiple matching items, so it is not clear
        # what we can do here.
        raise QueryResultError("Multiple matching language found for "
                               "ISO639 code")


def pubchem_to_qs(cid):
    """Convert a PubChem compound identifier (CID) to Wikidata ID.

    Wikidata Query Service is used to resolve the PubChem identifier.

    Parameters
    ----------
    pmid : str
        PubChem compound identifier (CID)

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> pubchem_to_qs('14123361') == ['Q289372']
    True

    """
    query = 'select ?chemical where {{ ?chemical wdt:P662 "{cid}" }}'.format(
        cid=cid)

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['chemical']['value'][31:]
            for item in data['results']['bindings']]


def pubmed_to_qs(pmid):
    """Convert a PubMed identifier to Wikidata ID.

    Wikidata Query Service is used to resolve the PubMed identifier.

    The PubMed identifier string is converted to uppercase before any
    query is made.

    Parameters
    ----------
    pmid : str
        PubMed identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> pubmed_to_qs('29029422') == ['Q42371516']
    True

    """
    query = 'select ?work where {{ ?work wdt:P698 "{pmid}" }}'.format(
        pmid=pmid)

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['work']['value'][31:]
            for item in data['results']['bindings']]


def ror_to_qs(rorid):
    """Convert a ROR identifier to Wikidata ID.

    Wikidata Query Service is used to resolve the ROR identifier.

    Parameters
    ----------
    rorid : str
        ROR identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> ror_to_qs('038321296') == ['Q5566337']
    True

    """
    query = 'select ?work where {{ ?work wdt:P6782 "{rorid}" }}'.format(
        rorid=rorid)

    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['work']['value'][31:]
            for item in data['results']['bindings']]


def wikipathways_to_qs(wpid):
    """Convert a WikiPathways identifier to Wikidata ID.

    Wikidata Query Service is used to resolve the WikiPathways identifier.

    Parameters
    ----------
    wpid : str
        WikiPathways identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> wikipathways_to_qs('WP111') == ['Q28031254']
    True

    """
    query = ('select ?work where {{ VALUES ?wpid {{ "{wpid}" }} '
             '?work wdt:P2410 ?wpid }}').format(
                 wpid=wpid)

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
    query = 'SELECT ?class {{ wd:{q} wdt:P31 ?class }}'.format(
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
    elif ('Q30612' in classes):  # clinical trial
        class_ = 'clinical_trial'
    elif set(classes).intersection([
            'Q277759',  # book series
            'Q2217301',  # serial (publication series)
            'Q27785883',  # conference proceedings series
    ]):
        class_ = 'series'
    elif set(classes).intersection([
            'Q737498',  # academic journal
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
            'Q571',  # book
            'Q191067',  # article
            'Q253623',  # patent
            'Q580922',  # preprint
            'Q1980247',  # chapter
            'Q3331189',  # edition
            'Q5707594',  # news article
            'Q10870555',  # report
            'Q10885494',  # scientific conference paper
            'Q13442814',  # scientific article
            'Q21481766',  # academic chapter
            'Q47461344',  # written work
            'Q54670950',  # conference poster
            'Q58632367',  # conference abstract
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
            'Q414147',  # academy of sciences
            'Q484652',  # international organization
            'Q748019',  # scientific society
            'Q875538',  # public university
            'Q902104',  # private university
            'Q955824',  # learned society
            'Q1371037',  # technical university
            'Q2467461',  # university department
            'Q3354859',  # collegiate university
            'Q4358176',  # council
            'Q7315155',  # research center
            'Q15936437',  # research university
            'Q23002054',  # "private not-for-profit educational"
            'Q29300714',  # international association
            ]):
        class_ = 'organization'
    elif set(classes).intersection([
            'Q15275719',  # recurrent event
            'Q15900647',  # conference series
            'Q47258130',  # scientific conference series
            'Q47459256',  # academic workshop series
            ]):
        class_ = 'event_series'
    elif set(classes).intersection([
            'Q1656682',  # event
            'Q27968055',  # recurrent event edition (event in a series)
            'Q52260246',  # scientific event
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
            'Q11344',  # chemical element
            ]):
        class_ = 'chemical_element'
    elif set(classes).intersection([
            'Q15711994',  # family of isomeric compounds
            'Q17339814',  # group or class of chemical substances
            'Q47154513',  # structural class of chemical compounds
            'Q55499636',  # pharmacological class of chemical compounds
            'Q55640599',  # group of ions
            'Q55662456',  # group of ortho, meta, para isomers
            'Q55662548',  # pair of cis-trans isomers
            'Q55662747',  # pair of enantiomers
            'Q55663030',  # pair of enantiomeric ions
            'Q56256086',  # group of chemical compounds
            'Q56256173',  # class of chemical compounds with similar
                          # applications or functions
            'Q59199015',  # group of stereoisomers
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


def lipidmaps_to_qs(lmid):
    """Convert a LIPID MAPS identifier to Wikidata ID.

    Parameters
    ----------
    lmid : str
        LIPID MAPS identifier

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> lipidmaps_to_qs('LMFA') == ['Q63433687']
    True
    >>> lipidmaps_to_qs('LMFA00000007') == ['Q27114894']
    True

    """
    # This query only matches on exact match
    query = """select ?item
               where {{ ?item wdt:P2063 "{lmid}" }}""".format(
        lmid=lmid)
    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['item']['value'][31:]
            for item in data['results']['bindings']]


def atomic_number_to_qs(atomic_number):
    """Look up a chemical element by atomic number and return a Wikidata ID.

    Parameters
    ----------
    atomic_number : str
        Atomic number.

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> atomic_number_to_qs('6') == ['Q623']
    True

    """
    # This query only matches on exact match
    query = """SELECT ?item
               WHERE {{ ?item wdt:P31 wd:Q11344 ; wdt:P1086 ?number .
                 FILTER (STR(?number) = "{atomic_number}") }}""".format(
        atomic_number=atomic_number)
    url = 'https://query.wikidata.org/sparql'
    params = {'query': query, 'format': 'json'}
    response = requests.get(url, params=params, headers=HEADERS)
    data = response.json()

    return [item['item']['value'][31:]
            for item in data['results']['bindings']]


def atomic_symbol_to_qs(symbol):
    """Look up a chemical element by atomic symbol and return a Wikidata ID.

    Parameters
    ----------
    symbol : str
        Atomic symbol.

    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.

    Examples
    --------
    >>> atomic_symbol_to_qs('C') == ['Q623']
    True

    """
    # This query only matches on exact match
    query = """SELECT ?item
               WHERE {{ ?item wdt:P246 "{symbol}" }}""".format(
        symbol=symbol)
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
    ...        "6498-online-and-differentially-private-tensor-decomposition")
    >>> qs = website_to_qs(url)
    >>> qs == ['Q46994097']
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

    Sample a scientific author randomly from Wikidata by a call to the Wikidata
    Query Service.

    Returns
    -------
    q : str
        Wikidata identifier.

    Notes
    -----
    The SPARQL query is somewhat slow and takes several seconds. It sample
    uniformly among authorships rather than authors. The SPARQL query is this:

    `SELECT ?author {{ [] wdt:P50 ?author . }}`

    The author returned is not necessarily a scholarly author.

    Examples
    --------
    >>> q = random_author()
    >>> q.startswith('Q')
    True

    """
    count = count_authorships()
    offset = int(random() * count)

    query = """SELECT ?author {{ [] wdt:P50 ?author . }}
               OFFSET {} LIMIT 1""".format(offset)
    bindings = query_to_bindings(query)
    q = bindings[0]['author']['value'][31:]
    return q


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['atomic-number-to-q']:
        qs = atomic_number_to_qs(arguments['<atomicnumber>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['arxiv-to-q']:
        qs = arxiv_to_qs(arguments['<arxiv>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['cas-to-q']:
        qs = cas_to_qs(arguments['<cas>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['atomic-symbol-to-q']:
        qs = atomic_symbol_to_qs(arguments['<symbol>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['cordis-to-q']:
        qs = cordis_to_qs(arguments['<cordis>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['count-scientific-articles']:
        count = count_scientific_articles()
        print(count)

    elif arguments['count-authorships']:
        count = count_authorships()
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

    elif arguments['lipidmaps-to-q']:
        qs = lipidmaps_to_qs(arguments['<lmid>'])
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

    elif arguments['pubchem-to-q']:
        qs = pubchem_to_qs(arguments['<cid>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['pubmed-to-q']:
        qs = pubmed_to_qs(arguments['<pmid>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['ror-to-q']:
        qs = ror_to_qs(arguments['<rorid>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['wikipathways-to-q']:
        qs = wikipathways_to_qs(arguments['<wpid>'])
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
