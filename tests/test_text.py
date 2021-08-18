"""Test scholia text module."""


import mock
from scholia.text import load_text_to_topic_q_text


class RequestMock:
    """
    Mock class used for unit test, based on a request from wikidata query service
    """

    @staticmethod
    def json():
        """
        used for simulate request.json() from requests.get()

        Returns
        -------
        mock: dict
            Dictionary where the keys are labels associated with Wikidata
            Q identifiers
        """
        return {
            "results": {
                "bindings": [
                    {
                        "topic_label": {"value": "brain"},
                        "topic": {"value": "0123456789012345678901234567890Q1073"},
                    }
                ]
            }
        }


@mock.patch("requests.get")
def test_text_to_topic_q_text(mock_request):
    """Test for class."""
    mock_request.return_value = RequestMock()
    text_to_topic_q_text = load_text_to_topic_q_text()
    qs = text_to_topic_q_text.text_to_topic_qs("brain")
    assert qs == ["Q1073"]
