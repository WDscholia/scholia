Scholia
=======

Scholia is a python package and webapp for interaction with scholarly information in Wikidata_.


Webapp
------

As a webapp, it currently runs from `Wikimedia Tool Labs`_, a facility provided by the `Wikimedia Foundation`_. It is accessible from

    https://tools.wmflabs.org/scholia/

The webapp displays the scholarly profile for individual researchers, for instance the scholarly profile for psychologist Uta Frith is accessible from

    https://tools.wmflabs.org/scholia/author/Q8219
    
The information displayed on the page is only what is available in Wikidata.


Script
------

It is possible to use methods of the scholia package as a script:
::
    $ python -m scholia.query twitter-to-q fnielsen
    Q20980928


Contributing
------------

A simple way to get up and running is to launch Scholia via Gitpod:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/fnielsen/scholia)

See file CONTRIBUTING.rst for technical details how to improve Scholia.

.. _Wikidata: https://www.wikidata.org
.. _Wikimedia Foundation: https://wikimediafoundation.org
.. _Wikimedia Tool Labs: https://tools.wmflabs.org/

References
---------
- Scholia's page about itself: https://tools.wmflabs.org/scholia/topic/Q45340488
- Finn Årup Nielsen, Daniel Mietchen, Egon Willighagen, "Scholia and scientometrics with Wikidata", Joint Proceedings of the 1st International Workshop on Scientometrics and 1st International Workshop on Enabling Decentralised Scholarly Communication, 2017. http://ceur-ws.org/Vol-1878/article-03.pdf
- Finn Årup Nielsen, Daniel Mietchen, Egon Willighagen, "Scholia, Scientometrics and Wikidata", The Semantic Web: ESWC 2017 Satellite Events, 2017. DOI: `10.1007/978-3-319-70407-4_36 <https://doi.org/10.1007/978-3-319-70407-4_36>`_. https://link.springer.com/content/pdf/10.1007%2F978-3-319-70407-4_36.pdf
