Contributing to Scholia
=======================

Source code and issue tracker
-----------------------------

Scholia development is hosted at https://github.com/WDscholia/scholia.

Technology stack
----------------

Scholia is mainly based on

-  Python (>= 2.7)
-  HTML with `Bootstrap CSS <https://getbootstrap.com/css/>`__
-  JavaScript with `jQuery <https://jquery.com/>`__ and
   `wikidata-sdk <https://github.com/maxlath/wikidata-sdk>`__
-  SPARQL to query the `Wikidata Query
   Service <http://query.wikidata.org/>`__

Getting started - set up a local Scholia server for testing purposes
--------------------------------------------------------------------

1. Clone Scholia repository from GitHub

   .. code:: shell

       $ git clone https://github.com/WDscholia/scholia.git     # via HTTPS
       $ git clone git@github.com:WDscholia/scholia.git         # or via SSH

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
Before committing, please run the following code in the main directory, as pull requests
which give `tox` errors are not directly merged:

.. code:: shell

    tox

The style is checked with `flake8`. Also follow the commit message recommendations, 
cf. `Writing good commit messages <https://github.com/erlang/otp/wiki/writing-good-commit-messages>`_.

Checks of pull requests
-----------------------
- Pull requests should have a reference to an issue number.
- Branches should be properly named with a name that is self-explanatory and has a reference to an issue number.
- The code must be run with `tox` for style, and test checks and any errors should be addressed. If it is not possible to fix the tox error, then it should be indicated and discussed.
- Pull requests should only address one single problem.
- Pull requests should not have superfluous code: Code used for debugging, code used to do other work.
- The code should be of a proper standard. 

Examples
--------

Adding new SPARQL queries to Scholia:

1. Assign the task for yourself (if it is in an issue tracker)

2. Write a new query and add it in a template file (e.g. in  ``/app/templates/sparql/author_awards.sparql``)
   where the file names starts with the aspect name. Note that ``{{ q }}`` will be formatted based on the page that renders the template.
   See example at https://github.com/WDscholia/scholia/pull/848/files.

.. code:: sparql

   SELECT DISTINCT ?author ?authorLabel ?award ?awardLabel WHERE {
     ?item wdt:P1433 wd:{{ q }} ;
           wdt:P50 ?author .
     ?author wdt:P166 ?award .
     SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }  
   }

3. The external SPARQL can be included in the templating system for both tables and iframes:

.. code:: javascript

   {{ sparql_to_table('recent-literature') }}
   {{ sparql_to_iframe('publications-per-year') }}

4. Add some table formatting

.. code:: html

   <h2 id="recent-literature-header">Structural Information</h2>
   
   <table class="table table-hover" id="recent-literature-table"></table>

And iframe formatting:

.. code:: html

   <h2 id="publications-per-year">Publications per year</h2>

   <div class="embed-responsive embed-responsive-16by9">
     <iframe class="embed-responsive-item" id="publications-per-year-iframe" ></iframe>
   </div>

5. Add the whole thing to your version/fork of the file
   https://github.com/WDscholia/scholia/tree/main/scholia/[…].
   Pull request to the main branch.
