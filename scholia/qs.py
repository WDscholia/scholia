"""Quickstatements."""

import calendar

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


def escape_quote(string):
    """Escape quotation mark.

    Escape the quotation mark in a string.

    Parameters
    ----------
    string : str
        String to be escaped.

    Returns
    -------
    escaped_string : str
        Escaped string.

    """
    return string.replace('"', '\"')


def format_date_for_description(date_str):
    """Format date string for description.

    Format date string for description.

    Parameters
    ----------
    date_str : str
        Date as DD-MM-YYYY.

    Returns
    -------
    formatted_string : str
        String formatted for description

    """
    date = list(map(int, date_str.split("-")))
    if len(date) == 0:
        return ""
    if len(date) == 1:
        return f" published in {date[0]}"
    month = calendar.month_name[date[1]]
    if len(date) == 2:
        return f" published in {month} {date[0]}"
    if len(date) == 3:
        return f" published on {date[2]} {month} {date[0]}"

    return ""


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
    number_of_pages, url, full_text_url, published_in_q, openreview_id are
    recognized.

    `date` takes precedence over `year`.

    The label is shortened to 250 characters due if the title is longer than
    that due to a limitation in Wikidata.

    Letters in DOI are uppercased in accordance with Wikidata convention.

    """
    qs = u("CREATE\n")

    # Instance of scientific article
    qs += 'LAST\tP31\tQ13442814\n'

    # Language
    iso639 = paper.get('iso639', 'en')

    title = paper.get('title')
    if title:
        # "Label must be no more than 250 characters long"
        normalized_title = normalize_string(title)
        short_title = normalized_title[:250]

        # String datatype support 1,500 characters
        # https://www.wikidata.org/wiki/Help:Data_type#String-based_data_types
        long_title = normalized_title[:1500]

        # Label
        qs += u('LAST\tLen\t"{}"\n').format(short_title)

        # Title property
        qs += u('LAST\tP1476\t{}:"{}"\n').format(iso639, long_title)

    # Description
    date = paper.get('date')
    if date:
        qs += ('LAST\tDen\t"scientific article'
               f'{format_date_for_description(date)}"\n')
    else:
        qs += 'LAST\tDen\t"scientific article"\n'

    arxiv = paper.get("arxiv")
    if arxiv:
        qs += (
            f'LAST\tP818\t"{arxiv}"'
        )  # No line break, to accommodate the following qualifiers

        arxiv_classifications = paper.get("arxiv_classifications")
        if arxiv_classifications:
            # arXiv classifications such as "cs.LG", as qualifier to arXiv ID
            for classification in arxiv_classifications:
                qs += f'\tP820\t"{escape_quote(classification)}"'

        # Line break for the P818 statement
        qs += "\n"

        # DOI based on arXiv identifier
        qs += u'LAST\tP356\t"10.48550/ARXIV.{}"\n'.format(arxiv)

    # DOI
    doi = paper.get('doi')
    if doi:
        # By Wikidata convention letters in a DOI should be uppercase
        doi = doi.upper()
        qs += u('LAST\tP356\t"{}"\n').format(doi)

    # Authors
    if 'authors' in paper:
        for n, author in enumerate(paper['authors'], start=1):
            qs += u('LAST\tP2093\t"{}"\tP1545\t"{}"\n').format(
                normalize_string(author), n)

    # Date
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

    if 'openreview_id' in paper and paper['openreview_id']:
        qs += 'LAST\tP8968\t"{}"\n'.format(paper['openreview_id'])

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
