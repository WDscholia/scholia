"""scholia.googlescholar.

Usage:
  scholia.googlescholar get-user-data <user>

Options:
  -h --help  Documentation

Example:
  python -m scholia.googlescholar get-user-data gQVuJh8AAAAJ

"""

from __future__ import print_function

import json

from lxml.html import fromstring

import requests


USER_URL = "https://scholar.google.dk/citations"


def get_user_data(user):
    """Return user data scrape from Google Scholar page.

    Journals and proceedings title may not be written complete in Google
    Scholar, so is not returned complete.

    Also the author list may be abbreviated and missing authors indicated
    with '...'.

    Only the first 20 works in the list are returned, - corresponding to
    the first page

    Parameters
    ----------
    user : str
        Google Scholar user identifier.

    Returns
    -------
    data : dict
        User data.

    Examples
    --------
    >>> data = get_user_data('EofVNskAAAAJ')
    >>> data['citations'] > 2800
    True

    """
    response = requests.get(USER_URL, params={'user': user})
    tree = fromstring(response.content)

    citation_data = tree.xpath('//td[@class="gsc_rsb_std"]/text()')

    work_elements = tree.xpath('//td[@class="gsc_a_t"]')
    works = []
    for element in work_elements:
        items = list(element.itertext())
        work = {
            'title': items[0],
            'authors': items[1].split(', '),
        }
        if len(items) >= 3:
            work['citation'] = items[2]
        if len(items) >= 4:
            work['year'] = int(items[3][2:])
        works.append(work)

    data = {
        'citations': int(citation_data[0]),
        'citations5': int(citation_data[1]),
        'h-index': int(citation_data[2]),
        'h-index5': int(citation_data[3]),
        'i10-index': int(citation_data[4]),
        'i10-index5': int(citation_data[5]),
        'works': works,
    }
    return data


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['get-user-data']:
        user = arguments['<user>']

        data = get_user_data(user)
        print(json.dumps(data))

    else:
        assert False


if __name__ == '__main__':
    main()
