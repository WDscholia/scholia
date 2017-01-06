"""api.

Usage:
  scholia.api get <qs>...
  scholia.api q-to-classes <q>

Description:
  Interface to the Wikidata API and its bibliographic data.

Examples:
  $ python -m scholia.api get Q26857876 Q21172284 | wc
      2    1289   16174

  $ python -m scholia.api q-to-classes Q28133147
  Q13442814

"""


from __future__ import print_function

import requests


MONTH_NUMBER_TO_MONTH = {
    'en': ['January', 'February', 'March', 'April', 'May', 'June', 'July',
           'August', 'September', 'October', 'November', 'December']
}


def wb_get_entities(qs):
    """Get entities from Wikidata.

    Query the Wikidata webservice via is API.

    Parameters
    ----------
    qs : list of str
        List of strings, each with a Wikidata item identifier.

    Returns
    -------
    data : dict of dict
        Dictionary of dictionaries.

    """
    if not qs:
        return {}

    if len(qs) > 50:
        raise NotImplementedError("Cannot handle over 50 qs yet")

    ids = "|".join(qs)
    params = {
        'action': 'wbgetentities',
        'ids': ids,
        'format': 'json',
    }
    headers = {
        'User-Agent': 'Scholia',
    }
    response_data = requests.get(
        'https://www.wikidata.org/w/api.php',
        headers=headers, params=params).json()
    if 'entities' in response_data:
        return response_data['entities']
    else:
        # Make informative error
        raise Exception('API error')


def entity_to_authors(entity):
    """Extract authors from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    authors : list of str
        Title as string.

    """
    def statement_to_order(statement):
        LARGE = 10000000
        if 'P1545' in statement.get('qualifiers', []):
            for qualifier in statement['qualifiers']['P1545']:
                # The data value is a string type
                # TODO: handle exceptions?
                return int(qualifier['datavalue']['value'])
        else:
            return LARGE

    qs = []
    orders = []
    claims = entity['claims']
    if 'P50' in claims:
        for statement in claims['P50']:
            qs.append(statement['mainsnak']['datavalue']['value']['id'])
            orders.append(statement_to_order(statement))
    entities = wb_get_entities(qs)

    authornames = []
    if 'P2093' in claims:
        for statement in claims['P2093']:
            value = statement['mainsnak']['datavalue']['value']
            authornames.append((statement_to_order(statement), value))

    authors = [(order, entity_to_label(entities[q]))
               for order, q in zip(orders, qs)]
    authors.extend(authornames)

    authors.sort()

    return [author for _, author in authors]


def entity_to_classes(entity):
    """Extract 'instance_of' classes.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    classes : list of str
        List of strings.

    Examples
    --------
    >>> entities = wb_get_entities(['Q28133147'])
    >>> classes = entity_to_classes(entities.values()[0])
    >>> 'Q13442814' in classes
    True

    """
    classes = []
    for statement in entity['claims'].get('P31', []):
        classes.append(statement['mainsnak']['datavalue']['value']['id'])
    return classes


def entity_to_doi(entity):
    """Extract DOI of publication from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    doi : str
        DOI as string. An empty string is returned if the field is not set.

    Examples
    --------
    >>> entities = wb_get_entities(['Q24239902'])
    >>> doi = entity_to_doi(entities['Q24239902'])
    >>> doi == '10.1038/438900a'
    True

    """
    for statement in entity['claims'].get('P356', []):
        pages = statement['mainsnak']['datavalue']['value']
        return pages
    else:
        return ''


def entity_to_journal_title(entity):
    """Extract journal of publication from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    journal : str
        Journal as string. An empty string is returned if the field is not set.

    Examples
    --------
    >>> entities = wb_get_entities(['Q24239902'])
    >>> journal = entity_to_journal_title(entities['Q24239902'])
    >>> journal == 'Nature'
    True

    """
    for statement in entity['claims'].get('P1433', []):
        journal_item = statement['mainsnak']['datavalue']['value']['id']
        journal_entities = wb_get_entities([journal_item])
        claims = journal_entities[journal_item]['claims']
        for journal_statement in claims.get('P1476', []):
            value = journal_statement['mainsnak']['datavalue']['value']
            if value['language'] == 'en':
                return value['text']

    return ''


def entity_to_label(entity):
    """Extract label from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    label : str
        String with label.

    """
    for language in ['en', 'de', 'da', 'fr', 'es']:
        if language in entity['labels']:
            return entity['labels'][language]['value']
    return ''


def entity_to_month(entity, language='en'):
    """Extract month of publication from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item.
    language : str
        Language, if none, returns the month as a string with the month number.

    Returns
    -------
    month : str
        Month as string.

    """
    for statement in entity['claims']['P577']:
        date = statement['mainsnak']['datavalue']['value']['time']
        month = date[6:8]
        if language is None:
            return month
        elif language == 'en':
            return MONTH_NUMBER_TO_MONTH['en'][int(month)]
        else:
            raise ValueError('language "{}" not support'.format(language))


def entity_to_pages(entity):
    """Extract pages of publication from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    pages : str
        Pages as string. An empty string is returned if the field is not set.

    Examples
    --------
    >>> entities = wb_get_entities(['Q24239902'])
    >>> pages = entity_to_pages(entities['Q24239902'])
    >>> pages == '900-901'
    True

    """
    for statement in entity['claims'].get('P304', []):
        pages = statement['mainsnak']['datavalue']['value']
        return pages
    else:
        return ''


def entity_to_title(entity):
    """Extract title from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item.

    Returns
    -------
    title : str
        Title as string.

    """
    for statement in entity['claims']['P1476']:
        title = statement['mainsnak']['datavalue']['value']['text']
        return title


def entity_to_volume(entity):
    """Extract volume of publication from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    volume : str
        Volume as string. An empty string is returned if the field is not set.

    Examples
    --------
    >>> entities = wb_get_entities(['Q21172284'])
    >>> volume = entity_to_volume(entities['Q21172284'])
    >>> volume == '12'
    True

    """
    for statement in entity['claims'].get('P478', []):
        volume = statement['mainsnak']['datavalue']['value']
        return volume
    else:
        return ''


def entity_to_year(entity):
    """Extract year of publication from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    year : str
        Year as string.

    """
    for statement in entity['claims']['P577']:
        date = statement['mainsnak']['datavalue']['value']['time']
        year = date[1:5]
        return year


def main():
    """Handle command-line arguments."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['get']:
        qs = arguments['<qs>']
        entities = wb_get_entities(qs)
        for q in qs:
            print(entities[q])

    elif arguments['q-to-classes']:
        q = arguments['<q>']
        entities = wb_get_entities([q])
        classes = entity_to_classes(entities[q])
        for class_ in classes:
            print(class_)


if __name__ == '__main__':
    main()
