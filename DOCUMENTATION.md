Module api
==========
api.

Usage:
  scholia.api get <qs>...
  scholia.api q-to-classes <q>
  scholia.api q-to-name <q>
  scholia.api search [options] <query>

Options:
  --limit=<limit>  Number of search results to return [default: 10]

Description:
  Interface to the Wikidata API and its bibliographic data.

Examples
--------
  $ python -m scholia.api get Q26857876 Q21172284 | wc
      2    1289   16174

  $ python -m scholia.api q-to-classes Q28133147
  Q13442814

Functions
---------

    
`entity_to_authors(entity, return_humanness=False)`
:   Extract authors from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    return_humanness : bool
        Toogle whether return argument should contain be a list of strings or a
        list of tuples with both name and an indication of whether the author
        is a human. Some authors are organizations and formatting of authors
        may need to distinguish between humans and organizations.
    
    Returns
    -------
    authors : list of str or list of two-tuple
        List with each element representing an author. Each element may either
        be a string with the author name or a tuple with the author name and
        a boolean indicating humanness of the author.

    
`entity_to_classes(entity)`
:   Extract 'instance_of' classes.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    classes : list of str
        List of strings.
    
    Examples
    --------
    >>> entities = wb_get_entities(['Q28133147'])
    >>> classes = entity_to_classes(list(entities.values())[0])
    >>> 'Q13442814' in classes
    True

    
`entity_to_doi(entity)`
:   Extract DOI of publication from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    doi : str
        DOI as string. An empty string is returned if the field is not set.
    
    Examples
    --------
    >>> entities = wb_get_entities(['Q24239902'])
    >>> doi = entity_to_doi(entities['Q24239902'])
    >>> doi == '10.1038/438900A'
    True

    
`entity_to_full_text_url(entity)`
:   Extract full text URL of publication from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    url : str
        URL as string. An empty string is returned if the field is not set.
    
    Examples
    --------
    >>> entities = wb_get_entities(['Q28374293'])
    >>> url = entity_to_full_text_url(entities['Q28374293'])
    >>> url == ('http://papers.nips.cc/paper/'
    ...         '5872-efficient-and-robust-automated-machine-learning.pdf')
    True

    
`entity_to_journal_title(entity)`
:   Extract journal of publication from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    journal : str
        Journal as string. An empty string is returned if the field is not set.
    
    Examples
    --------
    >>> entities = wb_get_entities(['Q24239902'])
    >>> journal = entity_to_journal_title(entities['Q24239902'])
    >>> journal == 'Nature'
    True

    
`entity_to_label(entity)`
:   Extract label from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    label : str
        String with label.

    
`entity_to_month(entity, language='en')`
:   Extract month of publication from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item.
    language : str
        Language, if none, returns the month as a string with the month number.
    
    Returns
    -------
    month : str or None
        Month as string. If month is not specified, i.e., the precision is year
        then `None` is return.

    
`entity_to_name(entity)`
:   Extract the name of the item.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item representing a person.
    
    Returns
    -------
    name : str or None
        Name of person.
    
    Examples
    --------
    >>> entities = wb_get_entities(['Q8219'])
    >>> name = entity_to_name(list(entities.values())[0])
    >>> name == 'Uta Frith'
    True

    
`entity_to_pages(entity)`
:   Extract pages of publication from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    pages : str
        Pages as string. An empty string is returned if the field is not set.
    
    Examples
    --------
    >>> entities = wb_get_entities(['Q24239902'])
    >>> pages = entity_to_pages(entities['Q24239902'])
    >>> pages == '900-901'
    True

    
`entity_to_smiles(entity)`
:   Extract SMILES of a chemical.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    smiles : str
        SMILES as string.
    
    Examples
    --------
    >>> entities = wb_get_entities(['Q48791494'])
    >>> smiles = entity_to_smiles(entities['Q48791494'])
    >>> smiles == 'CC(C)[C@H]1CC[C@@]2(CO2)[C@@H]3[C@@H]1C=C(COC3=O)C(=O)O'
    True

    
`entity_to_title(entity)`
:   Extract title from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item.
    
    Returns
    -------
    title : str or None
        Title as string. If the title is not set then None is returned.

    
