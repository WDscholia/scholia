|logo|

|website| |gitpod| |github| |issues| |license| |docs|

.. |logo| image:: scholia/app/static/images/scholia_logo.svg
   :width: 10%
   :alt: Scholia

.. |website| image:: https://img.shields.io/website-up-down-green-red/http/scholia.toolforge.org.svg
           :target: https://scholia.toolforge.org/
           :alt: Website

.. |gitpod| image:: https://img.shields.io/badge/Gitpod-Open%20in%20Gitpod-%230092CF.svg
           :target: https://gitpod.io/#https://github.com/WDscholia/scholia
           :alt: Gitpod
.. |github| image:: https://img.shields.io/github/last-commit/WDscholia/scholia.svg
   :target: https://github.com/WDscholia/scholia
   :alt: Github last commit
.. |issues| image:: https://img.shields.io/github/issues/WDScholia/scholia.svg
   :target: https://github.com/WDscholia/scholia/issues
   :alt: GitHub issues
.. |license| image:: https://img.shields.io/badge/License-GPLv3-blue.svg
   :target: https://github.com/WDscholia/scholia/blob/master/LICENSE
   :alt: License
.. |docs| image:: https://readthedocs.org/projects/scholia/badge/?version=latest
   :target: https://scholia.readthedocs.io/en/latest/?badge=latest
   :alt: Documentation Status

=======

Scholia is a python package and webapp for interaction with scholarly information in Wikidata_.

Installation
------------
Scholia can be installed directly from GitHub with:

.. code-block:: shell

    $ python3 -m pip install git+https://github.com/WDscholia/scholia

It can be installed in development mode with:

.. code-block:: shell

    $ git clone https://github.com/WDscholia/scholia
    $ cd scholia
    $ pip install --editable .

Webapp
------

As a webapp, it currently runs from `Wikimedia Toolforge`_, a facility provided by the `Wikimedia Foundation`_. It is accessible from

    https://scholia.toolforge.org/

The webapp displays scholarly profiles for individual researchers, research topics, organizations, journals, works, events, awards and so on. For instance, the scholarly profile for psychologist Uta Frith is accessible from

    https://scholia.toolforge.org/author/Q8219

The information displayed on the page is only what is available in Wikidata.

Run locally after installing with ``pip``:

.. code-block:: sh

    $ scholia run

Script
------

It is possible to use methods of the scholia package as a script:

.. code-block:: sh

    $ python -m scholia.query twitter-to-q fnielsen
    Q20980928


Contributing
------------

A simple way to get up and running is to `launch Scholia via Gitpod`_, which installs the dependencies listed in `requirements.txt`_ automatically and launches the web app via `runserver.py`_.

See file `CONTRIBUTING.rst`_ for technical details on how to improve Scholia.

.. _Wikidata: https://www.wikidata.org
.. _Wikimedia Foundation: https://wikimediafoundation.org
.. _Wikimedia Toolforge: https://toolforge.org/
.. _launch Scholia via Gitpod: https://gitpod.io/#https://github.com/WDscholia/scholia
.. _CONTRIBUTING.rst: https://github.com/WDscholia/scholia/blob/main/CONTRIBUTING.rst
.. _requirements.txt: https://github.com/WDscholia/scholia/blob/main/requirements.txt
.. _runserver.py: https://github.com/WDscholia/scholia/blob/main/runserver.py

References
----------
- Scholia's page about itself: https://scholia.toolforge.org/topic/Q45340488
- Wikidata overview page about Scholia: https://www.wikidata.org/wiki/Wikidata:Scholia
- Lane Rasberry, Egon Willighagen, Finn Nielsen, Daniel Mietchen, "Robustifying Scholia: paving the way for knowledge discovery and research assessment through Wikidata. Research Ideas and Outcomes", 2019, RIO Journal, 5: e35820. https://doi.org/10.3897/rio.5.e35820
- Finn Årup Nielsen, Daniel Mietchen, Egon Willighagen, "Scholia and scientometrics with Wikidata", Joint Proceedings of the 1st International Workshop on Scientometrics and 1st International Workshop on Enabling Decentralised Scholarly Communication, 2017. http://ceur-ws.org/Vol-1878/article-03.pdf
- Finn Årup Nielsen, Daniel Mietchen, Egon Willighagen, "Scholia, Scientometrics and Wikidata", The Semantic Web: ESWC 2017 Satellite Events, 2017. DOI: `10.1007/978-3-319-70407-4_36 <https://doi.org/10.1007/978-3-319-70407-4_36>`_. https://link.springer.com/content/pdf/10.1007%2F978-3-319-70407-4_36.pdf
