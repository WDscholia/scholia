"""scholia.text.

Usage:
  scholia.text text-to-topic-qs <text>

Options:
  -h | --help  Help

Description:
  Handle text.

  `text-to-topic-qs` command will setup a matching method that can convert a
  text to Wikidata Q identifiers associated with topics of scientific articles.
  The setup will call the Wikidata Query Service to setup a regular expression
  for the matching.

  The result of the text-to-topic-qs command-line command can be used to query
  Scholia:

  https://tools.wmflabs.org/scholia/topics/<qs>

"""

import re

import requests


TOPIC_LABELS_SPARQL = """
SELECT ?topic ?topic_label
WITH {
  SELECT DISTINCT ?topic WHERE {
    ?work wdt:P31 wd:Q13442814 .
    ?work wdt:P921 ?topic .
  }
} AS %topics
WHERE {
  INCLUDE %topics
  ?topic rdfs:label | skos:altLabel ?topic_label_ .
  FILTER(LANG(?topic_label) = 'en')
  BIND(LCASE(?topic_label_) AS ?topic_label)
}
"""


Q_PATTERN = re.compile('Q\d+', flags=re.UNICODE | re.DOTALL)


class TextToTopicQText():
    """Converter of text to Wikidata Q identifier data.

    Attributes
    ----------
    mapper : dict
        Dictionary between labels and associated Wikidata Q identifiers
    pattern : re.SRE_Pattern
        Regular expression pattern for matching Wikidata labels.

    """

    def __init__(self):
        """Setup attributes."""
        self.mapper = self.get_mapper()

        tokens = self.mapper.keys()
        tokens = sorted(tokens, key=len, reverse=True)
        tokens = [re.escape(token) for token in tokens if len(token) > 3]

        regex = '(?:' + "|".join(tokens) + ')'
        regex = r"\b" + regex + r"\b"
        regex = '(' + regex + ')'

        self.pattern = re.compile(regex, flags=re.UNICODE | re.DOTALL)

    def get_mapper(self):
        """Return mapper between label and Wikidata item.

        Query the Wikidata Query service to get Wikidata identifiers
        and associated labels and convert them to a dictionary.

        Returns
        -------
        mapper : dict
            Dictionary where the keys are labels associated with Wikidata
            Q identifiers.

        Notes
        -----
        This function queries the Wikidata Query SERVICE with a static
        SPARQL query. It well take some time to complete, perhaps 20 seconds
        or more.

        """
        response = requests.get(
            'https://query.wikidata.org/sparql',
            params={'query': TOPIC_LABELS_SPARQL, 'format': 'json'})
        response_data = response.json()
        data = response_data['results']['bindings']

        mapper = {}
        for datum in data:
            mapper[datum['topic_label']['value']] \
                = datum['topic']['value'][31:]

        return mapper

    def _repl(self, match_object):
        """Convert match object to mapped value."""
        return self.mapper[match_object.group(0)]

    def text_to_topic_q_text(self, text):
        """Convert text to q-text.

        Parameters
        ----------
        text : str
            Text to be matched.

        Returns
        -------
        q_text : str
            Text with words and phrases substituted with Wikidata Q
            identifiers.

        """
        return self.pattern.sub(self._repl, text.lower())

    def text_to_topic_qs(self, text):
        """Return Wikidata Q identifiers from text matching.

        Parameters
        ----------
        text : str
            Text to be matched.

        Returns
        -------
        qs : list of str
            List with Wikidata Q identifiers as strings.

        """
        return Q_PATTERN.findall(self.text_to_topic_q_text(text))

    __call__ = text_to_topic_q_text


text_to_topic_q_text = TextToTopicQText()

text_to_topic_qs = TextToTopicQText()
text_to_topic_qs.__call__ = text_to_topic_qs.text_to_topic_qs


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['text-to-topic-qs']:
        qs = text_to_topic_qs(arguments['<text>'])
        print(",".join(qs))


if __name__ == '__main__':
    main()
