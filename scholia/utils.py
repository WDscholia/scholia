"""utils."""


from re import findall


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
        qs = findall('\d+', q)
        if qs:
            return 'Q' + qs[0]
    return ''
