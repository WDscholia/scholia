"""doi.

Usage:

Options:

References
----------
  https://doi.org

"""

import re

USER_AGENT = 'Scholia'


def string_to_doi(string):
    """Extract doi id from string.

    The DOI identifier part of `string` will be extracted. If multiple 
    identifier patterns are in the input string then only the first 
    is returned.

    Parameters
    ----------
    string : str
        String with doi ID.

    Returns
    -------
    doi : str or None
        String with doi ID.

    Examples
    --------
    >>> string_to_doi('10.1371/JOURNAL.PONE.0029797')
    '10.1371/JOURNAL.PONE.0029797'
    >>> string_to_doi('https://doi.org/10.12987/YALE/9780300197051.003.0010')
    '10.12987/YALE/9780300197051.003.0010'
    >>> doi.string_to_doi('https://doi.org/10')
    >>>

    """
    PATTERN = re.compile(r'(?i)10.\d{4,9}/[^\s]+', flags=re.DOTALL | re.UNICODE)
    dois = PATTERN.findall(string)
    if len(dois) > 0:
        return dois[0].upper()
    return None


def main():
    """Handle command-line interface."""
    print('undefined')


if __name__ == '__main__':
    main()
