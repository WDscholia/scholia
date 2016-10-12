"""query.

Usage:
  scholia orcid-to-q <orcid>

Examples:
  $ python -m scholia orcid-to-q 0000-0001-6128-3356
  Q20980928

"""


from docopt import docopt

from .query import orcid_to_qs


arguments = docopt(__doc__)

if arguments['orcid-to-q']:
    qs = orcid_to_qs(arguments['<orcid>'])
    if len(qs) > 0:
        print(qs[0])
