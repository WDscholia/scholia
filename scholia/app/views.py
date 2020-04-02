"""Views for app."""

import re

from flask import (Blueprint, current_app, redirect, render_template, request,
                   Response, url_for)
from werkzeug.routing import BaseConverter

from ..api import entity_to_name, entity_to_smiles, search, wb_get_entities
from ..rss import (wb_get_author_latest_works, wb_get_venue_latest_works,
                   wb_get_topic_latest_works, wb_get_organization_latest_works,
                   wb_get_sponsor_latest_works)
from ..arxiv import metadata_to_quickstatements, string_to_arxiv
from ..arxiv import get_metadata as get_arxiv_metadata
from ..query import (arxiv_to_qs, cas_to_qs, atomic_symbol_to_qs, doi_to_qs,
                     github_to_qs,
                     inchikey_to_qs, issn_to_qs, orcid_to_qs, viaf_to_qs,
                     q_to_class, random_author, twitter_to_qs,
                     cordis_to_qs, mesh_to_qs, pubmed_to_qs,
                     lipidmaps_to_qs, ror_to_qs, wikipathways_to_qs,
                     pubchem_to_qs, atomic_number_to_qs)
from ..utils import sanitize_q
from ..wikipedia import q_to_bibliography_templates


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


@main.route("/")
def index():
    """Return rendered index page.

    Returns
    -------
    html : str
        Rederende HTML for index page.

    """
    return render_template('index.html')


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
    class_ = q_to_class(q)
    method = 'app.show_' + class_
    return redirect(url_for(method, q=q), code=302)


@main.route("/" + p_pattern)
def show_p(p):
    """Detect and redirect to Scholia class page.

    Parameters
    ----------
    p : str
        Wikidata property identifier

    """
    return render_template('property.html', p=p)


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
    show_arxiv_to_quickstatements.

    """
    qs = arxiv_to_qs(arxiv)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_work', q=q), code=302)
    return render_template('404.html')


@main.route('/arxiv-to-quickstatements')
def show_arxiv_to_quickstatements():
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
    query = request.args.get('arxiv')

    if not query:
        return render_template('arxiv_to_quickstatements.html')

    current_app.logger.debug("query: {}".format(query))

    arxiv = string_to_arxiv(query)
    if not arxiv:
        # Could not identify an arxiv identifier
        return render_template('arxiv_to_quickstatements.html')

    qs = arxiv_to_qs(arxiv)
    if len(qs) > 0:
        # The arxiv is already in Wikidata
        q = qs[0]
        return render_template('arxiv_to_quickstatements.html',
                               arxiv=arxiv, q=q)

    try:
        metadata = get_arxiv_metadata(arxiv)
    except Exception:
        return render_template('arxiv_to_quickstatements.html',
                               arxiv=arxiv)

    quickstatements = metadata_to_quickstatements(metadata)
    return render_template('arxiv_to_quickstatements.html',
                           arxiv=arxiv, quickstatements=quickstatements)


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
    entities = wb_get_entities([q])
    name = entity_to_name(entities[q])
    if name:
        first_initial, last_name = name[0], name.split()[-1]
    else:
        first_initial, last_name = '', ''
    return render_template('author.html', q=q, first_initial=first_initial,
                           last_name=last_name)


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


@main.route('/author/' + q_pattern + '/missing')
def show_author_missing(q):
    """Return HTML rendering for missing information about specific author.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    return render_template('author_missing.html', q=q)


@main.route('/author/')
def show_author_empty():
    """Return author index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('author_empty.html')


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

    """
    qs = Q_PATTERN.findall(qs)
    return render_template('authors.html', qs=qs)


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
    return render_template('award.html', q=q)


@main.route('/award/')
def show_award_empty():
    """Return award index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('award_empty.html')


@main.route('/award/' + q_pattern + '/missing')
def show_award_missing(q):
    """Return HTML rendering for missing information about specific award.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    return render_template('award_missing.html', q=q)


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
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('catalogue.html', q=q)


@main.route('/catalogue/')
def show_catalogue_empty():
    """Return rendered HTML index page for catalogue.

    Returns
    -------
    html : str
        Rendered HTML index page for catalogue.

    """
    return render_template('catalogue_empty.html')


@main.route('/clinical-trial/')
def show_clinical_trial_empty():
    """Return clinical trial index page.

    Returns
    -------
    html : str
        Rendered index page for clinical trials.

    """
    return render_template('clinical_trial_empty.html')


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
    return render_template('clinical_trial.html', q=q)


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
    return render_template('countries.html', qs=qs)


@main.route('/country/')
def show_country_empty():
    """Return country index page.

    Returns
    -------
    html : str
        Rendered index page for country view.

    """
    return render_template('country_empty.html')


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
    return render_template('country.html', q=q)


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
    return render_template('country_topic.html', q1=q1, q2=q2, q=q1)


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
    return render_template('disease.html', q=q)


