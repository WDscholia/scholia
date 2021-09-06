"""
Create json file for internationalitation process.

Script to create json file using data-i18n attributes
inside html files for internationalitation process
"""

import json
import click
import re
import glob
from pathlib import Path
from bs4 import BeautifulSoup
from tabulate import tabulate
from colorama import Fore, Style
from collections import OrderedDict, Counter


def read_file(filename):
    """Read a file an return its content as string."""
    with open(filename, "r") as fstream:
        content = fstream.read()
    return content


def write_file(filename, content):
    """Write into a file."""
    with open(filename, "w") as f:
        f.write(content)


def read_json(filename):
    """Read a json file an return its content as dict."""
    with open(filename, "r") as f:
        content = json.loads(f.read())
    return content


def write_json(filename, data):
    """Write dict as json file."""
    with open(filename, "w") as f:
        f.write(json.dumps(data, indent=4))


def show_table(datadict, color, fmt="pretty"):
    """Show dict as a table with tabulate with color."""
    print(color)
    print(tabulate(datadict, headers="keys", tablefmt=fmt))
    print(Style.RESET_ALL)


def print_info(datadict, color, title=''):
    """Show dict info as a table with tabulate with color."""
    print(color)
    print(f"+{title:-^60s}+")
    print(json.dumps(datadict, indent=4))
    print(f"+{'':-^60s}+")
    print(Style.RESET_ALL)


def create_json_i18n(filename, json_content, verbose=False):
    """Create the dict/json i18n from html content.

    Search for data-i18n attribute inside html content
    and generate/update the json file following banana format
    """
    content = read_file(filename)
    soup = BeautifulSoup(content, 'html.parser')
    matches = soup.find_all([], {"data-i18n": True})
    oldfields = set(json_content)

    for tag in matches:
        if not json_content.get(tag.get("data-i18n"), None):
            json_content.update({f"{tag.get('data-i18n')}": ''})

    newfields = {
        key
        for key in json_content.keys() if key not in oldfields
    }
    if verbose:
        show_table({
            "file": [Path(filename).name],
            "existing fields": oldfields,
            "new fields": newfields
        }, Fore.YELLOW)


def normalize(name):
    """Allow click to use command with underscore."""
    return name.replace("_", "-")


@click.group(context_settings={"token_normalize_func": normalize})
def cli():
    """Create/update json for internationalitation.

    This program allows you to create or update a <lang>.json file
    for an internationalitation process, using the banana format. You
    can look for the data-i18n atrribute in one or several html files at time
    and therefore, extract them and create/update the json file. Also you
    can check if there are attributes duplicated in html files before
    put in json
    file.

    To show help for specific command, you can run:

    python i18n_create_json.py COMMAND --help
    """
    pass


@cli.command()
@click.option('-f', "--file", help="to pass the html file which it will \
be scanned")
@click.option('--output', '-o', help="To give the name of the output json")
@click.option('-i', "--inplace", is_flag=True, help="To create/update the file. Without \
this option, the command is executed in a dry-run mode")
@click.option('-v', "--verbose", is_flag=True, help="To show more detailed information \
about the process")
def onefile(**kwargs):
    """To search all data-i18n attributes inside one html file.

    This command allows you look for all data-i18n attributes inside one html
    file passed by command line with the option -f/--file and create or update
    a json file with these attributes following the banana format.


    How to use:

    1. To execute in dry-run mode

       $ python i18n_create_json.py onefile --file="path/to/file.html"
        -o path/to/output.json


    2. To execute and replace in-place

       $ python i18n_create_json.py onefile --file="path/to/file.html"
        -o path/to/output.json -i/--inplace

    """
    filename = kwargs['file']
    trfile_content = {}
    verbose = kwargs["verbose"]

    outfile = Path(filename).parent.parent / "static/i18n" / kwargs['output']

    if outfile.exists():
        trfile_content = read_json(outfile)

    metadata = {"@metadata": trfile_content.pop("@metadata", None)}
    create_json_i18n(filename, trfile_content, verbose)
    trfile_content = {
        **metadata,
        **OrderedDict(sorted(trfile_content.items()))
    }

    if not kwargs["inplace"]:
        print_info(
            trfile_content,
            Fore.LIGHTGREEN_EX,
            title=f"New content for {kwargs['output']}"
        )
    else:
        write_json(outfile, trfile_content)


@cli.command()
@click.option("--pattern", help="To pass the html files using unix wildcards")
@click.option('--output', '-o', help="To give the name of the output json")
@click.option('-i', "--inplace", is_flag=True, help="To create/update the file. \
Without this option, the command is executed in a dry-run mode")
@click.option('-v', "--verbose", is_flag=True, help="To show more detailed information \
about the process")
def severalfiles(**kwargs):
    """To search all data-i18n attributes inside several html files.

    This command allows you look for all data-i18n attributes inside several
    html files passed by command line with the option -p/--pattern as a
    pattern. You can use the bash wildcards. With this pattern, you can create
    or update the json file with these attributes following the banana format.


    How to use:

    1. To execute in dry-run mode

       $ python i18n_create_json.py severalfiles --pattern="path/to/file*.html"
        -o path/to/output.json


    2. To execute and replace in-place

       $ python i18n_create_json.py everalfiles --pattern="path/to/file*.html"
       -o path/to/output.json -i/--inplace

    """
    pattern = kwargs['pattern']
    verbose = kwargs["verbose"]

    trfile_content = {}
    outfile = Path(pattern).parent.parent / "static/i18n" / kwargs['output']

    if outfile.exists():
        trfile_content = read_json(outfile)

    metadata = {"@metadata": trfile_content.pop("@metadata", None)}
    files = glob.glob(pattern)
    for file in files:
        create_json_i18n(file, trfile_content, verbose)

    trfile_content = {
        **metadata,
        **OrderedDict(sorted(trfile_content.items()))
    }

    if not kwargs["inplace"]:
        print_info(
            trfile_content,
            Fore.LIGHTGREEN_EX,
            title=f"New content for {kwargs['output']}"
        )
    else:
        write_json(outfile, trfile_content)


@cli.command()
@click.option('--path', required=True, help="To pass the html files using \
unix wildcards")
def check_duplicates(**kwargs):
    """To look for data-i18n attributes duplicated.

    This command allows you look for all duplicated data-i18n attributes
    inside several html files passed by command line with the option
    --path as a pattern.

    How to use:

    1. To show duplicated data-i18n attributes

       $ python i18n_create_json.py check_duplicates
       --path="path/to/file*.html"

    """
    path = kwargs["path"]
    files = glob.glob(path)
    rx = re.compile(r'(data-i18n\b=\"([^"]*)\")')
    content = []
    for file in files:
        string = read_file(file)
        matches = rx.finditer(string)
        for match in matches:
            content.append(match.group(2))

    duplicates = [key for key, val in Counter(content).items() if val > 1]

    show_table(
        {
            "KEY DUPLICATES": duplicates if duplicates
            else ["There are not duplicated keys"]
        },
        color=Fore.LIGHTRED_EX,
        fmt="simple"
    )


if __name__ == '__main__':
    cli()
