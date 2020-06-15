"""scholia.text.

Usage:
  scholia.text text-to-topic-qs <text>
  scholia.text text-to-topic-q-text-setup

Options:
  -h --help  Help

Description:
  Handle text.

  `text-to-topic-qs` command will setup a matching method that can convert a
  text to Wikidata Q identifiers associated with topics of scientific articles.
  The setup will call the Wikidata Query Service to setup a regular expression
  for the matching.

  The result of the text-to-topic-qs command-line command can be used to query
  Scholia:

  https://scholia.toolforge.org/topics/<qs>

"""

from __future__ import print_function

from os import makedirs
from os.path import exists, expanduser, join

from six.moves import cPickle as pickle

import re

from simplejson import JSONDecodeError

import requests


TOPIC_LABELS_SPARQL = """
SELECT ?topic ?topic_label
WITH {
  SELECT DISTINCT ?topic WHERE {
    []

    # Disabled because of performance
    # wdt:P31 wd:Q13442814 ;

    wdt:P921 ?topic .
  }
} AS %topics
WHERE {
  INCLUDE %topics
  ?topic rdfs:label | skos:altLabel ?topic_label_ .
  FILTER(LANG(?topic_label_) = 'en')
  BIND(LCASE(?topic_label_) AS ?topic_label)
}
"""


Q_PATTERN = re.compile(r'Q\d+', flags=re.UNICODE | re.DOTALL)

SCHOLIA_DATA_DIRECTORY = join(expanduser('~'), '.scholia')

TEXT_TO_TOPIC_Q_TEXT_FILENAME = join(
    SCHOLIA_DATA_DIRECTORY, 'text_to_topic_q_text.pck')


class TextToTopicQText():
    """Converter of text to Wikidata Q identifier data.

    Attributes
    ----------
    mapper : dict
        Dictionary between labels and associated Wikidata Q identifiers.
    pattern : re.SRE_Pattern
        Regular expression pattern for matching Wikidata labels.

    """

    def __init__(self):
        """Set up attributes."""
        self.headers = {'User-Agent': 'Scholia'}

        directory = SCHOLIA_DATA_DIRECTORY
        if not exists(directory):
            makedirs(directory)
        self.filename = TEXT_TO_TOPIC_Q_TEXT_FILENAME

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
        This method queries the Wikidata Query Service with a static
        SPARQL query. It well take some time to complete, perhaps 30 seconds
        or more.

        In some cases a timeout may occur in the middle of a response,
        making the JSON return invalid. The method will try second time.
        If this also fails, then the method will raise an exception.

        """
        response = requests.get(
            'https://query.wikidata.org/sparql',
            params={'query': TOPIC_LABELS_SPARQL, 'format': 'json'},
            headers=self.headers)

        try:
            response_data = response.json()
        except JSONDecodeError:
            # In some cases a timeout may occur in the middle of a response,
            # making the JSON returned invalid.
            response = requests.get(
                'https://query.wikidata.org/sparql',
                params={'query': TOPIC_LABELS_SPARQL, 'format': 'json'},
                headers=self.headers)
            try:
                response_data = response.json()
            except JSONDecodeError:
                # TODO: We may end here due to timeout or (perhaps?) invalid
                # JSON in the cache. It is unclear what we can do to escape
                # this problem other than wait. Here is made an empty response.
                response_data = {'results': {'bindings': []}}

        data = response_data['results']['bindings']

        mapper = {}
        for datum in data:
            mapper[datum['topic_label']['value']] \
                = datum['topic']['value'][31:]

        return mapper

    def _repl(self, match_object):
        """Convert match object to mapped value."""
        return self.mapper[match_object.group(0)]

    def save(self, filename=None):
        """Save object."""
        if not filename:
            filename = self.filename

        pickle.dump(self, open(filename, 'w'))

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


def load_text_to_topic_q_text():
    """Load an object that is already set up.

    Load the TextToTopicQText object from a pickle file and if it is not
    available set it up from the object.

    Returns
    -------
    text_to_topic_q_text : TextToTopicQText
        Text-to-topic-q-text object that is set up and ready to use.

    """
    try:
        return pickle.load(open(TEXT_TO_TOPIC_Q_TEXT_FILENAME, 'rb'))
    except IOError:
        return TextToTopicQText()


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['text-to-topic-qs']:
        text_to_topic_q_text = load_text_to_topic_q_text()
        qs = text_to_topic_q_text.text_to_topic_qs(arguments['<text>'])
        print(",".join(qs))

    elif arguments['text-to-topic-q-text-setup']:
        text_to_topic_q_text = TextToTopicQText()

        # http://stefaanlippens.net/python-pickling-and-dealing-
        # with-attributeerror-module-object-has-no-attribute-thing.html
        TextToTopicQText.__module__ = 'scholia.text'

        text_to_topic_q_text.save()
        print('{} saved'.format(TEXT_TO_TOPIC_Q_TEXT_FILENAME))


if __name__ == '__main__':
    main()