`entity_to_volume(entity)`
:   Extract volume of publication from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    volume : str
        Volume as string. An empty string is returned if the field is not set.
    
    Examples
    --------
    >>> entities = wb_get_entities(['Q21172284'])
    >>> volume = entity_to_volume(entities['Q21172284'])
    >>> volume == '12'
    True

    
`entity_to_year(entity)`
:   Extract year of publication from entity.
    
    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item
    
    Returns
    -------
    year : str or None
        Year as string.

    
`is_human(entity)`
:   Return true if entity is a human.
    
    Parameters
    ----------
    entity : dict
        Structure with Wikidata entity.
    
    Returns
    -------
    result : bool
        Result of comparison.

    
`main()`
:   Handle command-line arguments.

    
`search(query, limit=10)`
:   Search Wikidata.
    
    Parameters
    ----------
    query : str
        Query string.
    limit : int, optional
        Number of maximum search results to return.
    
    Returns
    -------
    result : list of dicts

    
`select_value_by_language_preferences(choices, preferences=('en', 'de', 'fr'))`
:   Select value based on language preference.
    
    Parameters
    ----------
    choices : dict
        Dictionary with language as keys and strings as values.
    preferences : list or tuple
        Iterator
    
    Returns
    -------
    value : str
        Selected string. Returns an empty string if there is no choices.
    
    Examples
    --------
    >>> choices = {'da': 'Bog', 'en': 'Book', 'de': 'Buch'}
    >>> select_value_by_language_preferences(choices)
    'Book'

    
`wb_get_entities(qs)`
:   Get entities from Wikidata.
    
    Query the Wikidata webservice via is API.
    
    Parameters
    ----------
    qs : list of str
        List of strings, each with a Wikidata item identifier.
    
    Returns
    -------
    data : dict of dict
        Dictionary of dictionaries.


Module arxiv
============
arxiv.

Usage:
  scholia.arxiv get-metadata <arxiv>
  scholia.arxiv get-quickstatements [options] <arxiv>

Options:
  -o --output=file  Output filename, default output to stdout

References
----------
  https://arxiv.org

Functions
---------

    
`get_metadata(arxiv)`
:   Get metadata about an arxiv publication from website.
    
    Scrapes the arXiv webpage corresponding to the paper with the `arxiv`
    identifier and return the metadata for the paper in a dictionary.
    
    Parameters
    ----------
    arxiv : str
        ArXiv identifier.
    
    Returns
    -------
    metadata : dict
        Dictionary with metadata.
    
    Notes
    -----
    This function queries arXiv. It must not be used to crawl arXiv.
    It does not look at robots.txt.
    
    This function currently uses 'abs' HTML pages and not the arXiv API or
    https://arxiv.org/help/oa/index which is the approved way.
    
    References
    ----------
    - https://arxiv.org
    - https://arxiv.org/help/robots
    
    Examples
    --------
    >>> metadata = get_metadata('1503.00759')
    >>> metadata['doi'] == '10.1109/JPROC.2015.2483592'
    True

    
`main()`
:   Handle command-line interface.

    
`metadata_to_quickstatements(metadata)`
:   Convert metadata to quickstatements.
    
    Convert metadata about a ArXiv article represented in a dict to a
    format so it can copy and pasted into Magnus Manske quickstatement web tool
    to populate Wikidata.
    
    This function does not check whether the item already exists.
    
    Parameters
    ----------
    metadata : dict
        Dictionary with metadata.
    
    Returns
    -------
    quickstatements : str
        String with quickstatements.
    
    References
    ----------
    - https://wikidata-todo.toolforge.org/quick_statements.php

    
`string_to_arxiv(string)`
:   Extract arxiv id from string.
    
    The arXiv identifier part of `string` will be extracted, where the
    identifier pattern should be in the format of a series of digits
    followed by a period followed by a series of digits. Other formats
    will not be matched. If multiple identifier patterns are in the input
    string then only the first is returned.
    
    Parameters
    ----------
    string : str
        String with arxiv ID.
    
    Returns
    -------
    arxiv : str or None
        String with arxiv ID.
    
    Examples
    --------
    >>> string = "http://arxiv.org/abs/1103.2903"
    >>> arxiv = string_to_arxiv(string)
    >>> arxiv == '1103.2903'
    True


