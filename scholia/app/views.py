"""Views for app."""


from flask import redirect, render_template, url_for
from werkzeug.routing import BaseConverter

from . import app
from ..query import orcid_to_qs, q_to_class, twitter_to_qs


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


app.url_map.converters['regex'] = RegexConverter

# Wikidata item identifier matcher
q_pattern = '<regex("Q[1-9]\d*"):q>'


@app.route("/")
def index():
    """Return rendered index page.

    Returns
    -------
    html : str
        Rederende HTML for index page.

    """
    return render_template('index.html')


@app.route("/" + q_pattern)
def redirect_q(q):
    """Detect and redirect to Scholia class page.

    Parameters
    ----------
    q : str
        Wikidata item identifier

    """
    class_ = q_to_class(q)
    method = 'show_' + class_
    return redirect(url_for(method, q=q), code=302)


@app.route('/author/' + q_pattern)
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
    return render_template('author.html', q=q)


@app.route('/author/')
def show_author_empty():
    """Return author index page.

    Returns
    -------
    html : str
        Rendered index page for author view.

    """
    return render_template('author_empty.html')


@app.route('/orcid/<orcid>')
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
    return redirect(url_for('show_author', q=q), code=302)


@app.route('/organization/' + q_pattern)
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


@app.route('/organization/')
def show_organization_empty():
    """Return rendered HTML index page for organization.

    Returns
    -------
    html : str
        Rendered HTML for for organization.

    """
    return render_template('organization_empty.html')


@app.route('/topic/' + q_pattern)
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


@app.route('/topic/')
def show_topic_empty():
    """Return rendered HTML index page for topic.

    Returns
    -------
    html : str
        Rendered HTML index page for topic.

    """
    return render_template('topic_empty.html')


@app.route('/twitter/<twitter>')
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
    return redirect(url_for('redirect_q', q=q), code=302)


@app.route('/venue/' + q_pattern)
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


@app.route('/venue/')
def show_venue_empty():
    """Return rendered HTML index page for venue.

    Returns
    -------
    html : str
        Rendered HTML index page for venue.

    """
    return render_template('venue_empty.html')


@app.route('/series/' + q_pattern)
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


@app.route('/series/')
def show_series_empty():
    """Return rendered HTML index page for series.

    Returns
    -------
    html : str
        Rendered HTML index page for series.

    """
    return render_template('series_empty.html')


@app.route('/publisher/' + q_pattern)
def show_publisher(q):
    """Return rendered HTML page for specific publisher.

    Parameters
    ----------
    q : str
       Rendered HTML page for specific publisher.

    """
    return render_template('publisher.html', q=q)


@app.route('/publisher/')
def show_publisher_empty():
    """Return rendered HTML index page for publisher.

    Returns
    -------
    html : str
        Rendered HTML for publisher index page.

    """
    return render_template('publisher_empty.html')


@app.route('/work/' + q_pattern)
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


@app.route('/work/')
def show_work_empty():
    """Return rendered index page for work.

    Returns
    -------
    html : str
        Rendered HTML page for work index page.

    """
    return render_template('work_empty.html')


@app.route('/about')
def show_about():
    """Return rendered about page.

    Returns
    -------
    html : str
        Rendered HTML page for about page.

    """
    return render_template('about.html')


@app.route('/static/<path:filename>')
def serve_bootstrap_custom(filename):
    """Return static file.

    Parameter
    ---------
    filename : str
        Filename for static content.

    """
    # https://github.com/mbr/flask-bootstrap/issues/88
    return app.send_static_file('bootstrap_custom/' + filename)
