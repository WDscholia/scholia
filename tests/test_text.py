"""Test scholia text module."""


from scholia.text import load_text_to_topic_q_text


def test_text_to_topic_q_text():
    """Test for class."""
    text_to_topic_q_text = load_text_to_topic_q_text()
    qs = text_to_topic_q_text.text_to_topic_qs('brain')
    assert qs == ['Q1073']
