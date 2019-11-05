"""Test scholia tex module."""

import json

from six import text_type, u

from scholia.tex import (
    entity_to_bibtex_entry, escape_to_tex,
    extract_dois_from_aux_string
)


WORK_ENTITY_JSON = """
{
  "pageid": 43110487,
  "ns": 0,
  "title": "Q41799598",
  "lastrevid": 835993998,
  "modified": "2019-01-17T08:13:58Z",
  "type": "item",
  "id": "Q41799598",
  "aliases": {},
  "claims": {
    "P31": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P31",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 13442814,
              "id": "Q13442814"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$16dc9dd4-45d0-099d-ff7b-91122ae5c145",
        "rank": "normal"
      }
    ],
    "P577": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P577",
          "datavalue": {
            "value": {
              "time": "+2017-10-11T00:00:00Z",
              "timezone": 0,
              "before": 0,
              "after": 0,
              "precision": 11,
              "calendarmodel": "http://www.wikidata.org/entity/Q1985727"
            },
            "type": "time"
          },
          "datatype": "time"
        },
        "type": "statement",
        "id": "Q41799598$8709cec7-4836-ba3e-c286-bb5c1d8979d0",
        "rank": "normal",
        "references": [
          {
            "hash": "401e60957ddd6c12604d742113b30206f39213b0",
            "snaks": {
              "P854": [
                {
                  "snaktype": "value",
                  "property": "P854",
                  "datavalue": {
                    "value": "https://zenodo.org/record/1009128",
                    "type": "string"
                  },
                  "datatype": "url"
                }
              ]
            },
            "snaks-order": [
              "P854"
            ]
          }
        ]
      }
    ],
    "P1476": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P1476",
          "datavalue": {
            "value": {
              "text": "Wembedder: Wikidata entity embedding web service",
              "language": "en"
            },
            "type": "monolingualtext"
          },
          "datatype": "monolingualtext"
        },
        "type": "statement",
        "id": "Q41799598$2668beb8-40d4-8b45-f2c1-3226176835d0",
        "rank": "normal"
      }
    ],
    "P1104": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P1104",
          "datavalue": {
            "value": {
              "amount": "+3",
              "unit": "1"
            },
            "type": "quantity"
          },
          "datatype": "quantity"
        },
        "type": "statement",
        "id": "Q41799598$82539df2-42a4-ee64-6181-3e591c40ec55",
        "rank": "normal"
      }
    ],
    "P50": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P50",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 20980928,
              "id": "Q20980928"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "2a1ced1dca90648ea7e306acbadd74fc81a10722",
              "datavalue": {
                "value": "1",
                "type": "string"
              },
              "datatype": "string"
            }
          ],
          "P1416": [
            {
              "snaktype": "value",
              "property": "P1416",
              "hash": "ee4f8580e42662cd631777daf72f5e52c1d48ec0",
              "datavalue": {
                "value": {
                  "entity-type": "item",
                  "numeric-id": 24283660,
                  "id": "Q24283660"
                },
                "type": "wikibase-entityid"
              },
              "datatype": "wikibase-item"
            }
          ]
        },
        "qualifiers-order": [
          "P1545",
          "P1416"
        ],
        "id": "Q41799598$3991666b-488b-ecc3-5686-8393ace8e7d8",
        "rank": "normal"
      }
    ],
    "P407": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P407",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 1860,
              "id": "Q1860"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$c73c9700-4294-883e-16d1-6c95dfc487ec",
        "rank": "normal"
      }
    ],
    "P921": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P921",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 2013,
              "id": "Q2013"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$4cb96734-4dae-9a14-3add-7d4a6a295c75",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P921",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 33003557,
              "id": "Q33003557"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$82b36eea-4098-e978-4af4-edb52b9f87e8",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P921",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 54872,
              "id": "Q54872"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$b3352ffd-41ac-1753-3854-c071f769391c",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P921",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 193424,
              "id": "Q193424"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$0584f703-4148-67e6-72a6-101d29272ce2",
        "rank": "normal"
      }
    ],
    "P275": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P275",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 20007257,
              "id": "Q20007257"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$c8d06335-43cc-c440-d644-dda593231959",
        "rank": "normal"
      }
    ],
    "P2860": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 32129681,
              "id": "Q32129681"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "2a1ced1dca90648ea7e306acbadd74fc81a10722",
              "datavalue": {
                "value": "1",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$99ac923c-496b-479a-6bff-4bb54a758fdb",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 28045598,
              "id": "Q28045598"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "7241753c62a310cf84895620ea82250dcea65835",
              "datavalue": {
                "value": "2",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$5ef4cf43-4f6d-919c-05da-b43e2f86139a",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 28822647,
              "id": "Q28822647"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "0e979f28bf306fefdcd352b4eb8dee5da2153a6d",
              "datavalue": {
                "value": "3",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$dbb89e4b-4564-3cb0-126a-d30ab47b0694",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 32138153,
              "id": "Q32138153"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "cbff8d4b3b7b35f905ef3147a7a6cb88845a774f",
              "datavalue": {
                "value": "4",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$67bb8e99-4c99-aa2f-1f5a-670f85320ca0",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 32132685,
              "id": "Q32132685"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$e309d135-429f-b800-6122-4f945f8a28be",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 27615040,
              "id": "Q27615040"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$f2732fe2-412a-f47e-01ca-dab04dbc41c4",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 24699014,
              "id": "Q24699014"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "9a4403310d2d27312d0a93830981a1e51b735843",
              "datavalue": {
                "value": "7",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$11e3d7f6-4bf3-7730-df05-c78af9c6e99b",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 30095029,
              "id": "Q30095029"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "94d4f77373c2051829a238495246b458b7737ef9",
              "datavalue": {
                "value": "8",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$94d320f3-4a83-272b-20f3-1dc3bb12463e",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 27036495,
              "id": "Q27036495"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "a9a9c98c803f52f2debc2c74270b3bd0c1f753d9",
              "datavalue": {
                "value": "9",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$96b74b67-4925-b7e5-facc-8a97bf8765d7",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 32000242,
              "id": "Q32000242"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "51210afb13f62d7537a51c61ba9b9586db143c24",
              "datavalue": {
                "value": "10",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$f4e3032a-4ae8-66ea-b397-9078f71c5fad",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 28942417,
              "id": "Q28942417"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "4fda4e2a606f90da339710b3368ca24eb2d05ec1",
              "datavalue": {
                "value": "11",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$038e6332-4490-4bb9-833b-84a2e9e10977",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 30246651,
              "id": "Q30246651"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "f156fb34fcce34ed7b7ab814d08b4f127f7d0c0a",
              "datavalue": {
                "value": "13",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$445a2ac7-4cee-cec0-c50d-47d4c5f9e79e",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 31769808,
              "id": "Q31769808"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$10b87ab9-45d5-3b89-ec08-0e1b5da354e8",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 31895639,
              "id": "Q31895639"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$ad6324e7-4e18-8a06-afac-05ca559dcd13",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 18507561,
              "id": "Q18507561"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$2ed9c1e0-4789-1e35-42ea-1ea0c3c20bf2",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 27044266,
              "id": "Q27044266"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$d54bda02-4719-4d8f-7db2-0e32c7e4c66a",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 28042398,
              "id": "Q28042398"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$3961bbb2-4421-c108-bca9-2654fa3287e8",
        "rank": "normal"
      },
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P2860",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 32856000,
              "id": "Q32856000"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "qualifiers": {
          "P1545": [
            {
              "snaktype": "value",
              "property": "P1545",
              "hash": "b1425a27074b51abb46a9cb949eb37d115c2204a",
              "datavalue": {
                "value": "12",
                "type": "string"
              },
              "datatype": "string"
            }
          ]
        },
        "qualifiers-order": [
          "P1545"
        ],
        "id": "Q41799598$3ba34138-42a0-7c8c-3f0c-953c758f0aca",
        "rank": "normal"
      }
    ],
    "P818": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P818",
          "datavalue": {
            "value": "1710.04099",
            "type": "string"
          },
          "datatype": "external-id"
        },
        "type": "statement",
        "id": "Q41799598$404aea26-4a4b-871d-861e-1107ae795ccc",
        "rank": "normal"
      }
    ],
    "P820": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P820",
          "datavalue": {
            "value": "stat.ML",
            "type": "string"
          },
          "datatype": "string"
        },
        "type": "statement",
        "id": "Q41799598$1e1fb40e-4cfe-8887-9bb7-3a75e1ac64d1",
        "rank": "normal"
      }
    ],
    "P953": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P953",
          "datavalue": {
            "value": "https://arxiv.org/pdf/1710.04099",
            "type": "string"
          },
          "datatype": "url"
        },
        "type": "statement",
        "id": "Q41799598$6a80e2d9-40a6-76cf-b264-3f5c3b0aa4f6",
        "rank": "normal"
      }
    ],
    "P859": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P859",
          "datavalue": {
            "value": {
              "entity-type": "item",
              "numeric-id": 28609468,
              "id": "Q28609468"
            },
            "type": "wikibase-entityid"
          },
          "datatype": "wikibase-item"
        },
        "type": "statement",
        "id": "Q41799598$f2efbc2c-4f7f-26b1-5824-a0e4c72dcdae",
        "rank": "normal",
        "references": [
          {
            "hash": "9591fcfc6e6d0ca680f9291861940feefd5d8d9c",
            "snaks": {
              "P1683": [
                {
                  "snaktype": "value",
                  "property": "P1683",
                  "datavalue": {
                    "value": {
                      "text": "The Danish Innovation Foundation",
                      "language": "en"
                    },
                    "type": "monolingualtext"
                  },
                  "datatype": "monolingualtext"
                }
              ]
            },
            "snaks-order": [
              "P1683"
            ]
          }
        ]
      }
    ],
    "P4011": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P4011",
          "datavalue": {
            "value": "6e4f9515292f06861b8a85456ca0822d719b1f94",
            "type": "string"
          },
          "datatype": "external-id"
        },
        "type": "statement",
        "id": "Q41799598$75c65a35-43b0-793f-2dc4-14ad376a33a7",
        "rank": "normal"
      }
    ],
    "P4028": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P4028",
          "datavalue": {
            "value": "5589148305318648270",
            "type": "string"
          },
          "datatype": "external-id"
        },
        "type": "statement",
        "id": "Q41799598$002752f8-46d6-40a3-5933-3357c7949051",
        "rank": "normal"
      }
    ],
    "P356": [
      {
        "mainsnak": {
          "snaktype": "value",
          "property": "P356",
          "datavalue": {
            "value": "10.5281/ZENODO.1009127",
            "type": "string"
          },
          "datatype": "external-id"
        },
        "type": "statement",
        "id": "Q41799598$962A3A6F-74DA-4275-8C58-1AD4818B0559",
        "rank": "normal"
      }
    ]
  },
  "sitelinks": {}
}
"""


def test_escape_to_tex():
    """Test escape_to_tex."""
    text = escape_to_tex(None)
    assert isinstance(text, text_type)

    text = escape_to_tex(u(''))
    assert isinstance(text, text_type)


def test_extract_dois_from_aux_string():
    """Test extract_dois_from_aux_string."""
    string = r"\citation{10.1186/S13321-016-0161-3}"
    dois = extract_dois_from_aux_string(string)
    assert dois == ['10.1186/S13321-016-0161-3']


def test_entity_to_bibtex_entry():
    """Text entity_to_bibtex_entry."""
    entity = json.loads(WORK_ENTITY_JSON)
    bibtex = entity_to_bibtex_entry(entity)
    assert isinstance(bibtex, text_type)
