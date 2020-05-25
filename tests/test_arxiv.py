"""Test scholia arxiv module."""


from scholia.arxiv import get_metadata


def test_get_metadata():
    """Text for querying arxiv and metadata extration."""
    metadata = get_metadata('1503.00759')
    assert metadata['title'] == ('A Review of Relational Machine Learning for '
                                 'Knowledge Graphs')
    assert metadata['publication_date'] == '2015-09-28'
    assert metadata['doi'] == '10.1109/JPROC.2015.2483592'

    metadata = get_metadata('1803.04349')
    assert metadata['publication_date'] == '2018-03-05'
    assert metadata['full_text_url'] == "https://arxiv.org/pdf/1803.04349.pdf"

    metadata = get_metadata('1710.04099')
    assert metadata['publication_date'] == '2017-10-11'
