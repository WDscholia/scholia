"""Test scholia query module."""


from scholia.query import q_to_class


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
