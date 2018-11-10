Contributing to Scholia
=======================

Source code an issue tracker
----------------------------

Scholia development is hosted at https://github.com/fnielsen/scholia.

Technolgy stack
---------------

Scholia is mainly based on

-  Python (>= 2.7)
-  HTML with `Bootstrap CSS <https://getbootstrap.com/css/>`__
-  JavaScript with `jQuery <https://jquery.com/>`__ and
   `wikidata-sdk <https://github.com/maxlath/wikidata-sdk>`__
-  SPARQL to query the `Wikidata Query
   Service <http://query.wikidata,org/>`__

Getting started
---------------

1. Clone Scholia repository from GitHub

   ::

       $ git clone https://github.com/fnielsen/scholia.git     # via HTTPS
       $ git clone git@github.com:fnielsen/scholia.git         # or via SSH

2. Install required Python libraries:

   .. code:: shell

       $ pip install -r requirements.txt   # either global
       $ pip install -r requirements.txt   # or locally

   On Debian 8/9 you need to install the packages python3, python3-pip, and python3-flask and use pip3:

   .. code:: shell

       $ apt-get install python3 python3-pip python3-flask
       $ pip3 install -r requirements.txt

3. Run Scholia functionality as script, e.g.:

   .. code:: shell

       $ python -m scholia.query twitter-to-q fnielsen
       Q20980928

4. Run Scholia locally as web application

   .. code:: shell

       python runserver.py

Testing
-------

Rudimentary testing and code style checking are implemented via `tox`.
Before committing please run the following code in the main directory:

.. code:: shell

    tox

The style is checked with `flake8`. Also follow the commit message recommendations, 
cf. `Writing good commit messages <https://github.com/erlang/otp/wiki/writing-good-commit-messages>`_.
