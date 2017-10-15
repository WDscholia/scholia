"""rss

Usage:
  scholia.rss author-latest <q>


Description:
  Interface to the Wikidata API and its bibliographic data.

Examples:
  $ python -m scholia.rss author-latest Q27061849
  <rss />

"""


from __future__ import print_function

import requests


def wb_get_author_latest_articles(q):
    if not q:
        return {}

    rssBody = '<?xml version="1.0" encoding="UTF-8" ?>\n'
    rssBody += '<rss version="2.0">\n'
    rssBody += '<channel>\n'
    rssBody += ' <title>Scholia - Latest Articles by ' + q + '</title>\n'
    rssBody += ' <description>This is an example of an RSS feed</description>\n'
    rssBody += ' <link>https://tools.wmflabs.org/scholia/author/' + q + '</link>\n'
    rssBody += ' <lastBuildDate>Mon, 06 Sep 2010 00:01:00 +0000</lastBuildDate>\n'
    rssBody += ' <pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>\n\n'

    articles = []
    for class_ in articles:
        rssBody += '<item />\n'

    rssBody += '</channel>\n'
    rssBody += '</rss>'
    
    return rssBody


def main():
    """Handle command-line arguments."""
    from docopt import docopt

    arguments = docopt(__doc__)

    if arguments['author-latest']:
        q = arguments['<q>']
        print(wb_get_author_latest_articles(q))


if __name__ == '__main__':
    main()
