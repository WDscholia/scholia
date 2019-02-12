"""utils."""


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
    if type(q) == int:
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
