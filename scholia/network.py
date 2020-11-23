"""network.

Usage:
  scholia.network write-example-pajek-file

"""

from collections import OrderedDict

import requests


EXAMPLE_SPARQL_QUERY = """
SELECT ?item1 ?item1Label ?item2 ?item2Label ?weight
WITH {
  SELECT ?item1 ?item2 (COUNT(?work) as ?weight) WHERE {
    ?work wdt:P50 wd:Q20895785 .
    ?work wdt:P50 ?item1 .
    ?work wdt:P50 ?item2 .
    FILTER (?item1 != ?item2)
  }
  GROUP BY ?item1 ?item2
} AS %result
WHERE {
  INCLUDE %result
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" . }
}
"""


def write_pajek_from_sparql(filename, sparql):
    """Write Pajek network file from SPARQL query."""
    column1 = 'item1'
    column2 = 'item2'

    url = 'https://query.wikidata.org/sparql'
    params = {'query': sparql, 'format': 'json'}
    response = requests.get(url, params=params)
    data = response.json()['results']['bindings']

    vertices = []
    vertex_labels = {}
    for datum in data:
        vertices.append(datum[column1]['value'])
        vertices.append(datum[column2]['value'])
        vertex_labels[datum[column1]['value']] = datum[
            column1 + 'Label']['value']
        vertex_labels[datum[column2]['value']] = datum[
            column2 + 'Label']['value']
    vertices = set(vertices)
    vertices = OrderedDict(((vertex, n)
                            for n, vertex in enumerate(list(vertices), 1)))

    with open(filename, 'w') as f:
        f.write('*Vertices {}\n'.format(len(vertices)))
        for n, vertex in enumerate(vertices, 1):
            f.write('{} "{}"\n'.format(n, vertex_labels[vertex]))
        f.write('*arcs\n')
        for datum in data:
            arc1 = vertices[datum[column1]['value']]
            arc2 = vertices[datum[column2]['value']]
            if 'weight' in datum:
                weight = datum['weight']['value']
            else:
                weight = 1
            f.write('{} {} {}\n'.format(arc1, arc2, weight))


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['write-example-pajek-file']:
        write_pajek_from_sparql('example.net', EXAMPLE_SPARQL_QUERY)


if __name__ == '__main__':
    main()
