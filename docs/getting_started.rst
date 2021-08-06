Getting started
===============

set up a local Scholia server for testing purposes

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

Rudimentary testing and code style checking are implemented via `tox <https://tox.readthedocs.io/en/latest/>`_.
Before committing, please run the following code in the main directory, as pull requests
which give `tox` errors are not directly merged:

.. code:: shell

    tox

The style is checked with `flake8`. Also follow the commit message recommendations,
cf. `Writing good commit messages <https://github.com/erlang/otp/wiki/writing-good-commit-messages>`_.
