"""Views for app."""

import datetime
import re

from flask import (Blueprint, current_app, redirect, render_template, request,
                   Response, url_for)
from jinja2 import TemplateNotFound
from werkzeug.routing import BaseConverter

from ..api import (entity_to_classes, entity_to_name, entity_to_smiles, search,
                   wb_get_entities)
from ..rss import (wb_get_author_latest_works, wb_get_venue_latest_works,
                   wb_get_topic_latest_works, wb_get_organization_latest_works,
                   wb_get_sponsor_latest_works)
from ..arxiv import string_to_arxiv, string_to_arxivs
from ..arxiv import get_metadata as get_arxiv_metadata
from ..doi import string_to_doi, get_doi_metadata
from ..qs import paper_to_quickstatements
from ..query import (arxiv_to_qs, cas_to_qs, atomic_symbol_to_qs, doi_to_qs,
                     doi_prefix_to_qs, github_to_qs, biorxiv_to_qs,
                     chemrxiv_to_qs, omim_to_qs,
                     identifier_to_qs, inchikey_to_qs, issn_to_qs, orcid_to_qs,
                     viaf_to_qs, q_to_dois, random_author,
                     twitter_to_qs, cordis_to_qs, mesh_to_qs, pubmed_to_qs,
                     lipidmaps_to_qs, ror_to_qs, wikipathways_to_qs,
                     pubchem_to_qs, atomic_number_to_qs, ncbi_taxon_to_qs,
                     ncbi_gene_to_qs, uniprot_to_qs, random_work,
                     random_podcast)
from ..utils import (remove_special_characters_url, sanitize_q, string_to_list,
                     string_to_type)
from ..wikipedia import q_to_bibliography_templates
from ..config import config


ROBOTS_TXT = """User-agent: *
Allow: /$
Allow: /about
Allow: /faq
Allow: /author/$
Allow: /organization/$
Allow: /publisher/$
Allow: /series/$
Allow: /topic/$
Allow: /venue/$
Allow: /work/$
Disallow: /
"""


class RegexConverter(BaseConverter):
    """Converter for regular expression routes.

    References
    ----------
    https://stackoverflow.com/questions/5870188

    """

    def __init__(self, url_map, *items):
        """Set up regular expression matcher."""
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]


def add_app_url_map_converter(self, func, name=None):
    """Register a custom URL map converters, available application wide.

    References
    ----------
    https://coderwall.com/p/gnafxa/adding-custom-url-map-converters-to-flask-blueprint-objects

    """
    def register_converter(state):
        state.app.url_map.converters[name or func.__name__] = func

    self.record_once(register_converter)


Blueprint.add_app_url_map_converter = add_app_url_map_converter
main = Blueprint('app', __name__)
main.add_app_url_map_converter(RegexConverter, 'regex')

# Wikidata item identifier matcher
l_pattern = r'<regex(r"L[1-9]\d*"):lexeme>'
L_PATTERN = re.compile(r'L[1-9]\d*')

q_pattern = r'<regex(r"Q[1-9]\d*"):q>'
q1_pattern = r'<regex(r"Q[1-9]\d*"):q1>'
q2_pattern = r'<regex(r"Q[1-9]\d*"):q2>'
Q_PATTERN = re.compile(r'Q[1-9]\d*')

p_pattern = r'<regex(r"P[1-9]\d*"):p>'
P_PATTERN = re.compile(r'P[1-9]\d*')

# Wikidata item identifiers matcher
qs_pattern = r'<regex(r"Q[1-9]\d*(?:[^0-9]+Q[1-9]\d*)*"):qs>'

# https://www.crossref.org/blog/dois-and-matching-regular-expressions/
DOI_PATTERN = re.compile(r'10\.\d{4,9}/[\[\]\-._;()/:A-Z0-9<>]+',
                         re.IGNORECASE)

# pattern for aspects
ASPECT_PATTERN = '<regex("[a-zA-Z]+"):aspect>'


