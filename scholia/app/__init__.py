"""app."""


from __future__ import absolute_import, division, print_function

from flask import Flask
from flask_bootstrap import Bootstrap, StaticCDN


app = Flask(__name__)
Bootstrap(app)

# Serve assets from wmflabs for privacy reasons
app.extensions['bootstrap']['cdns']['jquery'] = StaticCDN()
app.extensions['bootstrap']['cdns']['bootstrap'] = StaticCDN(
    static_endpoint='serve_bootstrap_custom')


from . import views