Module github
=============
github.

Usage:
  scholia.github get-user <username>
  scholia.github get-user-followers <username>
  scholia.github get-user-number-of-followers <username>
  scholia.github get-user-repos <username>

Functions
---------

    
`get(resource)`
:   Query GitHub API for resource.
    
    Parameters
    ----------
    resource : str
        Resource, e.g., "/users/fnielsen" for the user 'fnielsen'.
    
    Returns
    -------
    data : dictionary or list
        Data from the GitHub API converted to a Python object from the JSON.
    
    References
    ----------
    https://developer.github.com/v3/

    
`get_user(username)`
:   Get user information from GitHub.
    
    Parameters
    ----------
    username : str
        GitHub username as a string.
    
    Returns
    -------
    data : dict
        User information as a dictionary.
    
    Examples
    --------
    >>> data = get_user('fnielsen')
    >>> data['name'].startswith('Finn')
    True

    
`get_user_followers(username)`
:   Get user followers from GitHub.
    
    Parameters
    ----------
    username : str
        GitHub username as a string.
    
    Returns
    -------
    data : list of dict
        List of users.

    
`get_user_repos(username)`
:   Get repos for a user from GitHub.
    
    Parameters
    ----------
    username : str
        GitHub username as a string.
    
    Returns
    -------
    data : list of dict
        List of repos.

    
`main()`
:   Handle command-line interface.


Module googlescholar
====================
scholia.googlescholar.

Usage:
  scholia.googlescholar get-user-data <user>

Options:
  -h --help  Documentation

Example:
-------
  python -m scholia.googlescholar get-user-data gQVuJh8AAAAJ

Functions
---------

    
`get_user_data(user)`
:   Return user data scrape from Google Scholar page.
    
    Query Google Scholar with a specific Google Scholar user identifier and
    get citations statistics and the first metadata about the first works
    back.
    
    Parameters
    ----------
    user : str
        Google Scholar user identifier.
    
    Returns
    -------
    data : dict
        User data.
    
    Notes
    -----
    Journals and proceedings title may not be written completely in Google
    Scholar, so is not returned completely.
    
    Also the author list may be abbreviated and missing authors indicated
    with '...'. Year and citations information might also be missing from
    some of the works.
    
    Only the first 20 works in the list are returned, - corresponding to
    the first page. This function will not page through the results.
    
    Examples
    --------
    >>> data = get_user_data('EofVNskAAAAJ')
    >>> data['citations'] > 2800
    True

    
`main()`
:   Handle command-line interface.


Module model
============
model.

Functions
---------

    
`escape_string(string)`
:   Escape string.
    
    Parameters
    ----------
    string : str
        String to be escaped
    
    Returns
    -------
    escaped_string : str
        Escaped string
    
    Examples
    --------
    >>> string = 'String with " in it'
    >>> escape_string(string)
    'String with \\" in it'

    
`main()`
:   Handle command-line interface.

Classes
-------

`Work(work=None)`
:   Encapsulation of a work.
    
    Initialize data.
    
    Parameters
    ----------
    work : dict
        Work represented as a dictionary.

    ### Ancestors (in MRO)

    * builtins.dict

    ### Methods

    `to_quickstatements(self)`
    :   Convert work to quickstatements.
        
        Returns
        -------
        qs : str
            Quickstatement-formatted work as a string.
        
        Examples
        --------
        >>> work = Work(
        ...     {'authors': ['Niels Bohr'],
        ...      'title': 'On the Constitution of Atoms and Molecules'})
        >>> qs = work.to_quickstatements()
        >>> qs.find('CREATE') != -1
        True


Module network
==============
network.

Usage:
  scholia.network write-example-pajek-file

Functions
---------

    
`main()`
:   Handle command-line interface.

    
`write_pajek_from_sparql(filename, sparql)`
:   Write Pajek network file from SPARQL query.


Module qs
=========
Quickstatements.

