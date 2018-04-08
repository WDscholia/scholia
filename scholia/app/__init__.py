"""app."""


from __future__ import absolute_import, division, print_function

from flask import Flask
from flask_bootstrap import Bootstrap, StaticCDN

from ..text import TextToTopicQText, load_text_to_topic_q_text


def create_app():
    """Create webapp.

    Factory for webapp.

    Returns
    -------
    app : flask.app.Flask
        Flask app object.

    """
    app = Flask(__name__)

    Bootstrap(app)

    # Serve assets from wmflabs for privacy reasons
    app.extensions['bootstrap']['cdns']['jquery'] = StaticCDN()
    app.extensions['bootstrap']['cdns']['bootstrap'] = StaticCDN()

    from .views import main as main_blueprint
    app.register_blueprint(main_blueprint)

    app.text_to_topic_q_text = load_text_to_topic_q_text()

    return app
