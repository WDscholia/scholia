"""Test OJS."""


from scholia.scrape.ojs import paper_url_to_q


def test_paper_url_to_q():
    """Test paper_url_to_q."""
    # https://www.wikidata.org/wiki/Q61708017
    url = "https://journals.uio.no/index.php/osla/article/view/5855"
    assert paper_url_to_q(url) == "Q61708017"
