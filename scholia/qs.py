"""Quickstatements."""


from six import u

import re


def normalize_string(string):
    """Normalize string for Quickstatements.

    Strip initial and trailing spaces and convert multiple whitespaces to a
    single whitespace.

    Parameters
    ----------
    string : str
        String to be normalized.

    Returns
    -------
    normalized_string : str
        Normalized string.

    Examples
    --------
    >>> normalize_string(' Finn  Nielsen ')
    'Finn Nielsen'

    """
    return re.sub(r'\s+', ' ', string).strip()


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

    # Language
    iso639 = paper.get('iso639', 'en')

    if 'title' in paper and paper['title']:
        full_title = normalize_string(paper['title'])

        # "Label must be no more than 250 characters long"
        short_title = full_title[:250]

        # Label
        qs += u('LAST\tLen\t"{}"\n').format(short_title)

        # Title property, accepts longer strings
        qs += u('LAST\tP1476\t{}:"{}"\n').format(iso639, full_title)

    # Instance of scientific article
    qs += 'LAST\tP31\tQ13442814\n'

    # DOI
    if 'doi' in paper:
        qs += u('LAST\tP356\t"{}"\n').format(paper['doi'])

    # Authors
    if 'authors' in paper:
        for n, author in enumerate(paper['authors'], start=1):
            qs += u('LAST\tP2093\t"{}"\tP1545\t"{}"\n').format(
                normalize_string(author), n)

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
        qs += u('LAST\tP478\t"{}"\n').format(paper['volume'])

    # Issue
    if 'issue' in paper:
        qs += u('LAST\tP433\t"{}"\n').format(paper['issue'])

    if 'pages' in paper:
        qs += u('LAST\tP304\t"{}"\n').format(paper['pages'])

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

    # Language
    iso639 = proceedings.get('iso639', 'en')

    if 'title' in proceedings and proceedings['title']:
        # "Label must be no more than 250 characters long"
        short_title = proceedings['title'][:250]

        # Label
        qs += u('LAST\tLen\t"{}"\n').format(short_title)

        # Title property
        qs += u('LAST\tP1476\t{}:"{}"\n').format(iso639, short_title)

    # Instance of proceedings
    qs += 'LAST\tP31\tQ1143604\n'

    if 'shortname' in proceedings:
        qs += u('LAST\tP1813\t{}:"{}"\n').format(
            iso639, proceedings['shortname'])
        qs += u('LAST\tA{}\t"{}"\n').format(
            iso639, proceedings['shortname'])
        qs += u('LAST\tDen\t"proceedings from {}"\n').format(
            proceedings['shortname'])

    # DOI
    if 'doi' in proceedings:
        qs += u('LAST\tP356\t"{}"\n').format(proceedings['doi'])

    # Authors
    if 'authors' in proceedings:
        for n, author in enumerate(proceedings['authors'], start=1):
            qs += u('LAST\tP2093\t"{}"\tP1545\t"{}"\n').format(author, n)

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
            qs += 'LAST\tP577\t+{}T00:00:00Z/11\n'.format(proceedings['date'])
        else:
            # Unknown date format
            pass

    elif 'year' in proceedings:
        # Year precision
        qs += 'LAST\tP577\t+{}-00-00T00:00:00Z/9\n'.format(proceedings['year'])

    # Volume
    if 'volume' in proceedings:
        qs += u('LAST\tP478\t"{}"\n').format(proceedings['volume'])

    # Issue
    if 'issue' in proceedings:
        qs += u('LAST\tP433\t"{}"\n').format(proceedings['issue'])

    if 'pages' in proceedings:
        qs += u('LAST\tP304\t"{}"\n').format(proceedings['pages'])

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

    # URN-NBN
    if 'urn' in proceedings:
        qs += 'LAST\tP4109\t"{}"\n'.format(proceedings['urn'])

    return qs