Functions
---------

    
`paper_to_quickstatements(paper)`
:   Convert paper to Quickstatements.
    
    Convert a paper represented as a dict in to Magnus Manske's
    Quickstatement format for entry into Wikidata.
    
    Parameters
    ----------
    paper : dict
        Scraped paper represented as a dict.
    
    Returns
    -------
    qs : str
        Quickstatements as a string
    
    References
    ----------
    https://quickstatements.toolforge.org
    
    Notes
    -----
    title, authors (list), date, doi, year, language_q, volume, issue, pages,
    number_of_pages, url, full_text_url, published_in_q are recognized.
    
    `date` takes precedence over `year`.
    
    The label is shortened to 250 characters due if the title is longer than
    that due to a limitation in Wikidata.


Module query
============
query.

Usage:
  scholia.query arxiv-to-q <arxiv>
  scholia.query biorxiv-to-q <biorxiv>
  scholia.query chemrxiv-to-q <chemrxiv>
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
  scholia.query ncbi-gene-to-q <gene>
  scholia.query ncbi-taxon-to-q <taxon>
  scholia.query orcid-to-q <orcid>
  scholia.query pubchem-to-q <cid>
  scholia.query pubmed-to-q <pmid>
  scholia.query q-to-label <q>
  scholia.query q-to-class <q>
  scholia.query random-author
  scholia.query ror-to-q <rorid>
  scholia.query twitter-to-q <twitter>
  scholia.query uniprot-to-q <protein>
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

Functions
---------

    
`arxiv_to_qs(arxiv)`
:   Convert arxiv ID to Wikidata ID.
    
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

    
`atomic_number_to_qs(atomic_number)`
:   Look up a chemical element by atomic number and return a Wikidata ID.
    
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

    
`atomic_symbol_to_qs(symbol)`
:   Look up a chemical element by atomic symbol and return a Wikidata ID.
    
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

    
`biorxiv_to_qs(biorxiv_id)`
:   Convert bioRxiv ID to Wikidata ID.
    
    Parameters
    ----------
    biorxiv_id : str
        bioRxiv identifier.
    
    Returns
    -------
    qs : list of str
        List of string with Wikidata IDs.
    
    Examples
    --------
    >>> biorxiv_to_qs('2020.08.20.259226') == ['Q104920313']
    True

    
`cas_to_qs(cas)`
:   Convert a CAS registry number to Wikidata ID.
    
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

    
`chemrxiv_to_qs(chemrxiv_id)`
:   Convert ChemRxiv ID to Wikidata ID.
    
    Parameters
    ----------
    chemrxiv_id : str
        ChemRxiv identifier.
    
    Returns
    -------
    qs : list of str
        List of string with Wikidata IDs.
    
    Examples
    --------
    >>> chemrxiv_to_qs('12791954') == ['Q98577324']
    True

    
`cordis_to_qs(cordis)`
:   Convert CORDIS project ID to Wikidata ID.
    
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

    
`count_authorships()`
:   Count the number of authorships.
    
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

    
`count_scientific_articles()`
:   Return count for the number of scientific articles.
    
    Returns
    -------
    count : int
        #Number of scientific articles in Wikidata.

    
`doi_to_qs(doi)`
:   Convert DOI to Wikidata ID.
    
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

    
`escape_string(string)`
:   Escape string to be used in SPARQL query.
    
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

    
`github_to_qs(github)`
:   Convert GitHub account name to Wikidata ID.
    
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

    
`inchikey_to_qs(inchikey)`
:   Convert InChIKey to Wikidata ID.
    
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

    
`iso639_to_q(language)`
:   Convert ISO639 to Q item.
    
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

    
`issn_to_qs(issn)`
:   Convert ISSN to Wikidata ID.
    
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

    
`lipidmaps_to_qs(lmid)`
:   Convert a LIPID MAPS identifier to Wikidata ID.
    
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

    
`main()`
:   Handle command-line interface.

    
`mesh_to_qs(meshid)`
:   Convert MeSH ID to Wikidata ID.
    
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

    
`ncbi_gene_to_qs(gene)`
:   Convert a NCBI gene identifier to Wikidata ID.
    
    Wikidata Query Service is used to resolve the NCBI gene identifier.
    
    The NCBI gene identifier string is converted to uppercase before any
    query is made.
    
    Parameters
    ----------
    gene : str
        NCBI gene identifier
    
    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.
    
    Examples
    --------
    >>> ncbi_taxon_to_qs('694009') == ['Q278567']
    True

    
