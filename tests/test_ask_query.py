"""Test scholia ask queries."""

import re
import requests

from scholia.config import config

USER_AGENT = "Scholia"
HEADERS = {"User-Agent": USER_AGENT}


def test_venue_cito():
    file_name = "ask_venue_cito.sparql"

    true_case = "Q6294930"  # Journal of Cheminformatics
    false_case = "Q4775205"  # Antiquity

    assert ask_query(file_name, true_case) == True
    assert ask_query(file_name, false_case) == False


def test_work_cito():
    file_name = "ask_work_cito.sparql"

    true_case = "Q21090124"  # Impact of environment and social gradient on Leptospira infection in urban slums
    false_case = "Q21090025"  # The Alzheimer's disease-associated amyloid beta-protein is an antimicrobial peptide

    assert ask_query(file_name, true_case) == True
    assert ask_query(file_name, false_case) == False


def test_work_gallery():
    file_name = "ask_work_gallery.sparql"

    true_case = "Q19966966"  # One hundred and one new species of Trigonopterus weevils from New Guinea
    false_case = "Q22241243"  # Zika virus outside Africa

    assert ask_query(file_name, true_case) == True
    assert ask_query(file_name, false_case) == False


def ask_query(file_name, q_number):
    file_path = "scholia/app/templates/" + file_name
    with open(file_path) as read:
        query = " ".join([line for line in read])

    query = re.sub(r"\{\{ ?q ?\}\}", q_number, query)

    url = config['query-server']['sparql_endpoint']
    params = {"query": query, "format": "json"}
    response = requests.get(url, params=params, headers=HEADERS)

    return response.json()["boolean"]
