from scholia.utils import remove_special_characters_url, string_to_type


def test_remove_special_characters_url():
    """Test for utils"""
    url = "http://127.0.0.1:8100/doi/10.1016/J.CELL.2011.03.022%20%E2%86%97"
    new_text = remove_special_characters_url(url)
    assert new_text == "http://127.0.0.1:8100/doi/10.1016/J.CELL.2011.03.022"


def test_string_to_type():
    """Test for utils"""
    test_cases = [
        ('0806.2878', 'arxiv'),
        ('2309.09978', 'arxiv'),
        ('arXiv:1501.00001v1', 'arxiv'),
        ('10.1371/JOURNAL.PONE.0029797', 'doi'),
        ('10.12987/YALE/9780300197051.003.0010', 'doi'),
        ('0261-3077', 'issn'),
        ('1934-340X', 'issn'),
        ('12345678', 'string'),
        ('scholia is the best', 'string'),
    ]

    for test, expected in test_cases:
        actual = string_to_type(test)
        assert actual == expected, f"{test} returned {actual}, not {expected}"
