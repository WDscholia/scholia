Scholia
=======

Scholia is a python package and webapp for interaction with scholarly information in Wikidata_.


Webapp
------

As a webapp it currently runs from `Wikimedia Tool Labs`_, a facility provided by the `Wikimedia Foundation`_. It is accessible from

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

See file CONTRIBUTING.rst for technical details how to improve Scholia.

.. _Wikidata: https://www.wikidata.org
.. _Wikimedia Foundation: https://wikimediafoundation.org
.. _Wikimedia Tool Labs: https://tools.wmflabs.org/

