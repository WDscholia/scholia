.. include:: ../PULL_REQUEST_TEMPLATE

Create a pull request
=====================

To send your changes to Scholia you must create a pull request, if you want more information on how to do it you can
check the GitHub documentation on
`creating a pull request from a fork <https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork>`_.

When you're ready for feedback, submit a pull request.

Work in progress pull requests
------------------------------

In Scholia , we encourage submitting work-in-progress pull requests early and often. This allows you to share your code
to make it easier to get feedback and help with your changes. Prefix the titles of work-in-progress pull requests with
[WIP], which in our project means that you don't think your pull request is ready to be merged (e.g. it might not work
or pass tests). This sets expectations correctly for any feedback from other developers, and prevents your work from
being merged before you're confident in it.

Pull request steps
^^^^^^^^^^^^^^^^^^

1. Create a feature branch (not master)

2. Update your branch with git rebase

3. Push your updated branch to your remote fork

4. Open the pull request

You can use this template for your pull request.
:doc:`template <pull_request_template>`

Checks of pull requests
-----------------------
- Pull requests should have a reference to an issue number.
- Branches should be properly named with a name that is self-explanatory and has a reference to an issue number.
- The code must be run with `tox` for style, and test checks and any errors should be addressed. If it is not possible to fix the tox error, then it should be indicated and discussed.
- Pull requests should only address one single problem.
- Pull requests should not have superfluous code: Code used for debugging, code used to do other work.
- The code should be of a proper standard.
