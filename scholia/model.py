"""model."""

from six import u


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


class Work(dict):
    """Encapsulation of a work."""

    def __init__(self, work=None):
        """Initialize data.

        Parameters
        ----------
        work : dict
            Work represented as a dictionary.

        """
        if isinstance(work, dict):
            for key, value in work.items():
                self[key] = value

    def to_quickstatements(self):
        """Convert work to quickstatements.

        Returns
        -------
        qs : str
            Quickstatement-formatted work as a string.

        Examples
        --------
        >>> work = Work(
        ...     {'authors': ['Niels Bohr'],
        ...      'title': 'On the Constitution of Atoms and Molecules'})
        >>> qs = work.to_quickstatements()
        >>> qs.find('CREATE') != -1
        True

        """
        qs = u("CREATE\n")

        title = escape_string(self['title'])
        qs += u('LAST\tLen\t"{}"\n').format(title)

        # Instance of scientific article
        qs += 'LAST\tP31\tQ13442814\n'

        # Title
        if 'title' in self:
            qs += u('LAST\tP1476\ten:"{}"\n').format(title)

        # Authors
        for n, author in enumerate(self.get('authors', []), start=1):
            qs += u('LAST\tP2093\t"{}"\tP1545\t"{}"\n').format(author, n)

        # Published in
        if 'year' in self:
            qs += 'LAST\t577\t+{}-01-01T00:00:00Z/9\n'.format(self['year'])

        # Language
        if 'language_q' in self:
            qs += 'LAST\tP407\t{}\n'.format(self['language_q'])

        # Homepage
        if 'homepage' in self:
            qs += 'LAST\tP856\t"{}"\n'.format(self['homepage'])
        elif 'url' in self:
            qs += 'LAST\tP856\t"{}"\n'.format(self['url'])

        # Fulltext URL
        if 'full_text_url' in self:
            qs += 'LAST\tP953\t"{}"\n'.format(self['full_text_url'])

        # Published in
        if 'published_in_q' in self:
            qs += 'LAST\tP1433\t{}\n'.format(self['published_in_q'])

        return qs


def main():
    """Handle command-line interface."""
    pass


if __name__ == '__main__':
    main()
