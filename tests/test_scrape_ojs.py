"""Test scholia scrape ojs module."""


from scholia.scrape.ojs import scrape_paper_from_url


def test_scrape_paper_from_url():
    """Test scraping of OJS article."""
    paper = scrape_paper_from_url(
        'https://tidsskrift.dk/stenomusen/article/view/120902')
    assert paper['pages'] == "11"
    assert paper['language_q'] == 'Q9035'
    assert paper['issue'] == '81'
    assert paper['title'] == 'Stenomusen på tidsskrift.dk'
    assert paper['date'] == '2020-06-15'
    assert (paper['url'] ==
            'https://tidsskrift.dk/stenomusen/article/view/120902')