@main.route('/disease/')
def show_disease_empty():
    """Return disease index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('disease_empty.html')


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
    return render_template('404.html')


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
    return render_template('event.html', q=q)


@main.route('/event/')
def show_event_empty():
    """Return event index page.

    Returns
    -------
    html : str
        Rendered index page for event view.

    """
    return render_template('event_empty.html')


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
    return render_template('event_series.html', q=q)


@main.route('/event-series/')
def show_event_series_empty():
    """Return event series index page.

    Returns
    -------
    html : str
        Rendered index page for event series view.

    """
    return render_template('event_series_empty.html')


@main.route('/faq')
def show_faq():
    """Return rendered FAQ page.

    Returns
    -------
    html : str
        Rendered HTML page for FAQ page.

    """
    return render_template('faq.html')


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
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('404.html')


@main.route('/lexeme/')
def show_lexeme_empty():
    """Return lexeme index page.

    Returns
    -------
    html : str
        Rendered index page for lexeme view.

    """
    return render_template('lexeme_empty.html')


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
    return render_template('lexeme.html', lexeme=lexeme)


@main.route('/location/')
def show_location_empty():
    """Return location index page.

    Returns
    -------
    html : str
        Rendered index page for location view.

    """
    return render_template('location_empty.html')


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
    return render_template('location.html', q=q)


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
    return render_template('location_topic.html', q1=q1, q2=q2, q=q1)


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
        class_ = q_to_class(q)
        method = 'app.show_' + class_
        return redirect(url_for(method, q=q), code=302)
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('404.html')


@main.route('/pubmed/<pmid>')
def redirect_pubmed(pmid):
    """Detect and redirect for PubMed identifiers.

    Parameters
    ----------
    pmid : str
        PubMed identifier.

    """
    qs = pubmed_to_qs(pmid)
    if len(qs) > 0:
        q = qs[0]
        return redirect(url_for('app.show_work', q=q), code=302)
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('404.html')


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
    return render_template('organization.html', q=q)


@main.route('/organization/')
def show_organization_empty():
    """Return rendered HTML index page for organization.

    Returns
    -------
    html : str
        Rendered HTML for for organization.

    """
    return render_template('organization_empty.html')


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
    return render_template('organization_topic.html', q1=q1, q2=q2, q=q1)


@main.route('/organization/' + q_pattern + '/missing')
def show_organization_missing(q):
    """Return HTML rendering for missing information about an organization.

    Parameters
    ----------
    q : str
        Wikidata item identifier for an organization.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    return render_template('organization_missing.html', q=q)


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
    return render_template('organizations.html', qs=qs)


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
    return render_template('printer.html', q=q)


@main.route('/printer/')
def show_printer_empty():
    """Return printer index page.

    Returns
    -------
    html : str
        Rendered index page for printer view.

    """
    return render_template('printer_empty.html')


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
    return render_template('protein.html', q=q)


@main.route('/protein/')
def show_protein_empty():
    """Return protein index page.

    Returns
    -------
    html : str
        Rendered index page for protein view.

    """
    return render_template('protein_empty.html')


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
    return render_template('project.html', q=q)


@main.route('/project/')
def show_project_empty():
    """Return project index page.

    Returns
    -------
    html : str
        Rendered index page for search view.

    """
    return render_template('project_empty.html')


@main.route('/search')
def show_search():
    """Return search page.

    Returns
    -------
    html : str
        Rendered index page for search view.

    """
    query = request.args.get('q', '')
    if query:
        search_results = search(query)
    else:
        search_results = []
    return render_template('search.html',
                           query=query, search_results=search_results)


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
    return render_template('gene.html', q=q)


@main.route('/gene/')
def show_gene_empty():
    """Return gene index page.

    Returns
    -------
    html : str
        Rendered index page for gene view.

    """
    return render_template('gene_empty.html')


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
    return render_template('taxon.html', q=q)


@main.route('/taxon/')
def show_taxon_empty():
    """Return taxon index page.

    Returns
    -------
    html : str
        Rendered index page for taxon view.

    """
    return render_template('taxon_empty.html')


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
        return render_template('q_to_bibliography_templates.html')

    current_app.logger.debug("q: {}".format(q_))

    q = sanitize_q(q_)
    if not q:
        # Could not identify a wikidata identifier
        return render_template('q_to_bibliography_templates.html')

    wikitext = q_to_bibliography_templates(q)

    return render_template('q_to_bibliography_templates.html',
                           q=q,
                           wikitext=wikitext)


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
    return render_template('software.html', q=q)


