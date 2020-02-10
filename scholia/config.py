"""Configuration for Scholia."""
from __future__ import absolute_import

try:
    import ConfigParser as configparser
except ImportError:
    import configparser

try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO

import logging

from os.path import exists, expanduser


CONFIG_FILENAMES = [
    'scholia.cfg',
    '~/etc/scholia.cfg',
    '~/scholia.cfg']

DEFAULTS = """
[system]
listen=127.0.0.1
port=8100
[servers]
SPARQLEndPointURL = https://query.wikidata.org/sparql
SPARQLEndPointEmbed = https://query.wikidata.org/
webserviceURL = https://www.wikidata.org/w/api.php
"""

logger = logging.getLogger(__name__)
logging.getLogger(__name__).addHandler(logging.NullHandler())

config = configparser.SafeConfigParser()

config.readfp(StringIO(DEFAULTS))

for filename in CONFIG_FILENAMES:
    full_filename = expanduser(filename)
    if exists(full_filename):
        logger.info('Reading configuration file from {}'.format(full_filename))
        config.read(full_filename)
        break
else:
    logger.warn('No configuration file found')