"""query.

Usage:
  scholia arxiv-to-quickstatements [options] <arxiv>
  scholia orcid-to-q <orcid>
  scholia string-to-type <string>

Options:
  -o --output=file  Output filename, default output to stdout

Examples
--------
  $ python -m scholia orcid-to-q 0000-0001-6128-3356
  Q20980928

References
----------
  https://wikidata-todo.toolforge.org/quick_statements.php

"""


from __future__ import absolute_import, division, print_function

import os
from os import write

from . import arxiv
from .query import orcid_to_qs
from .utils import string_to_type


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['--output']:
        output_filename = arguments['--output']
        output_file = os.open(output_filename, os.O_RDWR | os.O_CREAT)
    else:
        # stdout
        output_file = 1

    output_encoding = 'utf-8'

    if arguments['arxiv-to-quickstatements']:
        arxiv_id = arguments['<arxiv>']
        metadata = arxiv.get_metadata(arxiv_id)
        quickstatements = arxiv.metadata_to_quickstatements(metadata)
        write(output_file, quickstatements.encode(output_encoding))

    elif arguments['orcid-to-q']:
        qs = orcid_to_qs(arguments['<orcid>'])
        if len(qs) > 0:
            print(qs[0])

    elif arguments['string-to-type']:
        type = string_to_type(arguments['<string>'])
        print(type)


if __name__ == '__main__':
    main()
