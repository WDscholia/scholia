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
    https://quickstatements.toolforge.org

    Notes
    -----
    title, authors (list), date, doi, year, language_q, volume, issue, pages,
    number_of_pages, url, full_text_url, published_in_q are recognized.

    `date` takes precedence over `year`.

    The label is shortened to 250 characters due if the title is longer than
    that due to a limitation in Wikidata.

    """
    qs = u("CREATE\n")

    if 'title' in paper and paper['title']:
        title = escape_string(paper['title'])

        # "Label must be no more than 250 characters long"
        short_title = escape_string(title)[:250]
        while short_title.endswith("\\"):
            short_title = short_title[:-1]

        qs += u('LAST\tLen\t"{}"\n').format(short_title)

    # Instance of scientific article
    qs += 'LAST\tP31\tQ13442814\n'

    # Title
    iso639 = 'en'
    if 'iso639' in paper:
        iso639 = paper['iso639']
    if 'title' in paper and paper['title']:
        qs += u('LAST\tP1476\t{}:"{}"\n').format(iso639, title)

    # DOI
    if 'doi' in paper:
        qs += u('LAST\tP356\t"{}"\n').format(escape_string(paper['doi']))

    # ACL Anthology identifier
    if 'acl_id' in paper:
        qs += u('LAST\tP7505\t"{}"\n').format(escape_string(paper['acl_id']))

    # Authors
    if 'authors' in paper:
        for n, author in enumerate(paper['authors'], start=1):
            qs += u('LAST\tP2093\t"{}"\tP1545\t"{}"\n').format(author, n)

    # Published in
    if 'date' in paper:
        # Day precision
        if len(paper['date']) == 4:
            # Only year available
            qs += 'LAST\tP577\t+{}-00-00T00:00:00Z/9\n'.format(paper['date'])
        elif len(paper['date']) == 7:
            # Year and month only
            qs += 'LAST\tP577\t+{}-00T00:00:00Z/10\n'.format(paper['date'])
        elif len(paper['date']) == 10:
            # Year, month and day available
            qs += 'LAST\tP577\t+{}T00:00:00Z/11\n'.format(paper['date'])
        else:
            # Unknown date format
            pass

    elif 'year' in paper:
        # Year precision
        qs += 'LAST\tP577\t+{}-00-00T00:00:00Z/9\n'.format(paper['year'])

    # Volume
    if 'volume' in paper:
        qs += u('LAST\tP478\t"{}"\n').format(escape_string(paper['volume']))

    # Issue
    if 'issue' in paper:
        qs += u('LAST\tP433\t"{}"\n').format(escape_string(paper['issue']))

    if 'pages' in paper:
        qs += u('LAST\tP304\t"{}"\n').format(escape_string(paper['pages']))

    if 'number_of_pages' in paper:
        qs += u('LAST\tP1104\t{}\n').format(paper['number_of_pages'])

    # Language
    if 'language_q' in paper:
        qs += 'LAST\tP407\t{}\n'.format(paper['language_q'])

    # Homepage
    if 'url' in paper:
        qs += 'LAST\tP856\t"{}"\n'.format(paper['url'])

    # Fulltext URL
    if 'full_text_url' in paper:
        qs += 'LAST\tP953\t"{}"\n'.format(paper['full_text_url'])

    # Published in
    if 'published_in_q' in paper and paper['published_in_q']:
        qs += 'LAST\tP1433\t{}\n'.format(paper['published_in_q'])

    return qs


def proceedings_to_quickstatements(proceedings):
    """Convert proceedings to Quickstatements.

    Convert a paper represented as a dict in to Magnus Manske's
    Quickstatement format for entry into Wikidata.

    Parameters
    ----------
    proceedings : dict
        Scraped proceedings represented as a dict.

    Returns
    -------
    qs : str
        Quickstatements as a string

    References
    ----------
    https://quickstatements.toolforge.org

    Notes
    -----
    title, editors (list), date, doi, year, language_q, volume, issue, pages,
    number_of_pages, url, full_text_url, published_in_q are recognized.

    `date` takes precedence over `year`.

    The label is shortened to 250 characters due if the title is longer than
    that due to a limitation in Wikidata.

    """
    qs = u("CREATE\n")

    if 'title' in proceedings and proceedings['title']:
        title = escape_string(proceedings['title'])

        # "Label must be no more than 250 characters long"
        short_title = escape_string(title)[:250]
        while short_title.endswith("\\"):
            short_title = short_title[:-1]

        qs += u('LAST\tLen\t"{}"\n').format(short_title)

    # Instance of scientific article
    qs += 'LAST\tP31\tQ1143604\n'

    # Title
    iso639 = 'en'
    if 'iso639' in proceedings:
        iso639 = proceedings['iso639']
    if 'title' in proceedings and proceedings['title']:
        qs += u('LAST\tP1476\t{}:"{}"\n').format(iso639, title)

    # DOI
    if 'doi' in proceedings:
        qs += u('LAST\tP356\t"{}"\n').format(escape_string(proceedings['doi']))

    # ACL Anthology identifier
    if 'acl_id' in proceedings:
        qs += u('LAST\tP7505\t"{}"\n').format(proceedings['acl_id'])

    # Editors - currently disable as there are problems with 'somevalue' and
    # quickstatements.
    if False and 'editors' in proceedings:
        for n, editor in enumerate(proceedings['editors'], start=1):
            qs += u('LAST\tP98\tsomevalue\tP1932\t"{}"\tP1545\t"{}"\n').format(
                editor, n)
    if 'publisher_q' in proceedings:
        qs += u('LAST\tP123\t{}\n').format(proceedings['publisher_q'])

    # Published in
    if 'date' in proceedings:
        # Day precision
        if len(proceedings['date']) == 4:
            # Only year available
            qs += 'LAST\tP577\t+{}-00-00T00:00:00Z/9\n'.format(
                proceedings['date'])
        elif len(proceedings['date']) == 7:
            # Year and month only
            qs += 'LAST\tP577\t+{}-00T00:00:00Z/10\n'.format(
                proceedings['date'])
        elif len(proceedings['date']) == 10:
            # Year, month and day available
            qs += 'LAST\tP577\t+{}T00:00:00Z/11\n'.format(
                proceedings['date'])
        else:
            # Unknown date format
            pass

    elif 'year' in proceedings:
        # Year precision
        qs += 'LAST\tP577\t+{}-00-00T00:00:00Z/9\n'.format(proceedings['year'])

    # Volume
    if 'volume' in proceedings:
        qs += u('LAST\tP478\t"{}"\n').format(
            escape_string(proceedings['volume']))

    # Issue
    if 'issue' in proceedings:
        qs += u('LAST\tP433\t"{}"\n').format(
            escape_string(proceedings['issue']))

    if 'pages' in proceedings:
        qs += u('LAST\tP304\t"{}"\n').format(
            escape_string(proceedings['pages']))

    if 'number_of_pages' in proceedings:
        qs += u('LAST\tP1104\t{}\n').format(proceedings['number_of_pages'])

    # Language
    if 'language_q' in proceedings:
        qs += 'LAST\tP407\t{}\n'.format(proceedings['language_q'])

    # Homepage
    if 'url' in proceedings:
        qs += 'LAST\tP856\t"{}"\n'.format(proceedings['url'])

    # Fulltext URL
    if 'full_text_url' in proceedings:
        qs += 'LAST\tP953\t"{}"\n'.format(proceedings['full_text_url'])

    # Published in
    if 'published_in_q' in proceedings and proceedings['published_in_q']:
        qs += 'LAST\tP1433\t{}\n'.format(proceedings['published_in_q'])

    return qs
