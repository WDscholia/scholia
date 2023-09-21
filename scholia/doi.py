"""doi.

Usage:

Options:

References
----------
  https://doi.org

"""

import re

import requests

USER_AGENT = "Scholia"

CROSSREF_URL = "https://api.crossref.org/v1/works/"


def get_doi_metadata(doi):
    """Get metadata about a DOI from Crossref API.

    Uses the Crossref API to return the metadata for the paper in a dictionary.

    Parameters
    ----------
    doi : str
        DOI identifier.

    Returns
    -------
    metadata : dict
        Dictionary with metadata.

    Notes
    -----
    Works with raw DOIs and doi.org URLs

    References
    ----------

    Examples
    --------
    >>> metadata = get_metadata('10.1177/0269216319865414')
    >>> metadata['publication_date'] == '2019-09-05'
    True

    """
    doi = doi.strip()

    url = CROSSREF_URL + doi

    try:
        response = requests.get(url)

        if response.status_code == 200:
            entry = response.json()["message"]

            d = entry["issued"]["date-parts"][0]
            if len(d) == 3:
                date = f"{d[0]}-{d[1]:02d}-{d[2]:02d}"
            else:
                date = ""
            
            metadata = {
                "doi": entry.get("DOI"),
                "authornames": [
                    author.get("given") + " " + author.get("family")
                    for author in entry.get("author", [])
                ],
                "full_text_url": entry.get("resource", {}).get("primary", {}).get("URL"),
                "publication_date": date,
                # Some titles may have a newline in them. This should be converted to
                # an ordinary space character
                "title": re.sub(r"\s+", " ", entry["title"][0]),
            }

            return metadata
        else:
            # Handle non-200 status codes (e.g., 404, 500) appropriately
            return {"error": f"Request failed with status code {response.status_code}"}

    except requests.exceptions.RequestException as e:
        # connection timeout, DNS resolution error, etc
        return {"error": f"Request failed due to a network error: {e}"}

    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}


def string_to_doi(string):
    """Extract doi id from string.

    The DOI identifier part of `string` will be extracted. If multiple
    identifier patterns are in the input string then only the first
    is returned.

    Parameters
    ----------
    string : str
        String with doi ID.

    Returns
    -------
    doi : str or None
        String with doi ID.

    Examples
    --------
    >>> string_to_doi('10.1371/JOURNAL.PONE.0029797')
    '10.1371/JOURNAL.PONE.0029797'
    >>> string_to_doi('https://doi.org/10.12987/YALE/9780300197051.003.0010')
    '10.12987/YALE/9780300197051.003.0010'
    >>> doi.string_to_doi('https://doi.org/10')
    >>>

    """
    PATTERN = re.compile(r"(?i)10.\d{4,9}/[^\s]+", flags=re.DOTALL | re.UNICODE)
    dois = PATTERN.findall(string)
    if len(dois) > 0:
        return dois[0].upper()
    return None


def main():
    """Handle command-line interface."""
    print("undefined")


if __name__ == "__main__":
    main()
