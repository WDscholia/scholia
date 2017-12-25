"""Views for app."""

import re

from flask import (Blueprint, current_app, redirect, render_template, request,
                   Response, url_for)
from werkzeug.routing import BaseConverter

from ..api import entity_to_name, wb_get_entities
from ..rss import (wb_get_author_latest_works, wb_get_venue_latest_works,
                   wb_get_topic_latest_works)
from ..arxiv import metadata_to_quickstatements, string_to_arxiv
from ..arxiv import get_metadata as get_arxiv_metadata
from ..query import (arxiv_to_qs, cas_to_qs, doi_to_qs, github_to_qs,
                     inchikey_to_qs, issn_to_qs, orcid_to_qs, viaf_to_qs,
                     q_to_class, random_author, twitter_to_qs)
from ..text import text_to_topic_qs
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
q_pattern = '<regex("Q[1-9]\d*"):q>'
Q_PATTERN = re.compile(r'Q[1-9]\d*')

p_pattern = '<regex("P[1-9]\d*"):p>'
P_PATTERN = re.compile(r'P[1-9]\d*')

# Wikidata item identifiers matcher
qs_pattern = '<regex("Q[1-9]\d*(?:[^0-9]+Q[1-9]\d*)*"):qs>'


# RSS icon
rss_icon = 'data:image/png;base64,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'


@main.route("/")
def index():
    """Return rendered index page.

    Returns
    -------
    html : str
        Rederende HTML for index page.

    """
    return render_template('index.html')


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
    except:
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
                           last_name=last_name, rss_icon=rss_icon)


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
        Rendered index page for author view.

    """
    return render_template('protein_empty.html')


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

    if not text:
        return render_template('text_to_topics.html')

    qs_list = text_to_topic_qs(text)
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
    return render_template('topic.html', q=q, rss_icon=rss_icon)


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
    return render_template('chemical.html', q=q)


@main.route('/chemical/')
def show_chemical_empty():
    """Return rendered HTML index page for chemical.

    Returns
    -------
    html : str
        Rendered HTML index page for chemical.

    """
    return render_template('chemical_empty.html')


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
    return render_template('venue.html', q=q, rss_icon=rss_icon)


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
