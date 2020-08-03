"""scholia.googlescholar.

Usage:
  scholia.googlescholar get-user-data <user>

Options:
  -h --help  Documentation

Example:
-------
  python -m scholia.googlescholar get-user-data gQVuJh8AAAAJ

"""

from __future__ import print_function

import json

from lxml.html import fromstring

import requests


USER_URL = "https://scholar.google.dk/citations"

USER_AGENT = 'Scholia'

HEADERS = {'User-Agent': USER_AGENT}


def get_user_data(user):
    """Return user data scrape from Google Scholar page.

    Query Google Scholar with a specific Google Scholar user identifier and
    get citations statistics and the first metadata about the first works
    back.

    Parameters
    ----------
    user : str
        Google Scholar user identifier.

    Returns
    -------
    data : dict
        User data.

    Notes
    -----
    Journals and proceedings title may not be written completely in Google
    Scholar, so is not returned completely.

    Also the author list may be abbreviated and missing authors indicated
    with '...'. Year and citations information might also be missing from
    some of the works.

    Only the first 20 works in the list are returned, - corresponding to
    the first page. This function will not page through the results.

    Examples
    --------
    >>> data = get_user_data('EofVNskAAAAJ')
    >>> data['citations'] > 2800
    True

    """
    response = requests.get(USER_URL, params={'user': user}, headers=HEADERS)
    tree = fromstring(response.content)

    citation_data = tree.xpath('//td[@class="gsc_rsb_std"]/text()')

    work_elements = tree.xpath('//td[@class="gsc_a_t"]')

    works = []
    for element in work_elements:
        items = list(element.itertext())
        work = {'title': items[0]}

        # If the title contains a '*' then this will result in an extra
        # field in the list.
        offset = 0
        if items[1] == '*':
            offset = 1

        work['authors'] = items[1 + offset].split(', ')
        if len(items) >= 3 + offset:
            work['citation'] = items[2 + offset]
        if len(items) >= 4 + offset:
            work['year'] = int(items[3 + offset][2:])
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
