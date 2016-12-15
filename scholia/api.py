"""api.

Usage:
  scholia.api get <q>...

Examples:
  $ python -m scholia.api get Q26857876 Q21172284 | wc
      2    1289   16174

"""


from __future__ import print_function

import requests


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
    if len(qs) > 50:
        raise NotImplementedError("Cannot handle over 50 qs yet")

    ids = "|".join(qs)
    params = {
        'action': 'wbgetentities',
        'ids': ids,
        'format': 'json'
    }
    response_data = requests.get('https://www.wikidata.org/w/api.php',
                                 params=params).json()
    if 'entities' in response_data:
        return response_data['entities']
    else:
        return {}


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
    qs = []
    claims = entity['claims']
    if 'P50' in claims:
        for statement in claims['P50']:
            qs.append(statement['mainsnak']['datavalue']['value']['id'])
    entities = wb_get_entities(qs)
    authors = [entity_to_label(entities[q]) for q in qs]
    return authors


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


def entity_to_title(entity):
    """Extract title from entity.

    Parameters
    ----------
    entity : dict
        Dictionary with Wikidata item

    Returns
    -------
    title : str
        Title as string.

    """
    for statement in entity['claims']['P1476']:
        title = statement['mainsnak']['datavalue']['value']['text']
        return title


def main():
    """Handle command-line arguments."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['get']:
        qs = arguments['<q>']
        entities = wb_get_entities(qs)
        for q in qs:
            print(entities[q])


if __name__ == '__main__':
    main()