`ncbi_taxon_to_qs(taxon)`
:   Convert a NCBI taxon identifier to Wikidata ID.
    
    Wikidata Query Service is used to resolve the NCBI taxon identifier.
    
    The NCBI taxon identifier string is converted to uppercase before any
    query is made.
    
    Parameters
    ----------
    taxon : str
        NCBI taxon identifier
    
    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.
    
    Examples
    --------
    >>> ncbi_taxon_to_qs('694009') == ['Q278567']
    True

    
`orcid_to_qs(orcid)`
:   Convert orcid to Wikidata ID.
    
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

    
`pubchem_to_qs(cid)`
:   Convert a PubChem compound identifier (CID) to Wikidata ID.
    
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

    
`pubmed_to_qs(pmid)`
:   Convert a PubMed identifier to Wikidata ID.
    
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

    
`q_to_class(q)`
:   Return Scholia class of Wikidata item.
    
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

    
`q_to_dois(q)`
:   Get DOIs for a Q item.
    
    Query the Wikidata Query Service to get zero or more DOIs for a particular
    Q item identified by the Q identifier.
    
    Parameters
    ----------
    q : str
        String with Wikidata Q identifier.
    
    Returns
    -------
    dois : list of str
        List with zero or mores strings each containing a DOI.
    
    Examples
    --------
    >>> dois = q_to_dois("Q87191917")
    >>> dois == ['10.1016/S0140-6736(20)30211-7']
    True

    
`q_to_label(q, language='en')`
:   Get label for Q item.
    
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

    
`query_to_bindings(query)`
:   Return response bindings from SPARQL query.
    
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

    
`random_author()`
:   Return random author.
    
    Sample a scientific author randomly from Wikidata by a call to the Wikidata
    Query Service.
    
    Returns
    -------
    q : str
        Wikidata identifier.
    
    Notes
    -----
    The author returned is not necessarily a scholarly author.
    
    The algorithm uses a somewhat hopeful randomization and if no author is
    found it falls back on Q18618629.
    
    Examples
    --------
    >>> q = random_author()
    >>> q.startswith('Q')
    True

    
`ror_to_qs(rorid)`
:   Convert a ROR identifier to Wikidata ID.
    
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

    
`search_article_titles(q, search_string=None)`
:   Search articles with q item.
    
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

    
`search_article_titles_to_quickstatements(q, search_string=None)`
:   Search article titles and return quickstatements.
    
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

    
`twitter_to_qs(twitter)`
:   Convert Twitter account name to Wikidata ID.
    
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

    
`uniprot_to_qs(protein)`
:   Convert a UniProt identifier to Wikidata ID.
    
    Wikidata Query Service is used to resolve the UniProt identifier.
    
    The UniProt identifier string is converted to uppercase before any
    query is made.
    
    Parameters
    ----------
    protein : str
        UniProt identifier
    
    Returns
    -------
    qs : list of str
        List of strings with Wikidata IDs.
    
    Examples
    --------
    >>> uniprot_to_qs('P02649') == ['Q424728']
    True

    
`viaf_to_qs(viaf)`
:   Convert VIAF identifier to Wikidata ID.
    
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

    
`website_to_qs(url)`
:   Convert URL for website to Wikidata ID.
    
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

    
`wikipathways_to_qs(wpid)`
:   Convert a WikiPathways identifier to Wikidata ID.
    
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

Classes
-------

`QueryResultError(*args, **kwargs)`
:   Generic query error.

    ### Ancestors (in MRO)

    * builtins.Exception
    * builtins.BaseException


Module rss
==========
rss.

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

Functions
---------

    
`entities_to_works_rss(entities)`
:   Convert Wikidata entities to works rss.
    
    Parameters
    ----------
    entities : list
        List of Wikidata items in nested structure.
    
    Returns
    -------
    rss : str
        RSS-formatted list of work items.
    
    Notes
    -----
    Wikidata entities without a publication date are skipped.

    
`main()`
:   Handle command-line arguments.

    
`wb_get_author_latest_works(q)`
:   Return RSS-formated list of latest work for author.
    
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

    
`wb_get_organization_latest_works(q)`
:   Return feed for latest work from an organization.
    
    Parameters
    ----------
    q : str
        Wikidata identifer
    
    Returns
    -------
    rss : str
        RSS-formatted feed with latest work from an organization.

    
