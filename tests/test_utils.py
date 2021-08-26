from scholia.utils import remove_special_characters_url


def test_remove_special_characters_url():
    """Test for utils"""
    url = "http://127.0.0.1:8100/doi/10.1016/J.CELL.2011.03.022%20%E2%86%97"
    new_text = remove_special_characters_url(url)
    assert new_text == "http://127.0.0.1:8100/doi/10.1016/J.CELL.2011.03.022"
