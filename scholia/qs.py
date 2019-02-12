"""Quickstatements."""


from six import u

from .utils import escape_string


def paper_to_quickstatements(paper):
    """Convert paper to Quickstatements.

    Convert a paper represented as a dict in to Magnus Manske's
    Quickstatement format for entry into Wikidata.

    Parameters
    ----------
    paper : dict
        Scraped paper represented as a dict.

    Returns
    -------
    qs : str
        Quickstatements as a string

    References
    ----------
    https://tools.wmflabs.org/wikidata-todo/quick_statements.php

    Notes
    -----
    title, authors (list), date, year, language_q, url, full_text_url,
    published_in_q are recognized.

    `date` takes precedence over `year`.

    """
    qs = u("CREATE\n")

    title = escape_string(paper['title'])
    qs += u('LAST\tLen\t"{}"\n').format(title)

    # Instance of scientific article
    qs += 'LAST\tP31\tQ13442814\n'

    # Title
    qs += u('LAST\tP1476\ten:"{}"\n').format(title)

    # Authors
    for n, author in enumerate(paper['authors'], start=1):
        qs += u('LAST\tP2093\t"{}"\tP1545\t"{}"\n').format(author, n)

    # Published in
    if 'date' in paper:
        # Day precision
        qs += 'LAST\tP577\t+{}T00:00:00Z/11\n'.format(paper['date'])
    elif 'year' in paper:
        # Year precision
        qs += 'LAST\tP577\t+{}-01-01T00:00:00Z/9\n'.format(paper['year'])

    # Language
    if 'language_q' in paper:
        qs += 'LAST\tP407\t{}\n'.format(paper['language_q'])

    # Homepage
    qs += 'LAST\tP856\t"{}"\n'.format(paper['url'])

    # Fulltext URL
    qs += 'LAST\tP953\t"{}"\n'.format(paper['full_text_url'])

    # Published in
    if 'published_in_q' in paper and paper['published_in_q']:
        qs += 'LAST\tP1433\t{}\n'.format(paper['published_in_q'])

    return qs
