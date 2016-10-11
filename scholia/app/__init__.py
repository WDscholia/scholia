
from __future__ import absolute_import, division, print_function

from flask import Flask
from flask_bootstrap import Bootstrap

app = Flask(__name__)
Bootstrap(app)

from . import views




