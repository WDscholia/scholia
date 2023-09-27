"""utils."""

import calendar
import urllib.parse
from re import findall, search, split, IGNORECASE

def escape_string(string):
    r"""Escape string.

    Parameters
    ----------
    string : str
        String to be escaped

    Returns
    -------
    escaped_string : str
        Escaped string

    Examples
    --------
    >>> string = 'String with " in it'
    >>> escape_string(string)
    'String with \\" in it'

    """
    return string.replace('\\', '\\\\').replace('"', '\\"')


def sanitize_q(q):
    """Sanitize Wikidata identifier.

    Parameters
    ----------
    q : str or int
        Wikidata identifier as string.

    Returns
    -------
    sanitized_q : str
        Sanitized Wikidata identifier, empty if not a Wikidata identifier.

    Examples
    --------
    >>> sanitize_q(' Q5 ')
    'Q5'
    >>> sanitize_q('Q5"')
    'Q5'
    >>> sanitize_q('Wikidata')
    ''
    >>> sanitize_q(5)
    'Q5'
    >>> sanitize_q('5')
    'Q5'

    """
    if type(q) is int:
        if q > 0:
            return 'Q' + str(q)
    else:
        qs = findall(r'\d+', q)
        if qs:
            return 'Q' + qs[0]
    return ''


def string_to_type(string):
    """Guess type of string.

    Parameters
    ----------
    string : str
        Query string.

    Returns
    -------
    result : str

    Examples
    --------
    >>> string_to_type('1121-4545')
    'issn'

    """
    string = string.strip()
    if search(r'^\d{4}\-\d{3}(\d|X)$', string):
        return 'issn'

    if search(r'^10.\d{4,9}/[^\s]+$', string, flags=IGNORECASE):
        return 'doi'

    if search(r'^(arxiv:)?(\d{4}.\d{4,5}|[a-z\-]+(\.[A-Z]{2})?\/\d{7})(v\d+)?$', string, flags=IGNORECASE):
        return 'arxiv'

    return 'string'


def string_to_list(string):
    r"""Convert comma/space/tab/pipe separated string to list.

    Parameters
    ----------
    string : str
        Query string.

    Returns
    -------
    elements : list of str
        List of strings splitted based on separators

    Examples
    --------
    >>> string_to_list("1, 2 | 3\t4 |5")
    ['1', '2', '3', '4', '5']
    >>> string_to_list(" 10.10,abc|123 ")
    ['10.10', 'abc', '123']

    """
    return split(r'[\|,\s]+', string.strip())


def remove_special_characters_url(url):
    """Remove url encoded characters and normalize non-ascii characters.

    Parameters
    ----------
    url : str
        URL-encoded string

    Returns
    -------
    formatted_string : str
        Normalized string without non-ascii characters or spaces

    """
    decoded_url = urllib.parse.unquote(url)
    encode_string = decoded_url.encode("ascii", "ignore")
    formatted_string = encode_string.decode("utf-8").replace(" ", "")
    return formatted_string


def pages_to_number_of_pages(pages):
    """Compute number of pages based on pages represented as string.

    Parameters
    ----------
    pages : str
        Pages represented as a string.

    Returns
    -------
    number_of_pages : int or None
        Number of pages returned as an integer. If the conversion is not
        possible then None is returned.

    Examples
    --------
    >>> pages_to_number_of_pages('61-67')
    7

    """
    number_of_pages = None
    page_elements = pages.split('-')
    if len(page_elements) == 2:
        try:
            number_of_pages = int(page_elements[1]) - int(page_elements[0]) + 1
        except ValueError:
            pass
    return number_of_pages


def metadata_to_quickstatements(metadata):
    """Convert metadata to quickstatements.

    Convert metadata about a ArXiv article represented in a dict to a
    format so it can copy and pasted into Magnus Manske quickstatement web tool
    to populate Wikidata.

    This function does not check whether the item already exists.

    Parameters
    ----------
    metadata : dict
        Dictionary with metadata.

    Returns
    -------
    quickstatements : str
        String with quickstatements.

    References
    ----------
    - https://wikidata-todo.toolforge.org/quick_statements.php

    """

    def clean(string):
        return string.replace('"', '\"')

    def get_nice_date(date_str):
        date = list(map(int, date_str.split("-")))
        if len(date) == 1:
            return f" published in {date[0]}"
        if len(date) == 2:
            return f" published in {calendar.month_name[date[1]]} {date[0]}"
        if len(date) == 3:
            return f" published on {date[2]} {calendar.month_name[date[1]]} {date[0]}"

        return ""

    qs = "CREATE\n"
    qs += "LAST\tP31\tQ13442814\n"

    arxiv = metadata.get("arxiv")
    if arxiv:
        qs += f'LAST\tP818\t"{arxiv}"' # No line break, to accommodate the following qualifiers

        arxiv_classifications = metadata.get("arxiv_classifications")
        if arxiv_classifications:
            # arXiv classifications such as "cs.LG", as qualifier to arXiv ID
            for classification in arxiv_classifications:
                qs += f'\tP820\t"{clean(classification)}"'

        # Line break for the P818 statement
        qs += "\n"

    title = metadata.get("title")
    if title:
        qs += f'LAST\tLen\t"{clean(title)}"\n'
        qs += f'LAST\tP1476\ten:"{clean(title)}"\n'

    publication_date = metadata.get("publication_date")
    if publication_date:
        qs += f'LAST\tDen\t"scientific article{get_nice_date(publication_date)}"\n'
    else:
        qs += 'LAST\tDen\t"scientific article"\n'

    publication_date_P577 = metadata.get("publication_date_P577")
    if publication_date_P577:
        qs += f'LAST\tP577\t{publication_date_P577}\n'

    full_text_url = metadata.get("full_text_url")
    if full_text_url:
        qs += f'LAST\tP953\t"{clean(full_text_url)}"\n'

    doi = metadata.get("doi")
    if doi:
        qs += f'LAST\tP356\t"{clean(doi)}"\n'

    authornames = metadata.get("authornames", [])
    if authornames:
        for n, authorname in enumerate(authornames, start=1):
            qs += f'LAST\tP2093\t"{clean(authorname)}"\tP1545\t"{n}"\n'

    return qs
