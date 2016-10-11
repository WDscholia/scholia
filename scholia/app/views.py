"""Views for app."""


from flask import redirect, render_template, url_for

from . import app
from ..query import orcid_to_qs
from ..utils import sanitize_q


@app.route("/")
def index():
    return render_template('index.html')


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


@app.route('/venue/<q_>')
def show_venue(q_):
    q = sanitize_q(q_)
    return render_template('venue.html', q=q)


@app.route('/author/<q_>')
def show_author(q_):
    q = sanitize_q(q_)
    return render_template('author.html', q=q)
