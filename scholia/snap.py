from typing import Any

from snapquery.snapquery_core import QueryName, NamedQueryManager, QueryBundle

__all__ = [
    "get_snapquery_records",
]

#: See documentation at https://snapquery.bitplan.com/docs
API_ENDPOINT_FMT = "https://snapquery.bitplan.com/api/query/{domain}/{namespace}/{name}"

type Result = dict[str, Any]
type Results = list[Result]


def get_snapquery_records(
    name: str, q: str, *, endpoint_name: str | None = None,
) -> Results:
    return from_programmatic_api(
        name=name,
        domain="scholia.toolforge.org",
        namespace="named_queries",
        params={"q": q},
        endpoint_name=endpoint_name,
    )


def from_programmatic_api(
    name: str,
    namespace: str,
    domain: str,
    *,
    endpoint_name: str | None = None,
    params: dict[str, Any] | None = None,
    limit: int | None = None,
) -> Results:
    if params is not None and {"q"} != set(params):
        raise NotImplementedError("can only support a single parameter, `q`")

    query_manager = NamedQueryManager.from_samples()
    query_name: QueryName = QueryName.from_query_id(
        query_id=name,
        namespace=namespace,
        domain=domain,
    )
    query_bundle: QueryBundle = query_manager.get_query(
        query_name=query_name,
        endpoint_name=endpoint_name or "wikidata",
        limit=limit,
    )
    rv = query_bundle.sparql.queryAsListOfDicts(
        query_bundle.query.query,
        param_dict=params,
        # {"q": "Q80"}  # Tim Berners-Lee
    )
    # would be nice to extend get_lod to
    # rv = query_bundle.get_lod(param_dict=params)
    return rv


def main():
    """"""
    # TODO make sure you load up the queries into the local database
    # snapquery --import /Users/cthoyt/dev/snapquery/snapquery/samples/scholia.json

    # see https://snapquery.bitplan.com/query/scholia.toolforge.org/named_queries/author_list-of-publications