def classes_to_aspect(classes):
    """Suggest an aspect for a set of classes.

    Parameters
    ----------
    classes : list or set or str
        Wikidata identifiers for classes for an entity

    Returns
    -------
    aspect : str
        Scholia aspect appropriate for an entity

    Examples
    --------
    >>> classes_to_aspect(['Q5'])
    'author'

    """
    classes = set(classes)

    # Hard-coded matching match
    if ('Q5' in classes):  # human
        aspect = 'author'
    elif ('Q30612' in classes):  # clinical trial
        aspect = 'clinical_trial'
    elif classes.intersection([
            'Q277759',  # book series
            'Q2217301',  # serial (publication series)
            'Q27785883',  # conference proceedings series
    ]):
        aspect = 'series'
    elif classes.intersection([
            'Q41298',  # magazine
            'Q737498',  # academic journal
            'Q5633421',  # scientific journal
            'Q1143604',  # proceedings
    ]):
        aspect = 'venue'
    elif ('Q157031' in classes or  # foundation
          'Q10498148' in classes):  # research council
        aspect = 'sponsor'
    elif classes.intersection([
            'Q479716',   # book publisher
            'Q2085381',  # publisher
            'Q1320047'   # university publisher
    ]):
        aspect = 'publisher'
    elif classes.intersection([
            'Q8054',  # protein
    ]):
        aspect = 'protein'
    elif classes.intersection([
            'Q170584',  # project
            'Q1298668',  # research project
    ]):
        aspect = 'project'
    elif classes.intersection([
            'Q7187',  # gene
    ]):
        aspect = 'gene'
    elif classes.intersection([
            'Q571',  # book
            'Q49848',  # document
            'Q187685',  # doctoral thesis
            'Q191067',  # article
            'Q815382',  # meta-analysis
            'Q871232',  # editorial
            'Q253623',  # patent
            'Q580922',  # preprint
            'Q685935',  # trade magazine
            'Q947859',  # research proposal
            'Q1266946',  # thesis
            'Q1778788',  # cohort study
            'Q1907875',  # master's thesis
            'Q1980247',  # chapter
            'Q3331189',  # edition
            'Q4119870',  # academic writing
            'Q5707594',    # news article
            'Q10870555',   # report
            'Q10885494',   # scientific conference paper
            'Q13442814',   # scholarly article
            'Q7318358',    # review article
            'Q15621286',   # intellectual work
            'Q17928402',   # blog post
            'Q21481766',   # academic chapter
            'Q23927052',   # conference article
            'Q30070590',   # magazine article
            'Q43305660',  # United States patent
            'Q45182324',  # retracted article
            'Q47461344',   # written work
            'Q54670950',   # conference poster
            'Q56119332',   # tweet
            'Q58632367',   # conference abstract
            'Q64548048',   # environmental impact assessment report
            'Q110716513',  # scholarly letter/reply
    ]):
        aspect = 'work'
    elif classes.intersection([
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
        aspect = 'award'
    elif classes.intersection([
            'Q3918',  # university
            'Q31855',  # research institute
            'Q38723',  # higher education institution
            'Q162633',  # academy
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
        aspect = 'organization'
    elif classes.intersection([
            'Q15275719',  # recurrent event
            'Q15900647',  # conference series
            'Q47258130',  # scientific conference series
            'Q47459256',  # academic workshop series
            ]):
        aspect = 'event_series'
    elif classes.intersection([
            'Q1543677',  # online conference
            'Q1656682',  # event
            'Q27968055',  # recurrent event edition (event in a series)
            'Q52260246',  # scientific event
            'Q98381855',  # online scholar conference
            'Q98381912',  # online scholarly workshop
            'Q112748789',  # hybrid scholarly conference
            ]):
        aspect = 'event'
    elif classes.intersection([
            'Q12136',  # disease
            'Q389735',  # cardiovascular system disease
            'Q18965518',  # artery disease
            ]):
        aspect = 'disease'
    elif classes.intersection([
            'Q11173',  # chemical compound
            'Q36496',  # ion
            'Q79529',  # chemical substance
            'Q407595',  # metabolite
            'Q2393187',  # molecular entity
            'Q113145171',  # type of a chemical entity
            ]):
        aspect = 'chemical'
    elif classes.intersection([
            'Q11344',  # chemical element
            ]):
        aspect = 'chemical_element'
    elif classes.intersection([
            'Q15711994',  # group of isomeric compounds
            'Q17339814',  # group or class of chemical substances
            'Q47154513',  # structural class of chemical entities
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
        aspect = 'chemical_class'
    elif classes.intersection([
            'Q324254',  # ontology
            'Q1437388',  # formal ontology
            'Q1925081',  # meta-modeling
            'Q3882785',  # upper ontology
            'Q6546616',  # lightweight ontology
            'Q6822257',  # Meta-ontology
            'Q7247296',  # process ontology
            'Q7554009',  # soft ontology
            'Q7977959',  # weak ontology
            'Q56316737',  # domain ontology
            'Q56316739',  # task ontology
            'Q56316745',  # application ontology
            'Q62210692',  # OWL ontology
            'Q81314568',  # OBO Foundry ontology
            'Q96626931',  # disaster ontology
            'Q105846678',  # unit ontology
            'Q113006088',  # orphaned ontology
            'Q113006099',  # inactive ontology
            ]):
        aspect = 'ontology'
    elif classes.intersection([
            'Q2996394',  # biological process (Reactome pathway)
            'Q4915012',  # biological pathway
            ]):
        aspect = 'pathway'
    elif classes.intersection([
            'Q16521',  # taxon
            ]):
        aspect = 'taxon'
    elif classes.intersection([
            'Q1172284',  # data set
            ]):
        aspect = 'dataset'
    elif classes.intersection([
            'Q46855',  # hackathon
            'Q625994',  # conference
            'Q2020153',  # scientific conference
            'Q40444998',  # academic workshop
            ]):
        aspect = 'event'
    elif classes.intersection([
            'Q341',  # free software
            'Q7397',  # software
            'Q1639024',  # mathematical software
            'Q21127166',  # Java software library
            'Q21129801',  # natural language processing toolkit
            'Q24529812',  # statistical package
            ]):
        aspect = 'software'
    elif classes.intersection([
            'Q22811662',  # image database
            ]):
        aspect = 'use'
    elif classes.intersection([
            'Q420927',  # protein complex
            'Q22325163',  # macromolecular complex
            ]):
        aspect = 'complex'
    elif classes.intersection([
            'Q24634210',  # podcast
            ]):
        aspect = 'podcast'
    elif classes.intersection([
            'Q69154911',  # podcast season
            ]):
        aspect = 'podcast_season'
    elif classes.intersection([
            'Q61855877',  # podcast episode
            ]):
        aspect = 'podcast_episode'
    elif ('Q16695773' in classes):  # wikiproject
        aspect = 'wikiproject'
    else:
        aspect = 'topic'

    return aspect


def get_js_config():
    """Return dictionary with Javascript configuration.

    Returns
    -------
    js_config : dict
        Configuration to Javascript as a dict.

    """
    return {
        "sparqlEndpointName":
        config['query-server'].get('sparql_endpoint_name'),
    }


@main.context_processor
def inject_js_config():
    """Return configuration for Javascript for injection.

    Returns
    -------
    js_config : dict
        Configuration to Javascript as a dict.

    """
    return dict(js_config=get_js_config())


@main.route("/")
def index():
    """Return rendered index page.

    Returns
    -------
    html : str
        Rederende HTML for index page.

    """
    return render_template('index.html')


@main.route("/statistics")
def index_statistics():
    """Return rendered main statistics page.

    Returns
    -------
    html : str
        Rendered HTML for main statistics page.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('index-statistics.html', sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route("/" + l_pattern)
def redirect_l(lexeme):
    """Redirect to Scholia lexeme aspect.

    Parameters
    ----------
    lexeme : str
        Wikidata lexeme identifier

    """
    return redirect(url_for('app.show_lexeme', lexeme=lexeme), code=302)


@main.route("/" + q_pattern)
def redirect_q(q):
    """Detect and redirect to Scholia class page.

    Parameters
    ----------
    q : str
        Wikidata item identifier

    """
    try:
        # Use the API to get entity information
        entities = wb_get_entities([q])

        # Extract 'instance of' information
        classes = entity_to_classes(entities[q])

        # match classes to aspect
        aspect = classes_to_aspect(classes)
    except Exception:
        # fallback
        aspect = 'topic'

    method = 'app.show_' + aspect
    return redirect(url_for(method, q=q), code=302)


@main.route('/property/')
def show_property_index():
    """Return property index page.

    Returns
    -------
    html : str
        Rendered index page for property view.

    """
    return render_template('property-index.html')


@main.route("/" + p_pattern)
def show_p(p):
    """Detect and redirect to Scholia class page.

    Parameters
    ----------
    p : str
        Wikidata property identifier

    """
    return render_template('property.html', p=p)


@main.route('/biorxiv/<biorxiv_id>')
def show_biorxiv(biorxiv_id):
    """Return HTML rendering for bioRxiv.

    Parameters
    ----------
    biorxiv_id : str
        bioRxiv identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    qs = biorxiv_to_qs(biorxiv_id)
    return _render_work_qs(qs, "bioRxiv")


@main.route('/chemrxiv/<chemrxiv_id>')
def show_chemrxiv(chemrxiv_id):
    """Return HTML rendering for ChemRxiv.

    Parameters
    ----------
    chemrxiv_id : str
        ChemRxiv identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    qs = chemrxiv_to_qs(chemrxiv_id)
    return _render_work_qs(qs, "ChemRxiv")


@main.route('/arxiv/<arxiv>')
def show_arxiv(arxiv):
    """Return HTML rendering for arxiv.

    Parameters
    ----------
    arxiv : str
        Arxiv identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    See Also
    --------
    show_id_to_quickstatements.

    """
    qs = arxiv_to_qs(arxiv)
    return _render_work_qs(qs, "arXiv")


def _render_work_qs(qs, name):
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_work', q=q), code=302)
    return render_template('404.html', error=could_not_find(name + " ID"))


@main.route("/arxiv-to-quickstatements")
def redirect_arxiv_to_quickstatements():
    """Redirect to id-to-quickstatements.

    Returns
    -------
    reponse : werkzeug.wrappers.Response
        Redirect

    """
    return redirect(
        url_for("app.show_id_to_quickstatements", **request.args), code=301
    )


@main.route("/id-to-quickstatements")
def show_id_to_quickstatements():
    """Return HTML rendering for arxiv.

    Will look after the 'arxiv' parameter.

    Returns
    -------
    html : str
        Rendered HTML.

    See Also
    --------
    show_arxiv.

    """
    query = request.args.get("query")
    current_app.logger.debug("query: {}".format(str(query)))

    if not query:
        return render_template("id-to-quickstatements.html")

    input_list = string_to_list(query)

    ids = {string: {"type": string_to_type(string)} for string in input_list}

    to_id_mapping = {"arxiv": string_to_arxiv, "doi": string_to_doi}

    for identifier, d in ids.items():
        fun = to_id_mapping.get(d["type"])
        if fun:
            ids[identifier]["id"] = fun(identifier)

    if all(["id" not in v for v in ids.values()]):
        # Could not identify an identifier
        return render_template("id-to-quickstatements.html", query=query)

    # Match identifier to Q-identifier if found
    to_qid_mapping = {"arxiv": arxiv_to_qs, "doi": doi_to_qs}
    for identifier, d in ids.items():
        fun = to_qid_mapping.get(d["type"])
        if fun and "id" in d and d["id"] is not None:
            ids[identifier]["qid"] = fun(d["id"])

    identified_qs = [
        [v["id"], v["qid"][0]]
        for v in ids.values()
        if "qid" in v and len(v["qid"]) > 0
    ]
    missing_arxivs = [
        k for k, v in ids.items() if "qid" in v and len(v["qid"]) == 0
    ]

    if len(identified_qs) > 0 and len(missing_arxivs) == 0:
        # The identifiers are already in Wikidata
        return render_template(
            "id-to-quickstatements.html", query=query, qs=identified_qs
        )

    get_metadata_mapping = {
        "arxiv": get_arxiv_metadata,
        "doi": get_doi_metadata,
    }

    for identifier in missing_arxivs:
        fun = get_metadata_mapping.get(ids[identifier]["type"])
        if fun:
            try:
                metadata = fun(ids[identifier]["id"])
            except Exception:
                return render_template(
                    "id-to-quickstatements.html",
                    query=query,
                    qs=identified_qs,
                    error=True,
                )

            ids[identifier]["metadata"] = metadata
            if "error" not in metadata:
                ids[identifier][
                    "quickstatements"
                ] = paper_to_quickstatements(metadata)

    quickstatements = [v.get("quickstatements") for v in ids.values()]
    quickstatements = list(filter(None, quickstatements))

    failed = [
        [v["id"], v["metadata"]["error"]]
        for v in ids.values()
        if "metadata" in v and "error" in v["metadata"]
    ]

    # For Quickstatements Version 2 in URL components,
    # TAB and newline should be replace by | and ||
    # https://www.wikidata.org/wiki/Help:QuickStatements
    # Furthermore the '/' also needs to be encoded, but Jinja2 urlencode does
    # not encode that character.
    # https://github.com/pallets/jinja/issues/515
    # Here, we let jinja2 handle the encoding rather than adding an extra

    if (
        len(identified_qs) == 0
        and len(quickstatements) == 0
        and len(failed) == 0
    ):
        return render_template(
            "id-to-quickstatements.html",
            query=query,
            qs=identified_qs,
            quickstatements=quickstatements,
            error=True,
            failures=failed,
        )
    return render_template(
        "id-to-quickstatements.html",
        query=query,
        qs=identified_qs,
        quickstatements=quickstatements,
        failed=failed,
    )


@main.route('/check-crossref')
def show_check_crossref():
    """Return HTML rendering for Check Crossref tool.

    Returns
    -------
    html : str
        Rendered HTML.

    See Also
    --------
    show_arxiv.

    """
    return render_template('check-crossref.html')


@main.route('/author/' + q_pattern)
def show_author(q):
    """Return HTML rendering for specific author.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    entities = wb_get_entities([q])
    name = entity_to_name(entities[q])
    if name:
        first_initial, last_name = name[0], name.split()[-1]
    else:
        first_initial, last_name = '', ''
    return render_template('author.html', q=q, first_initial=first_initial,
                           last_name=last_name, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/author/' + q_pattern + '/latest-works/rss')
def show_author_rss(q):
    """Return feed for latest work of author.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    rss : str
        RSS-formated page with latest work of author.

    """
    response_body = wb_get_author_latest_works(q)
    response = Response(response=response_body,
                        status=200, mimetype="application/rss+xml")
    response.headers["Content-Type"] = "text/xml; charset=utf-8"
    return response


@main.route('/author/')
def show_author_index():
    """Return author index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('author-index.html', sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/author/random')
def show_author_random():
    """Redirect to random author.

    Returns
    -------
    reponse : werkzeug.wrappers.Response
        Redirect

    """
    q = random_author()
    return redirect(url_for('app.show_author', q=q), code=302)


@main.route('/author/' + q1_pattern + '/use/' + q2_pattern)
def show_author_use(q1, q2):
    """Return HTML rendering for specific topic and use.

    Parameters
    ----------
    q1 : str
        Wikidata item identifier for author.
    q2 : str
        Wikidata item identifier for use.

    Returns
    -------
    html : str
        Rendered HTML for a specific author and use.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('author-use.html', q1=q1, q2=q2, q=q1,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/authors/' + qs_pattern)
def show_authors(qs):
    """Return HTML rendering for specific authors.

    Parameters
    ----------
    qs : str
        Wikidata item identifiers.

    Returns
    -------
    html : str
        Rendered HTML.

    Notes
    -----
    In case there is only one author identifier in the URL, then the request is
    redirected to the "author" aspect.

    """
    qs = Q_PATTERN.findall(qs)
    if len(qs) == 1:
        return redirect(url_for('app.show_author', q=qs[0]), code=301)
    else:
        ep = config['query-server'].get('sparql_endpoint')
        editurl = config['query-server'].get('sparql_editurl')
        embedurl = config['query-server'].get('sparql_embedurl')
        return render_template('authors.html', qs=qs, sparql_endpoint=ep,
                               sparql_editURL=editurl,
                               sparql_embedURL=embedurl)


@main.route('/award/' + q_pattern)
def show_award(q):
    """Return HTML rendering for specific award.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('award.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/award/')
def show_award_index():
    """Return award index page.

    Returns
    -------
    html : str
        Rendered index page for award view.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('award-index.html', sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/cas/<cas>')
def redirect_cas(cas):
    """Detect and redirect for CAS registry numbers.

    Parameters
    ----------
    cas : str
        CAS registry number.

    """
    qs = cas_to_qs(cas)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_chemical', q=q), code=302)
    return render_template(
        '404.html',
        error=could_not_find("CAS registry number"))


@main.route('/lipidmaps/<lmid>')
def redirect_lipidmaps(lmid):
    """Detect and redirect for LIPID MAPS identifiers.

    Parameters
    ----------
    lmid : str
        LIPID MAPS identifier.

    """
    qs = lipidmaps_to_qs(lmid)
    if len(qs) > 0:
        q = qs[0]
        if (len(lmid) < 12):
            return redirect(url_for('app.show_chemical_class', q=q), code=302)
        else:
            return redirect(url_for('app.show_chemical', q=q), code=302)
    return render_template(
        '404.html',
        error=could_not_find("LIPID MAPS identifier"))


@main.route('/atomic-symbol/<symbol>')
def redirect_atomic_symbol(symbol):
    """Detect and redirect for atomic symbols.

    Parameters
    ----------
    symbol : str
        Atomic symbol.

    """
    qs = atomic_symbol_to_qs(symbol)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_chemical_element', q=q), code=302)
    return render_template('404.html', error=could_not_find("atomic symbol"))


@main.route('/atomic-number/<atomic_number>')
def redirect_atomic_number(atomic_number):
    """Detect and redirect based on the atomic number of a chemical element.

    Parameters
    ----------
    atomic_number : str
        Atomic number.

    """
    qs = atomic_number_to_qs(atomic_number)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_chemical_element', q=q), code=302)
    return render_template('404.html', error=could_not_find("atomic number"))


@main.route('/cordis/<cordis>')
def redirect_cordis(cordis):
    """Detect and redirect for EU CORDIS project IDs.

    Parameters
    ----------
    cordis : str
        CORDIS identifier.

    """
    qs = cordis_to_qs(cordis)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_project', q=q), code=302)
    return render_template(
        '404.html',
        error=could_not_find("EU CORDIS project ID"))


@main.route('/catalogue/' + q_pattern)
def show_catalogue(q):
    """Return rendered HTML page for specific catalogue.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML page.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('catalogue.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/catalogue/')
def show_catalogue_index():
    """Return rendered HTML index page for catalogue.

    Returns
    -------
    html : str
        Rendered HTML index page for catalogue.

    """
    return render_template('catalogue-index.html')


@main.route('/dataset/' + q_pattern)
def show_dataset(q):
    """Return rendered HTML page for specific dataset.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML page.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('dataset.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/dataset/')
def show_dataset_index():
    """Return rendered HTML index page for a dataset.

    Returns
    -------
    html : str
        Rendered HTML index page for a dataset.

    """
    return render_template('dataset-index.html')


@main.route('/dataset/' + q_pattern + '/export')
def show_dataset_export(q):
    """Return HTML rendering for export formats for this dataset.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('dataset-export.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/clinical-trial/')
def show_clinical_trial_index():
    """Return clinical trial index page.

    Returns
    -------
    html : str
        Rendered index page for clinical trials.

    """
    return render_template('clinical-trial-index.html')


@main.route('/clinical-trial/' + q_pattern)
def show_clinical_trial(q):
    """Return HTML rendering for specific clinical trial.

    Parameters
    ----------
    q : str
        Wikidata item identifier for clinical trial.

    Returns
    -------
    html : str
        Rendered HTML for a specific clinical trial.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('clinical-trial.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/countries/' + qs_pattern)
def show_countries(qs):
    """Return HTML rendering for specific countries.

    Parameters
    ----------
    qs : str
        Wikidata item identifiers.

    Returns
    -------
    html : str
        Rendered HTML for specific countries.

    """
    qs = Q_PATTERN.findall(qs)
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('countries.html', qs=qs, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/country/')
def show_country_index():
    """Return country index page.

    Returns
    -------
    html : str
        Rendered index page for country view.

    """
    return render_template('country-index.html')


@main.route('/country/' + q_pattern)
def show_country(q):
    """Return HTML rendering for specific country.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML for a specific country.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('country.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/country/' + q1_pattern + '/topic/' + q2_pattern)
def show_country_topic(q1, q2):
    """Return HTML rendering for specific country and topic.

    Parameters
    ----------
    q1 : str
        Wikidata item identifier for country.
    q2 : str
        Wikidata item identifier for topic

    Returns
    -------
    html : str
        Rendered HTML for a specific country and topic.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('country-topic.html', q1=q1, q2=q2, q=q1,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/disease/' + q_pattern)
def show_disease(q):
    """Return HTML rendering for specific disease.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('disease.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/disease/')
def show_disease_index():
    """Return disease index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('disease-index.html')


@main.route('/doi/<path:doi>')
def redirect_doi(doi):
    """Detect and redirect for DOI.

    Parameters
    ----------
    doi : str
        DOI identifier.

    """
    qs = doi_to_qs(doi)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_work', q=q), code=302)
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('404-doi.html', doi=doi, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/doi-prefix/<path:doi>')
def redirect_doi_prefix(doi):
    """Detect and redirect for DOI.

    Parameters
    ----------
    doi : str
        DOI identifier.

    """
    normalize_doi = remove_special_characters_url(doi)
    qs = doi_prefix_to_qs(normalize_doi)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_publisher', q=q), code=302)
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('404.html', doi=doi, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/event/' + q_pattern)
def show_event(q):
    """Return HTML rendering for specific event.

    Parameters
    ----------
    q : str
        Wikidata item identifier representing an event

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('event.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/event/')
def show_event_index():
    """Return event index page.

    Returns
    -------
    html : str
        Rendered index page for event view.

    """
    return render_template('event-index.html')


@main.route('/event-series/' + q_pattern)
def show_event_series(q):
    """Return HTML rendering for specific event series.

    Parameters
    ----------
    q : str
        Wikidata item identifier representing an event series

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('event-series.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/event-series/')
def show_event_series_index():
    """Return event series index page.

    Returns
    -------
    html : str
        Rendered index page for event series view.

    """
    return render_template('event-series-index.html')


@main.route('/faq')
def show_faq():
    """Return rendered FAQ page.

    Returns
    -------
    html : str
        Rendered HTML page for FAQ page.

    """
    return render_template('faq.html')


@main.route('/ncbi-gene/<gene>')
def redirect_ncbi_gene(gene):
    """Detect and redirect for NCBI gene identifiers.

    Parameters
    ----------
    gene : str
        NCBI gene identifier.

    """
    qs = ncbi_gene_to_qs(gene)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_gene', q=q), code=302)
    return render_template('404.html', error=could_not_find("NCBI gene ID"))


@main.route('/uniprot/<protein>')
def redirect_uniprot(protein):
    """Detect and redirect for UniProt identifiers.

    Parameters
    ----------
    gene : str
        UniProt identifier.

    """
    qs = uniprot_to_qs(protein)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_protein', q=q), code=302)
    return render_template('404.html', error=could_not_find("UniProt ID"))


@main.route('/github/<github>')
def redirect_github(github):
    """Detect and redirect for Github user.

    Parameters
    ----------
    github : str
        Github user identifier.

    """
    qs = github_to_qs(github)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_author', q=q), code=302)
    return render_template('404.html', error=could_not_find("GitHub username"))


@main.route('/inchikey/<inchikey>')
def redirect_inchikey(inchikey):
    """Detect and redirect for InChIkey user.

    Parameters
    ----------
    inchikey : str
        InChIkey user identifier.

    """
    qs = inchikey_to_qs(inchikey)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_chemical', q=q), code=302)
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('404-chemical.html', inchikey=inchikey,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/issn/<issn>')
def redirect_issn(issn):
    """Detect and redirect for ISSN.

    Parameters
    ----------
    issn : str
        ISSN serial identifier.

    """
    qs = issn_to_qs(issn)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_venue', q=q), code=302)
    return render_template('404.html', error=could_not_find("ISSN serial ID"))


@main.route('/language/' + q_pattern)
def show_language(q):
    """Return HTML rendering for specific language.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML for a specific language.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('language.html', q=q, datetime=datetime,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/language')
def show_language_index():
    """Return award index page.

    Returns
    -------
    html : str
        Rendered index page for language view.

    """
    return render_template('language-index.html')


@main.route('/lexeme/')
def show_lexeme_index():
    """Return lexeme index page.

    Returns
    -------
    html : str
        Rendered index page for lexeme view.

    """
    return render_template('lexeme-index.html')


@main.route('/lexeme/' + l_pattern)
def show_lexeme(lexeme):
    """Return HTML rendering for specific lexeme.

    Parameters
    ----------
    lexeme : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML for a specific lexeme.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('lexeme.html', lexeme=lexeme, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/license/' + q_pattern)
def show_license(q):
    """Return HTML rendering for specific license.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML for a specific license.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('license.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/license/')
def show_license_index():
    """Return license index page.

    Returns
    -------
    html : str
        Rendered index page for license view.

    """
    return render_template('license-index.html')


@main.route('/location/')
def show_location_index():
    """Return location index page.

    Returns
    -------
    html : str
        Rendered index page for location view.

    """
    return render_template('location-index.html')


@main.route('/location/' + q_pattern)
def show_location(q):
    """Return HTML rendering for specific location.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML for a specific location.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('location.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/location/' + q1_pattern + '/topic/' + q2_pattern)
def show_location_topic(q1, q2):
    """Return HTML rendering for specific location and topic.

    Parameters
    ----------
    q1 : str
        Wikidata item identifier for location.
    q2 : str
        Wikidata item identifier for topic

    Returns
    -------
    html : str
        Rendered HTML for a specific location and topic.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('location-topic.html', q1=q1, q2=q2, q=q1,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/mesh/<meshid>')
def redirect_mesh(meshid):
    """Detect and redirect for MeSH identifier.

    Parameters
    ----------
    mesh : str
        MeSH identifier.

    """
    qs = mesh_to_qs(meshid)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_topic', q=q), code=302)
    return render_template('404.html', error=could_not_find("MeSH ID"))


@main.route('/omim/<omimID>')
def redirect_omim(omimID):
    """Detect and redirect for OMIM identifiers.

    Parameters
    ----------
    omimID : str
        OMIM identifier.

    """
    qs = omim_to_qs(omimID)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_disease', q=q), code=302)
    return render_template('404.html', error=could_not_find("OMIM ID"))


@main.route('/orcid/<orcid>')
def redirect_orcid(orcid):
    """Detect and redirect for ORCID.

    Parameters
    ----------
    orcid : str
        ORCID identifier.

    """
    qs = orcid_to_qs(orcid)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_author', q=q), code=302)
    return render_template('404.html', error=could_not_find("ORCID iD"))


@main.route('/pubchem/<cid>')
def redirect_pubchem(cid):
    """Detect and redirect for PubChem compound identifiers (CID).

    Parameters
    ----------
    pmid : str
        PubChem compound identifier (CID).

    """
    qs = pubchem_to_qs(cid)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_chemical', q=q), code=302)
    return render_template(
        '404.html',
        error=could_not_find("compound identifier"))


@main.route('/pubmed/<pmid>')
def redirect_pubmed(pmid):
    """Detect and redirect for PubMed identifiers.

    Parameters
    ----------
    pmid : str
        PubMed identifier.

    """
    qs = pubmed_to_qs(pmid)
    return _render_work_qs(qs, "PubMed")


@main.route('/ncbi-taxon/<taxon>')
def redirect_ncbi_taxon(taxon):
    """Detect and redirect for NCBI taxon identifiers.

    Parameters
    ----------
    taxon : str
        NCBI taxon identifier.

    """
    qs = ncbi_taxon_to_qs(taxon)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_taxon', q=q), code=302)
    return render_template('404.html', error=could_not_find("NCBI taxon ID"))


@main.route('/wikipathways/<wpid>')
def redirect_wikipathways(wpid):
    """Detect and redirect for WikiPathways identifiers.

    Parameters
    ----------
    wpid : str
        WikiPathways identifier.

    """
    qs = wikipathways_to_qs(wpid)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_pathway', q=q), code=302)
    return render_template('404.html', error=could_not_find("WikiPathways ID"))


@main.route('/ror/<rorid>')
def redirect_ror(rorid):
    """Detect and redirect for ROR identifiers.

    Parameters
    ----------
    rorid : str
        ROR identifier.

    """
    qs = ror_to_qs(rorid)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_organization', q=q), code=302)
    return render_template('404.html', error=could_not_find("ROR ID"))


@main.route('/viaf/<viaf>')
def redirect_viaf(viaf):
    """Detect and redirect for VIAF identifiers.

    Parameters
    ----------
    viaf : str
        VIAF identifier.

    """
    qs = viaf_to_qs(viaf)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_author', q=q), code=302)
    return render_template('404.html', error=could_not_find("VIAF ID"))


@main.route('/openalex/<openalex>')
def redirect_openalex(openalex):
    """Return HTML rendering for OpenAlex.

    Parameters
    ----------
    openalex : str
        OpenAlex identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    Notes
    -----
    This function will triage based on the first letter in the OpenAlex
    identifier: author (A), topic (C), organization (I), venue (V) and
    work (W).

    """
    qs = identifier_to_qs("P10283", openalex)
    if len(qs) > 0:
        q = qs[0]
        if openalex.startswith('A'):
            return redirect(url_for('app.show_author', q=q), code=302)
        elif openalex.startswith('C'):
            return redirect(url_for('app.show_topic', q=q), code=302)
        elif openalex.startswith('I'):
            return redirect(url_for('app.show_organization', q=q), code=302)
        elif openalex.startswith('V'):
            return redirect(url_for('app.show_venue', q=q), code=302)
        elif openalex.startswith('W'):
            return redirect(url_for('app.show_work', q=q), code=302)
        else:
            # Fallback
            return redirect(url_for('app.redirect_q', q=q), code=302)
    return render_template('404.html', error=could_not_find("OpenAlex ID"))


@main.route('/ontology/')
def show_ontology_index():
    """Return rendered HTML index page for ontology.

    Returns
    -------
    html : str
        Rendered HTML for for ontology.

    """
    return render_template('ontology-index.html')


@main.route('/ontology/' + q_pattern)
def show_ontology(q):
    """Return rendered HTML page for a specific ontology.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('ontology.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/organization/' + q_pattern)
def show_organization(q):
    """Return rendered HTML page for specific organization.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('organization.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/organization/')
def show_organization_index():
    """Return rendered HTML index page for organization.

    Returns
    -------
    html : str
        Rendered HTML for for organization.

    """
    return render_template('organization-index.html')


@main.route('/organization/' + q_pattern + '/latest-works/rss')
def show_organization_rss(q):
    """Return a RSS feed for specific organization.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    rss : str
        RSS feed.

    """
    response_body = wb_get_organization_latest_works(q)
    response = Response(response=response_body,
                        status=200, mimetype="application/rss+xml")
    response.headers["Content-Type"] = "text/xml; charset=utf-8"
    return response


@main.route('/organization/' + q1_pattern + '/topic/' + q2_pattern)
def show_organization_topic(q1, q2):
    """Return HTML rendering for specific organization and topic.

    Parameters
    ----------
    q1 : str
        Wikidata item identifier for organization.
    q2 : str
        Wikidata item identifier for topic

    Returns
    -------
    html : str
        Rendered HTML for a specific organization and topic.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('organization-topic.html', q1=q1, q2=q2, q=q1,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/organization/' + q1_pattern + '/use/' + q2_pattern)
def show_organization_use(q1, q2):
    """Return HTML rendering for specific organization and use.

    Parameters
    ----------
    q1 : str
        Wikidata item identifier for organization.
    q2 : str
        Wikidata item identifier for use

    Returns
    -------
    html : str
        Rendered HTML for a specific organization and use.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('organization-use.html', q1=q1, q2=q2, q=q1,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/organizations/' + qs_pattern)
def show_organizations(qs):
    """Return HTML rendering for specific organizations.

    Parameters
    ----------
    qs : str
        Wikidata item identifiers.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    qs = Q_PATTERN.findall(qs)
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('organizations.html', qs=qs,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/printer/' + q_pattern)
def show_printer(q):
    """Return HTML rendering for specific printer.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('printer.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/printer/')
def show_printer_index():
    """Return printer index page.

    Returns
    -------
    html : str
        Rendered index page for printer view.

    """
    return render_template('printer-index.html')


@main.route('/protein/' + q_pattern)
def show_protein(q):
    """Return HTML rendering for specific protein.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('protein.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/protein/')
def show_protein_index():
    """Return protein index page.

    Returns
    -------
    html : str
        Rendered index page for protein view.

    """
    return render_template('protein-index.html')


@main.route('/project/' + q_pattern)
def show_project(q):
    """Return HTML rendering for specific project.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('project.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/project/')
def show_project_index():
    """Return project index page.

    Returns
    -------
    html : str
        Rendered index page for search view.

    """
    return render_template('project-index.html')


@main.route('/search')
def show_search():
    """Return search page.

    Returns
    -------
    html : str
        Rendered index page for search view.

    Notes
    -----
    If a DOI pattern is matched for the search query then the search page is
    redirected to the DOI redirect page.

    """
    query = request.args.get('q', '')
    page = request.args.get('page', 0)

    # Redirect to DOI page if the search query looks like a DOI
    dois = DOI_PATTERN.findall(query)
    if len(dois) > 0:
        doi = dois[0]
        return redirect(url_for('app.redirect_doi', doi=doi), code=302)

    arxivs = string_to_arxivs(query)
    if arxivs:
        return redirect(url_for('app.show_id_to_quickstatements',
                                arxiv=query), code=302)

    search_results = []
    next_page = -1
    prev_page = -1

    if query:
        data = search(query, page)
        search_results = data["results"]
        next_page = data.get("next_page", -1)
        prev_page = data.get("prev_page", -1)

    return render_template(
        'search.html', query=query, search_results=search_results,
        next_page=next_page, prev_page=prev_page)


@main.route('/gene/' + q_pattern)
def show_gene(q):
    """Return HTML rendering for specific gene.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('gene.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/gene/')
def show_gene_index():
    """Return gene index page.

    Returns
    -------
    html : str
        Rendered index page for gene view.

    """
    return render_template('gene-index.html')


@main.route('/taxon/' + q_pattern)
def show_taxon(q):
    """Return HTML rendering for specific taxon.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('taxon.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/taxon/')
def show_taxon_index():
    """Return taxon index page.

    Returns
    -------
    html : str
        Rendered index page for taxon view.

    """
    return render_template('taxon-index.html')


@main.route('/q-to-bibliography-templates')
def show_q_to_bibliography_templates():
    """Return HTML page for wiki templates bibliographies.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    q_ = request.args.get('q')

    if not q_:
        return render_template('q-to-bibliography-templates.html')

    q = sanitize_q(q_)
    if not q:
        # Could not identify a wikidata identifier
        return render_template('q-to-bibliography-templates.html')

    wikitext = q_to_bibliography_templates(q)

    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('q-to-bibliography-templates.html',
                           q=q,
                           wikitext=wikitext, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/software/' + q_pattern)
def show_software(q):
    """Return HTML rendering for specific software.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('software.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/software/')
def show_software_index():
    """Return software index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('software-index.html')


@main.route('/software/' + q_pattern + '/export')
def show_software_export(q):
    """Return HTML rendering for export formats for this software.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('software-export.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/text-to-topics', methods=['POST', 'GET'])
def show_text_to_topics():
    """Return HTML page for text-to-topics query.

    Return HTML page with form for text-to-topics query or if the text field is
    set, extract Wikidata identifiers based on label matching and redirect to
    the topics page.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    if request.method == 'GET':
        text = request.args.get('text')
    elif request.method == 'POST':
        text = request.form.get('text')
    else:
        assert False

    if not current_app.text_to_topic_q_text_enabled:
        return render_template('text-to-topics.html', enabled=False)

    if not text:
        return render_template('text-to-topics.html', enabled=True)

    qs_list = current_app.text_to_topic_q_text.text_to_topic_qs(text)
    qs = ",".join(set(qs_list))

    return redirect(url_for('app.show_topics', qs=qs), code=302)


@main.route('/topic/' + q_pattern)
def show_topic(q):
    """Return html render page for specific topic.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('topic.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/topic/' + q_pattern + '/latest-works/rss')
def show_topic_rss(q):
    """Return a RSS feed for specific topic.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    rss : str
        RSS feed.

    """
    response_body = wb_get_topic_latest_works(q)
    response = Response(response=response_body,
                        status=200, mimetype="application/rss+xml")
    response.headers["Content-Type"] = "text/xml; charset=utf-8"
    return response


@main.route('/topic/')
def show_topic_index():
    """Return rendered HTML index page for topic.

    Returns
    -------
    html : str
        Rendered HTML index page for topic.

    """
    return render_template('topic-index.html')


@main.route('/topic/' + q1_pattern + '/use/' + q2_pattern)
def show_topic_use(q1, q2):
    """Return HTML rendering for specific topic and use.

    Parameters
    ----------
    q1 : str
        Wikidata item identifier for topic.
    q2 : str
        Wikidata item identifier for use.

    Returns
    -------
    html : str
        Rendered HTML for a specific topic and use.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('topic-use.html', q1=q1, q2=q2, q=q1,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/topics/' + qs_pattern)
def show_topics(qs):
    """Return HTML rendering for specific topics.

    Parameters
    ----------
    qs : str
        Wikidata item identifiers.

    Returns
    -------
    html : str
        Rendered HTML.

    Notes
    -----
    In case there is only one topic identifier in the URL, then the request is
    redirected to the "topic" aspect.

    """
    qs = Q_PATTERN.findall(qs)
    if len(qs) == 1:
        return redirect(url_for('app.show_topic', q=qs[0]), code=301)
    else:
        ep = config['query-server'].get('sparql_endpoint')
        editurl = config['query-server'].get('sparql_editurl')
        embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('topics.html', qs=qs, sparql_endpoint=ep,
                           sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/podcast/' + q_pattern)
def show_podcast(q):
    """Return html render page for a specific podcast.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template(
        'podcast.html', q=q, sparql_endpoint=ep, sparql_editURL=editurl,
        sparql_embedURL=embedurl)


@main.route('/podcast-season/' + q_pattern)
def show_podcast_season(q):
    """Return html render page for a specific podcast season.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template(
        'podcast-season.html', q=q, sparql_endpoint=ep, sparql_editURL=editurl,
        sparql_embedURL=embedurl)


@main.route('/podcast-episode/' + q_pattern)
def show_podcast_episode(q):
    """Return html render page for a specific podcast episode.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template(
        'podcast-episode.html', q=q, sparql_endpoint=ep,
        sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/podcast/random')
def show_podcast_random():
    """Redirect to random podcast.

    Returns
    -------
    reponse : werkzeug.wrappers.Response
        Redirect

    """
    q = random_podcast()
    return redirect(url_for('app.show_podcast', q=q), code=302)


@main.route('/language/' + q_pattern + '/podcast')
def show_podcast_in_language(q):
    """Redirect to random podcast.

    Returns
    -------
    reponse : werkzeug.wrappers.Response
        Redirect

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('podcast-language.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/podcast/')
def show_podcast_index():
    """Return rendered HTML index page for podcasts.

    Returns
    -------
    html : str
        Rendered HTML index page for podcasts.

    """
    return render_template('podcast-index.html')


@main.route('/chemical/' + q_pattern)
def show_chemical(q):
    """Return html render page for specific chemical.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    entities = wb_get_entities([q])
    smiles = entity_to_smiles(entities[q])
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template(
        'chemical.html',
        q=q, sparql_endpoint=ep, sparql_editURL=editurl,
        sparql_embedURL=embedurl, smiles=smiles,
        third_parties_enabled=current_app.third_parties_enabled)


@main.route('/chemical/')
def show_chemical_index():
    """Return rendered HTML index page for chemical.

    Returns
    -------
    html : str
        Rendered HTML index page for chemical.

    """
    return render_template('chemical-index.html')


@main.route('/chemical/missing')
@main.route('/chemical/curation')
def show_chemical_index_curation():
    """Return rendered HTML index page for curation page for chemicals.

    Returns
    -------
    html : str
        Rendered HTML index page for curation page for chemicals.

    """
    return render_template('chemical-index-curation.html')


@main.route('/chemical-element/' + q_pattern)
def show_chemical_element(q):
    """Return html render page for specific chemical element.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('chemical-element.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/chemical-element/')
def show_chemical_element_index():
    """Return rendered HTML index page for chemical element.

    Returns
    -------
    html : str
        Rendered HTML index page for chemical element.

    """
    return render_template('chemical-element-index.html')


@main.route('/chemical-class/' + q_pattern)
def show_chemical_class(q):
    """Return html render page for a specific class of chemicals.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    entities = wb_get_entities([q])
    smiles = entity_to_smiles(entities[q])
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template(
        'chemical-class.html',
        q=q, sparql_endpoint=ep, sparql_editURL=editurl,
        sparql_embedURL=embedurl, smiles=smiles,
        third_parties_enabled=current_app.third_parties_enabled)


@main.route('/chemical-class/')
def show_chemical_class_index():
    """Return rendered HTML index page for a specific class of chemicals.

    Returns
    -------
    html : str
        Rendered HTML index page for a specific class of chemicals.

    """
    return render_template('chemical-class-index.html')


@main.route('/twitter/<twitter>')
def redirect_twitter(twitter):
    """Detect and redirect based on Twitter account.

    Parameters
    ----------
    twitter : str
        Twitter account name.

    """
    qs = twitter_to_qs(twitter)
    q = ''
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.redirect_q', q=q), code=302)
    return render_template(
        '404.html',
        error=could_not_find("Twitter username"))


@main.route('/venue/' + q_pattern)
def show_venue(q):
    """Return rendered HTML page for specific venue.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML page.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('venue.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/venue/' + q_pattern + '/cito')
def show_venue_cito(q):
    """Return HTML rendering for Citation Typing Ontology annotation.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    return redirect('/venue/' + q + '#cito')


@main.route('/venue/' + q1_pattern + '/use/' + q2_pattern)
def show_venue_use(q1, q2):
    """Return HTML rendering for specific venue and use.

    Parameters
    ----------
    q1 : str
        Wikidata item identifier for venue.
    q2 : str
        Wikidata item identifier for use.

    Returns
    -------
    html : str
        Rendered HTML for a specific venue and use.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('venue-use.html', q1=q1, q2=q2, q=q1,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/work/' + q_pattern + '/cito')
def show_work_cito(q):
    """Return HTML rendering for Citation Typing Ontology annotation.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    return redirect('/work/' + q + '#cito')


@main.route('/work/' + q_pattern + '/cito/' + q2_pattern)
def show_work_cito_intention(q, q2):
    """Return HTML rendering for Citation Typing Ontology annotation.

    Parameters
    ----------
    q : str
        Wikidata item identifier for the work.
    q2 : str
        Wikidata item identifier for the citation intention.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('work-cito-intention.html', q=q, q2=q2,
                           sparql_endpoint=ep, sparql_editURL=editurl,
                           sparql_embedURL=embedurl)


@main.route('/work/' + q_pattern + '/export')
def show_work_export(q):
    """Return HTML rendering for export formats for this work.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('work-export.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/work/random')
def show_work_random():
    """Redirect to random work.

    Returns
    -------
    reponse : werkzeug.wrappers.Response
        Redirect

    """
    q = random_work()
    return redirect(url_for('app.show_work', q=q), code=302)


@main.route('/cito/' + q_pattern)
def show_cito(q):
    """Return HTML rendering for a specific Citation Typing Ontology intention.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('cito.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/cito/')
def show_cito_index():
    """Return rendered HTML about CiTO annotation in Wikidata.

    Return rendered HTML index page with general info about CiTO annotation
    in Wikidata.

    Returns
    -------
    html : str
        Rendered HTML index page with general info about CiTO annotation
        in Wikidata.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('cito-index.html', sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/venue/' + q_pattern + '/latest-works/rss')
def show_venue_rss(q):
    """Return a RSS feed for specific venue.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    rss : str
        RSS feed.

    """
    response_body = wb_get_venue_latest_works(q)
    response = Response(response=response_body,
                        status=200, mimetype="application/rss+xml")
    response.headers["Content-Type"] = "text/xml; charset=utf-8"
    return response


@main.route('/venue/')
def show_venue_index():
    """Return rendered HTML index page for venue.

    Returns
    -------
    html : str
        Rendered HTML index page for venue.

    """
    return render_template('venue-index.html')


@main.route('/venues/' + qs_pattern)
def show_venues(qs):
    """Return rendered HTML page for specific venues.

    Parameters
    ----------
    qs : str
        Wikidata item identifiers.

    Returns
    -------
    html : str
        Rendered HTML page.

    """
    qs = Q_PATTERN.findall(qs)
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('venues.html', qs=qs, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/series/' + q_pattern)
def show_series(q):
    """Return rendered HTML for specific series.

    Parameters
    ----------
    q : str
        Wikidata item identifier

    Returns
    -------
    html : str
        Rendered HTML for specific series.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('series.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/series/')
def show_series_index():
    """Return rendered HTML index page for series.

    Returns
    -------
    html : str
        Rendered HTML index page for series.

    """
    return render_template('series-index.html')


@main.route('/complex/' + q_pattern)
def show_complex(q):
    """Return html render page for specific biological complex.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('complex.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/complex/')
def show_complex_index():
    """Return rendered HTML index page for complex.

    Returns
    -------
    html : str
        Rendered HTML index page for complex.

    """
    return render_template('complex-index.html')


@main.route('/pathway/' + q_pattern)
def show_pathway(q):
    """Return html render page for specific pathway.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('pathway.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/pathway/')
def show_pathway_index():
    """Return rendered HTML index page for pathway.

    Returns
    -------
    html : str
        Rendered HTML index page for pathway.

    """
    return render_template('pathway-index.html')


@main.route('/publisher/' + q_pattern)
def show_publisher(q):
    """Return rendered HTML page for specific publisher.

    Parameters
    ----------
    q : str
       Rendered HTML page for specific publisher.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('publisher.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/publisher/')
def show_publisher_index():
    """Return rendered HTML index page for publisher.

    Returns
    -------
    html : str
        Rendered HTML for publisher index page.

    """
    return render_template('publisher-index.html')


@main.route('/robots.txt')
def show_robots_txt():
    """Return robots.txt file.

    A robots.txt file is returned that allows bots to index Scholia.

    Returns
    -------
    response : flask.Response
        Rendered plain text with robots.txt content.

    Notes
    -----
    The default robots.txt for Toolforge hosted tools is

    User-agent: *
    Disallow: /

    We would like bots to index, but not crawl Scholia. Crawling is
    also controlled by the HTML meta tag 'robots' that is set to the
    content: noindex, nofollow on all pages.

    User-agent: *
    Allow: /

    This results in too much crawling or load on the Toolforge
    infrastructure then it should be changed.

    Given that most of the content on Scholia does not get indexed,
    there are little reason to index Scholia's pages, perhaps other
    than the main page and the about page.

    Thus for now the `robots.txt` is set to

    User-agent: *
    Disallow: /

    """
    return Response(ROBOTS_TXT, mimetype="text/plain")


@main.route('/sponsor/' + q_pattern)
def show_sponsor(q):
    """Return rendered HTML page for specific sponsor.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML page for specific sponsor.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('sponsor.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/sponsor/')
def show_sponsor_index():
    """Return rendered index page for sponsor.

    Returns
    -------
    html : str
        Rendered HTML page for sponsor index page.

    """
    return render_template('sponsor-index.html')


@main.route('/sponsor/' + q_pattern + '/latest-works/rss')
def show_sponsor_rss(q):
    """Return a RSS feed for specific sponsor.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    rss : str
        RSS feed.

    """
    response_body = wb_get_sponsor_latest_works(q)
    response = Response(response=response_body,
                        status=200, mimetype="application/rss+xml")
    response.headers["Content-Type"] = "text/xml; charset=utf-8"
    return response


@main.route('/use/' + q_pattern)
def show_use(q):
    """Return HTML rendering for specific use.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('use.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/use/')
def show_use_index():
    """Return use index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('use-index.html')


@main.route('/uses/' + qs_pattern)
def show_uses(qs):
    """Return HTML rendering for multiple specific topics.

    Parameters
    ----------
    qs : str
        Wikidata item identifiers.

    Returns
    -------
    html : str
        Rendered HTML.

    Notes
    -----
    In case there is only one use identifier in the URL, then the request is
    redirected to the "use" aspect.

    """
    qs = Q_PATTERN.findall(qs)
    if len(qs) == 1:
        return redirect(url_for('app.show_use', q=qs[0]), code=301)
    else:
        ep = config['query-server'].get('sparql_endpoint')
        editurl = config['query-server'].get('sparql_editurl')
        embedurl = config['query-server'].get('sparql_embedurl')
        return render_template('uses.html', qs=qs, sparql_endpoint=ep,
                               sparql_editURL=editurl,
                               sparql_embedURL=embedurl)


@main.route('/work/' + q_pattern)
def show_work(q):
    """Return rendered HTML page for specific work.

    Parameters
    ----------
    q : str
        Wikidata item identifier

    Returns
    -------
    html : str
        Rendered HTML page for specific work.

    """
    try:
        dois = q_to_dois(q)
    except Exception:
        dois = []
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('work.html', q=q, dois=dois, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/work/')
def show_work_index():
    """Return rendered index page for work.

    Returns
    -------
    html : str
        Rendered HTML page for work index page.

    """
    return render_template('work-index.html')


@main.route('/works/' + qs_pattern)
def show_works(qs):
    """Return HTML rendering for specific authors.

    Parameters
    ----------
    qs : str
        Wikidata item identifiers separated by commas

    Returns
    -------
    html : str
        Rendered HTML.

    """
    qs = Q_PATTERN.findall(qs)
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('works.html', qs=qs, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/about')
def show_about():
    """Return rendered about page.

    Returns
    -------
    html : str
        Rendered HTML page for about page.

    """
    return render_template('about.html')


@main.route('/wikiproject/')
def show_wikiproject_index():
    """Return rendered HTML index page for wikiproject.

    Returns
    -------
    html : str
        Rendered HTML index page for wikiproject.

    """
    return render_template('wikiproject-index.html')


@main.route('/wikiproject/' + q_pattern)
def show_wikiproject(q):
    """Return rendered HTML page for specific WikiProject.

    Parameters
    ----------
    q : str
        Wikidata item identifier

    Returns
    -------
    html : str
        Rendered HTML page for specific WikiProject.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    return render_template('wikiproject.html', q=q, sparql_endpoint=ep,
                           sparql_editURL=editurl, sparql_embedURL=embedurl)


@main.route('/favicon.ico')
def show_favicon():
    """Detect and redirect for the favicon.ico."""
    return redirect(url_for('static', filename='favicon/favicon.ico'))


@main.route('/' + ASPECT_PATTERN + '/' + q_pattern + '/missing')
@main.route('/' + ASPECT_PATTERN + '/' + q_pattern + '/curation')
def show_aspect_missing(aspect, q):
    """Redirects to the new HTML rendering for missing information.

    Parameters
    ----------
    aspect: str
        Aspect variable
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    ep = config['query-server'].get('sparql_endpoint')
    editurl = config['query-server'].get('sparql_editurl')
    embedurl = config['query-server'].get('sparql_embedurl')
    try:
        return render_template('{aspect}-curation.html'.format(aspect=aspect),
                               q=q, sparql_endpoint=ep, sparql_editURL=editurl,
                               sparql_embedURL=embedurl)
    except TemplateNotFound:
        return render_template('q_curation.html', q=q, aspect=aspect,
                               sparql_endpoint=ep, sparql_editURL=editurl,
                               sparql_embedURL=embedurl)


def page_not_found(e):
    """Show 404 page.

    Render and return a page for a not found URL.

    Returns
    -------
    html : str
        Rendered HTML.

    Notes
    -----
    This function can be used as 404 error handler.

    """
    return (render_template("404.html", js_config=get_js_config(), error=""),
            404)


def could_not_find(name):
    """Make sentence of something missing.

    Parameters
    ----------
    name : str
        Name for an identifier.

    Returns
    -------
    sentence : str
        Sentence with statement that identifier could not be converted to a Q
        number.

    """
    return "Could not convert " + name + " into Q number."
