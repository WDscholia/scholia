"""utils."""

import urllib.parse

from re import findall, search


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
    if search(r'\d{4}-\d{4}', string):
        return 'issn'
    elif search(r'10\.\d{4}', string):
        return 'doi'
    else:
        return 'string'


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
