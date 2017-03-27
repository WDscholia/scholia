"""Views for app."""


from flask import (Blueprint, current_app, redirect, render_template, request,
                   url_for)
from werkzeug.routing import BaseConverter

from ..api import entity_to_name, wb_get_entities
from ..arxiv import metadata_to_quickstatements, string_to_arxiv
from ..arxiv import get_metadata as get_arxiv_metadata
from ..query import (arxiv_to_qs, doi_to_qs, github_to_qs, orcid_to_qs,
                     q_to_class, twitter_to_qs)


class RegexConverter(BaseConverter):
    """Converter for regular expression routes.

    References
    ----------
    https://stackoverflow.com/questions/5870188

    """

    def __init__(self, url_map, *items):
        """Setup regular expression matcher."""
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
                           last_name=last_name)


@main.route('/author/')
def show_author_empty():
    """Return author index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('author_empty.html')


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


@main.route('/github/<github>')
def redirect_github(github):
    """Detect and redirect for Github user.

    Parameters
    ----------
    doi : str
        Github user identifier.

    """
    qs = github_to_qs(github)
    if len(qs) > 0:
        q = qs[0]
    return redirect(url_for('app.show_author', q=q), code=302)


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


@main.route('/topic/')
def show_topic_empty():
    """Return rendered HTML index page for topic.

    Returns
    -------
    html : str
        Rendered HTML index page for topic.

    """
    return render_template('topic_empty.html')


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


@main.route('/venue/')
def show_venue_empty():
    """Return rendered HTML index page for venue.

    Returns
    -------
    html : str
        Rendered HTML index page for venue.

    """
    return render_template('venue_empty.html')


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


@main.route('/about')
def show_about():
    """Return rendered about page.

    Returns
    -------
    html : str
        Rendered HTML page for about page.

    """
    return render_template('about.html')
