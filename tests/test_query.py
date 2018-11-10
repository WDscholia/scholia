"""Test scholia query module."""


from scholia.query import doi_to_qs, q_to_class


def test_q_to_class_organization():
    """Test for organization in class detection."""
    # Technical university
    assert 'organization' == q_to_class('Q1269766')


def test_q_to_class_publisher():
    """Test for publisher in class detection."""
    # University publisher
    assert 'publisher' == q_to_class('Q7894425')

    # Publisher
    assert 'publisher' == q_to_class('Q2188')


def test_q_to_class_venue():
    """Test for venue in class detection."""
    # Scientific journal
    assert 'venue' == q_to_class('Q2000010')

    # Proceedings
    assert 'venue' == q_to_class('Q27611219')


def test_doi_to_qs():
    """Test for DOI search on Wikidata.

    This test requires Internet access to Wikidata Query Service.

    """
    dois = doi_to_qs('10.1145/3184558.3191645')
    assert dois == ['Q50347076']