`wb_get_sponsor_latest_works(q)`
:   Return feed for latest work from a sponsor.
    
    Parameters
    ----------
    q : str
        Wikidata identifer
    
    Returns
    -------
    rss : str
        RSS-formatted feed with latest work from a sponsor.

    
`wb_get_topic_latest_works(q)`
:   Return feed for latest work on topic.
    
    Parameters
    ----------
    q : str
        Wikidata identifier
    
    Returns
    -------
    rss : str
        RSS-formatted feed with latest work on topic.

    
`wb_get_venue_latest_works(q)`
:   Return feed for latest work from venue.
    
    Parameters
    ----------
    q : str
        Wikidata identifer
    
    Returns
    -------
    rss : str
        RSS-formatted feed with latest work from venue.


Module tex
==========
tex.

Usage:
  scholia.tex extract-qs-from-aux <file>
  scholia.tex write-bbl-from-aux <file>
  scholia.tex write-bib-from-aux <file>

Description:
  Work with latex and bibtex.

  The functionality is not complete.

Example latex document:

\documentclass{article}
\pdfoutput=1
\usepackage[utf8]{inputenc}

\begin{document}
Scientific citations \cite{Q26857876,Q21172284}.
Semantic relatedness \cite{Q26973018}.
\bibliographystyle{unsrt}
\bibliography{}
\end{document}

Functions
---------

    
`authors_to_bibtex_authors(authors)`
:   Convert a Wikidata entity to an author in BibTeX.
    
    Parameters
    ----------
    authors : dict
        Wikidata entity as hierarchical structure.
    
    Returns
    -------
    entry : str
        Bibtex entry in Unicode string.

    
`entity_to_bibtex_entry(entity, key=None)`
:   Convert Wikidata entity to bibtex-formatted entry.
    
    Parameters
    ----------
    entity : dict
        Wikidata entity as hierarchical structure.
    key : str
        Bibtex key.
    
    Returns
    -------
    entry : str
        Bibtex entry in Unicode string.

    
`escape_to_tex(string, escape_type='normal')`
:   Escape a text to a tex/latex safe text.
    
    Parameters
    ----------
    string : str or None
        Unicode string to be escaped.
    escape_type : normal or url, default normal
        Type of escaping.
    
    Returns
    -------
    escaped_string : str
        Escaped unicode string. If the input is None then an empty string is
        returned.
    
    Examples
    --------
    >>> escape_to_tex("^^") == r'\^{}\^{}'
    True
    
    >>> escaped = escape_to_tex('10.1007/978-3-319-18111-0_26', 'url')
    >>> escaped == '10.1007/978-3-319-18111-0\\_26'
    True
    
    References
    ----------
    - https://en.wikibooks.org/wiki/LaTeX/Special_Characters
    - http://stackoverflow.com/questions/16259923/

    
`extract_dois_from_aux_string(string)`
:   Extract DOIs from string.
    
    Parameters
    ----------
    string : str
        Extract Wikidata identifiers from citations.
    
    Returns
    -------
    dois : list of str
        List of strings.
    
    Examples
    --------
    >>> string = "\\citation{10.1186/S13321-016-0161-3}"
    >>> extract_dois_from_aux_string(string)
    ['10.1186/S13321-016-0161-3']

    
`extract_qs_from_aux_string(string)`
:   Extract qs from string.
    
    Parameters
    ----------
    string : str
        Extract Wikidata identifiers from citations.
    
    Returns
    -------
    qs : list of str
        List of strings.
    
    Examples
    --------
    >>> string = "\\citation{Q28042913}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913']
    
    >>> string = "\\citation{Q28042913,Q27615040}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913', 'Q27615040']
    
    >>> string = "\\citation{Q28042913,Q27615040,Q27615040}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913', 'Q27615040', 'Q27615040']
    
    >>> string = "\\citation{Q28042913,NielsenF2002Neuroinformatics,Q27615040}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913', 'Q27615040']
    
    >>> string = "\\citation{Q28042913,Q27615040.Q27615040}"
    >>> extract_qs_from_aux_string(string)
    ['Q28042913']

    
