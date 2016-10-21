"""Views for app."""


from flask import redirect, render_template, url_for

from . import app
from ..query import orcid_to_qs, twitter_to_qs
from ..utils import sanitize_q


@app.route("/")
def index():
    return render_template('index.html')


@app.route('/author/<q_>')
def show_author(q_):
    q = sanitize_q(q_)
    return render_template('author.html', q=q)


@app.route('/author/')
def show_author_empty():
    return render_template('author_empty.html')


@app.route('/orcid/<orcid_>')
def redirect_orcid(orcid_):
    qs = orcid_to_qs(orcid_)
    if len(qs) > 0:
        q = qs[0]
    return redirect(url_for('show_author', q_=q), code=302)


@app.route('/organization/<q_>')
def show_organization(q_):
    q = sanitize_q(q_)
    return render_template('organization.html', q=q)


@app.route('/organization/')
def show_organization_empty():
    return render_template('organization_empty.html')


@app.route('/topic/<q_>')
def show_topic(q_):
    q = sanitize_q(q_)
    return render_template('topic.html', q=q)


@app.route('/topic/')
def show_topic_empty():
    return render_template('topic_empty.html')


@app.route('/twitter/<twitter_>')
def redirect_twitter(twitter_):
    qs = twitter_to_qs(twitter_)
    if len(qs) > 0:
        q = qs[0]
    return redirect(url_for('show_author', q_=q), code=302)


@app.route('/venue/<q_>')
def show_venue(q_):
    q = sanitize_q(q_)
    return render_template('venue.html', q=q)


@app.route('/venue/')
def show_venue_empty():
    return render_template('venue_empty.html')


@app.route('/work/<q_>')
def show_work(q_):
    q = sanitize_q(q_)
    return render_template('work.html', q=q)


@app.route('/work/')
def show_work_empty():
    return render_template('work_empty.html')


@app.route('/static/<path:filename>')
def serve_bootstrap_custom(filename):
    # https://github.com/mbr/flask-bootstrap/issues/88
    return app.send_static_file('bootstrap_custom/' + filename)
