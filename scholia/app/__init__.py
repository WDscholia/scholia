"""app."""


from __future__ import absolute_import, division, print_function

from flask import Flask
from flask_bootstrap import Bootstrap, StaticCDN
from werkzeug.middleware.proxy_fix import ProxyFix

from ..text import TextToTopicQText


def create_app(text_to_topic_q_text_enabled=True, third_parties_enabled=False):
    """Create webapp.

    Factory for webapp.

    Parameters
    ----------
    text_to_topic_q_text_enabled : bool
        Determines whether the text-to-topics functionality should be enabled.
        The loading of the matching model takes long time and it may be
        convenient during development to disable the functionality
        [default: true].
    third_parties_enabled : bool
        Determines whether third-party webservices can be enabled.
        Due to privacy reason this is disabled by default [default: false].

    Returns
    -------
    app : flask.app.Flask
        Flask app object.

    """
    app = Flask(__name__)

    # Configure for proxy deployment
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    Bootstrap(app)

    # Serve assets from wmflabs for privacy reasons
    app.extensions['bootstrap']['cdns']['jquery'] = StaticCDN()
    app.extensions['bootstrap']['cdns']['bootstrap'] = StaticCDN()

    from .views import main as main_blueprint
    from .views import page_not_found
    app.register_blueprint(main_blueprint)
    app.register_error_handler(404, page_not_found)

    app.text_to_topic_q_text_enabled = text_to_topic_q_text_enabled
    if text_to_topic_q_text_enabled:
        app.text_to_topic_q_text = TextToTopicQText()

    app.third_parties_enabled = third_parties_enabled

    return app