`guess_bibtex_entry_type(entity)`
:   Guess Bibtex entry type.
    
    Parameters
    ----------
    entity : dict
        Wikidata item.
    
    Returns
    -------
    entry_type : str
        Entry type as a string: 'Article', 'InProceedings', etc.

    
`main()`
:   Handle command-line arguments.


Module text
===========
scholia.text.

Usage:
  scholia.text text-to-topic-qs <text>
  scholia.text text-to-topic-q-text-setup

Options:
  -h --help  Help

Description:
  Handle text.

  `text-to-topic-qs` command will setup a matching method that can convert a
  text to Wikidata Q identifiers associated with topics of scientific articles.
  The setup will call the Wikidata Query Service to setup a regular expression
  for the matching.

  The result of the text-to-topic-qs command-line command can be used to query
  Scholia:

  https://scholia.toolforge.org/topics/<qs>

Functions
---------

    
`load_text_to_topic_q_text()`
:   Load an object that is already set up.
    
    Load the TextToTopicQText object from a pickle file and if it is not
    available set it up from the object.
    
    Returns
    -------
    text_to_topic_q_text : TextToTopicQText
        Text-to-topic-q-text object that is set up and ready to use.

    
`main()`
:   Handle command-line interface.

Classes
-------

`TextToTopicQText()`
:   Converter of text to Wikidata Q identifier data.
    
    Attributes
    ----------
    mapper : dict
        Dictionary between labels and associated Wikidata Q identifiers.
    pattern : re.SRE_Pattern
        Regular expression pattern for matching Wikidata labels.
    
    Set up attributes.

    ### Methods

    `get_mapper(self)`
    :   Return mapper between label and Wikidata item.
        
        Query the Wikidata Query service to get Wikidata identifiers
        and associated labels and convert them to a dictionary.
        
        Returns
        -------
        mapper : dict
            Dictionary where the keys are labels associated with Wikidata
            Q identifiers.
        
        Notes
        -----
        This method queries the Wikidata Query Service with a static
        SPARQL query. It well take some time to complete, perhaps 30 seconds
        or more.
        
        In some cases a timeout may occur in the middle of a response,
        making the JSON return invalid. The method will try second time.
        If this also fails, then the method will raise an exception.

    `save(self, filename=None)`
    :   Save object.

    `text_to_topic_q_text(self, text)`
    :   Convert text to q-text.
        
        Parameters
        ----------
        text : str
            Text to be matched.
        
        Returns
        -------
        q_text : str
            Text with words and phrases substituted with Wikidata Q
            identifiers.

    `text_to_topic_qs(self, text)`
    :   Return Wikidata Q identifiers from text matching.
        
        Parameters
        ----------
        text : str
            Text to be matched.
        
        Returns
        -------
        qs : list of str
            List with Wikidata Q identifiers as strings.


Module utils
============
utils.

Functions
---------

    
`escape_string(string)`
:   Escape string.
    
    Parameters
    ----------
    string : str
        String to be escaped
    
    Returns
    -------
    escaped_string : str
        Escaped string
    
    Examples
    --------
    >>> string = 'String with " in it'
    >>> escape_string(string)
    'String with \\" in it'

    
`sanitize_q(q)`
:   Sanitize Wikidata identifier.
    
    Parameters
    ----------
    q : str or int
        Wikidata identifier as string.
    
    Returns
    -------
    sanitized_q : str
        Sanitized Wikidata identifier, empty if not a Wikidata identifier.
    
    Examples
    --------
    >>> sanitize_q(' Q5 ')
    'Q5'
    >>> sanitize_q('Q5"')
    'Q5'
    >>> sanitize_q('Wikidata')
    ''
    >>> sanitize_q(5)
    'Q5'
    >>> sanitize_q('5')
    'Q5'

    
`string_to_type(string)`
:   Guess type of string.
    
    Parameters
    ----------
    string : str
        Query string.
    
    Returns
    -------
    result : str
    
    Examples
    --------
    >>> string_to_type('1121-4545')
    'issn'


Module wikipedia
================
wikipedia.

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

Functions
---------

    
`main()`
:   Handle command-line interface.

    
`q_to_bibliography_templates(q)`
:   Construct bibliography for Wikidata based on Wikidata identifier.
    
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
