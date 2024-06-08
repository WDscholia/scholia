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
sparql_endpoint = https://query.wikidata.org/sparql
sparql_editurl = https://query.wikidata.org/#

[requests]
user_agent = Scholia

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
