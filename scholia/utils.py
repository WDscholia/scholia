"""utils"""


from re import findall


def sanitize_q(q):
    """Sanitize Wikidata identifier.

    Parameters
    ----------
    q : str
        Wikidata identifier as string.

    Returns
    -------
    sanitized_q : str
        Sanitized Wikidata identifier.

    Examples
    --------
    >>> sanitize_q(' Q5 ')
    'Q5'
    >>> sanitize_q('Q5"')
    'Q5'
    >>> sanitize_q('Wikidata')
    ''

    """
    qs = findall('Q\d+', q)
    if qs:
        return qs[0]
    else:
        return ''
