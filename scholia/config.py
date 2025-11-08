"""config.

Usage:
  scholia.config

"""

import configparser

from io import StringIO

from os.path import exists, expanduser


CONFIG_FILENAMES = [
    'scholia.ini',
    '~/etc/scholia.ini',
    '~/scholia.ini']

DEFAULTS = """
[query-server]
sparql_endpoint = https://qlever.dev/api/wikidata
sparql_editurl = https://wikidata-query-gui.scholia.wiki/#
sparql_embedurl = https://wikidata-query-gui.scholia.wiki/embed.html#
sparql_endpoint_name = View in Wikidata Query GUI

[requests]
user_agent = Scholia/0.3 (https://github.com/ad-freiburg/scholia; qlever.scholia.wiki)

"""


config = configparser.ConfigParser()

config.read_file(StringIO(DEFAULTS))

for filename in CONFIG_FILENAMES:
    full_filename = expanduser(filename)
    if exists(full_filename):
        config.read(full_filename)
        break


if __name__ == '__main__':
    for section in config.sections():
        print(f"[{section}]")
        for key in config[section]:
            print(f"{key} = {config[section].get(key)}")
        print()
