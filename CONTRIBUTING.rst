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
   https://github.com/WDscholia/scholia/tree/master/scholia/[…].
   Pull request to master branch.