@main.route('/software/')
def show_software_empty():
    """Return software index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('software_empty.html')


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
        return render_template('text_to_topics.html', enabled=False)

    if not text:
        return render_template('text_to_topics.html', enabled=True)

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
    return render_template('topic.html', q=q)


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
def show_topic_empty():
    """Return rendered HTML index page for topic.

    Returns
    -------
    html : str
        Rendered HTML index page for topic.

    """
    return render_template('topic_empty.html')


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

    """
    qs = Q_PATTERN.findall(qs)
    return render_template('topics.html', qs=qs)


@main.route('/topic/' + q_pattern + '/missing')
def show_topic_missing(q):
    """Return rendered HTML for missing page for topic.

    Parameters
    ----------
    q : str
        Wikidata item identifiers.

    Returns
    -------
    html : str
        Rendered HTML index page for topic.

    """
    return render_template('topic_missing.html', q=q)


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
    return render_template(
        'chemical.html',
        q=q,
        smiles=smiles,
        third_parties_enabled=current_app.third_parties_enabled)


@main.route('/chemical/')
def show_chemical_empty():
    """Return rendered HTML index page for chemical.

    Returns
    -------
    html : str
        Rendered HTML index page for chemical.

    """
    return render_template('chemical_empty.html')


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
    return render_template('chemical_element.html', q=q)


@main.route('/chemical-element/')
def show_chemical_element_empty():
    """Return rendered HTML index page for chemical element.

    Returns
    -------
    html : str
        Rendered HTML index page for chemical element.

    """
    return render_template('chemical_element_empty.html')


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
    return render_template('chemical_class.html', q=q)


@main.route('/chemical-class/')
def show_chemical_class_empty():
    """Return rendered HTML index page for a specific class of chemicals.

    Returns
    -------
    html : str
        Rendered HTML index page for a specific class of chemicals.

    """
    return render_template('chemical_class_empty.html')


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
    return render_template('404.html')


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
    return render_template('venue.html', q=q)


@main.route('/venue/' + q_pattern + '/missing')
def show_venue_missing(q):
    """Return HTML rendering for missing information about specific venue.

    Parameters
    ----------
    q : str
        Wikidata item identifier.

    Returns
    -------
    html : str
        Rendered HTML.

    """
    return render_template('venue_missing.html', q=q)


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
def show_venue_empty():
    """Return rendered HTML index page for venue.

    Returns
    -------
    html : str
        Rendered HTML index page for venue.

    """
    return render_template('venue_empty.html')


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
    return render_template('venues.html', qs=qs)


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
    return render_template('series.html', q=q)


@main.route('/series/')
def show_series_empty():
    """Return rendered HTML index page for series.

    Returns
    -------
    html : str
        Rendered HTML index page for series.

    """
    return render_template('series_empty.html')


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
    return render_template('pathway.html', q=q)


@main.route('/pathway/')
def show_pathway_empty():
    """Return rendered HTML index page for pathway.

    Returns
    -------
    html : str
        Rendered HTML index page for pathway.

    """
    return render_template('pathway_empty.html')


@main.route('/publisher/' + q_pattern)
def show_publisher(q):
    """Return rendered HTML page for specific publisher.

    Parameters
    ----------
    q : str
       Rendered HTML page for specific publisher.

    """
    return render_template('publisher.html', q=q)


@main.route('/publisher/')
def show_publisher_empty():
    """Return rendered HTML index page for publisher.

    Returns
    -------
    html : str
        Rendered HTML for publisher index page.

    """
    return render_template('publisher_empty.html')


@main.route('/robots.txt')
def show_robots_txt():
    """Return robots.txt file.

    Returns
    -------
    response : flask.Response
        Rendered HTML for publisher index page.

    """
    ROBOTS_TXT = ('User-agent: *\n'
                  'Disallow: /scholia/\n')
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
    return render_template('sponsor.html', q=q)


@main.route('/sponsor/')
def show_sponsor_empty():
    """Return rendered index page for sponsor.

    Returns
    -------
    html : str
        Rendered HTML page for sponsor index page.

    """
    return render_template('sponsor_empty.html')


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
    return render_template('use.html', q=q)


@main.route('/use/')
def show_use_empty():
    """Return use index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('use_empty.html')


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
    return render_template('work.html', q=q)


@main.route('/work/')
def show_work_empty():
    """Return rendered index page for work.

    Returns
    -------
    html : str
        Rendered HTML page for work index page.

    """
    return render_template('work_empty.html')


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
    return render_template('works.html', qs=qs)


@main.route('/about')
def show_about():
    """Return rendered about page.

    Returns
    -------
    html : str
        Rendered HTML page for about page.

    """
    return render_template('about.html')


@main.route('/favicon.ico')
def show_favicon():
    """Detect and redirect for the favicon.ico."""
    return redirect(url_for('static', filename='favicon/favicon.ico'))
