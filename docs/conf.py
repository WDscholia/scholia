from pallets_sphinx_themes import ProjectLink
# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
import os
import re
import sys
sys.path.insert(0, os.path.abspath('..'))


# -- Project information -----------------------------------------------------

project = 'Scholia'
copyright = '2022, Scholia maintainers'
author = 'Scholia'

# The full version, including alpha/beta/rc tags
import scholia
release = scholia.__version__
version = re.sub(r'(\d+\.\d+)\.\d+(.*)', r'\1\2', scholia.__version__)
version = re.sub(r'(\.dev\d+).*?$', r'\1', version)


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',

    # Napoleon is to let Sphinx identify the components of Numpy documentation
    # convention docstrings
    'sphinx.ext.napoleon',
]

master_doc = 'index'

source_suffix = ['.rst', '.md']

# Add any paths that contain templates here, relative to this directory.
templates_path = ['_templates']

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']


# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.

html_theme = "sphinx_rtd_theme"

html_context = {
    "project_links": [
        ProjectLink("Source Code", "https://github.com/WDscholia/scholia"),
        ProjectLink(
            "Issue Tracker", "https://github.com/WDscholia/scholia/issues"
        ),
        ProjectLink("Website", "https://scholia.toolforge.org/"),
    ]
}
html_sidebars = {
    "index": ["project.html", "localtoc.html", "searchbox.html"],
    "**": ["localtoc.html", "relations.html", "searchbox.html"],
}
singlehtml_sidebars = {"index": ["project.html", "localtoc.html"]}

html_static_path = ["_static"]
html_favicon = "_static/favicon.ico"
html_logo = "_static/mstile-310.png"
html_title = f"Scholia Documentation"
html_show_sourcelink = False
