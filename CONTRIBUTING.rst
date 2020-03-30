Contributing to Scholia
=======================

Source code and issue tracker
----------------------------

Scholia development is hosted at https://github.com/fnielsen/scholia.

Technology stack
---------------

Scholia is mainly based on

-  Python (>= 2.7)
-  HTML with `Bootstrap CSS <https://getbootstrap.com/css/>`__
-  JavaScript with `jQuery <https://jquery.com/>`__ and
   `wikidata-sdk <https://github.com/maxlath/wikidata-sdk>`__
-  SPARQL to query the `Wikidata Query
   Service <http://query.wikidata.org/>`__

Getting started - set up a local scholia server for testing purposes
---------------

1. Clone Scholia repository from GitHub

   ::

       $ git clone https://github.com/fnielsen/scholia.git     # via HTTPS
       $ git clone git@github.com:fnielsen/scholia.git         # or via SSH

2. Install required Python libraries:

   .. code:: shell

       $ pip install -r requirements.txt   # either globally
       $ pip install -r requirements.txt   # or locally

   On Debian 8/9 you need to install the packages python3, python3-pip, and python3-flask and use pip3:

   .. code:: shell

       $ apt-get install python3 python3-pip python3-flask
       $ pip3 install -r requirements.txt

3. Run Scholia functionality as a script, e.g.:

   .. code:: shell

       $ python -m scholia.query twitter-to-q fnielsen
       Q20980928

4. Run Scholia locally as a web application

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

Checks of pull requests
-----------------------
- Pull requests should have a reference to an issue number.
- Branches should have be properly named with a name that is self-explanatory and reference to an issue number.
- The code must be run with `tox` for style and test checks and any errors should be addressed. If it is not possible to fix the tox error then it should be indicated and discussed.
- Pull requests should only address one single problem.
- Pull requests should not have superfluous code: Code used for debugging, code used to other work.
- The code should be a of proper standard. 

Examples
-------

Adding new SPARQL queries to Scholia

1. Assign the task for yourself (if it is in an issue tracker)

2. Get the new query e.g. Example from https://github.com/fnielsen/scholia/pull/848/files 

.. code:: sparql

   SELECT DISTINCT ?author ?authorLabel ?award ?awardLabel WHERE {
     ?item wdt:P1433 wd:{{ q }} ;
           wdt:P50 ?author .
     ?author wdt:P166 ?award .
     SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }  
   }

3. Add a name e.g. authorAwardsSparql to the query and the whole thing to your version/fork of the file https://github.com/fnielsen/scholia/tree/master/scholia/[…]

.. code:: javascript

   authorAwardsSparql = `
   SELECT DISTINCT ?author ?authorLabel ?award ?awardLabel WHERE {
     ?item wdt:P1433 wd:{{ q }} ;
           wdt:P50 ?author .
     ?author wdt:P166 ?award .
     SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }  
   }
   `

4. Add that name to the sparql-to-data table

.. code:: javascript

   sparqlToDataTable(authorAwardsSparql, "#author-awards");

5. Add some table formatting

.. code:: html

   <h2 id="Author-awards">Author awards</h2>
   
   <table class="table table-hover" id="author-awards"></table>

6. Pull request to master file

