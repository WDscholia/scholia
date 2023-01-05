"""github.

Usage:
  scholia.github get-user <username>
  scholia.github get-user-followers <username>
  scholia.github get-user-number-of-followers <username>
  scholia.github get-user-repos <username>

"""


from __future__ import print_function

import json

import requests


USER_AGENT = 'Scholia, https://github.com/WDscholia/scholia'


def get(resource):
    """Query GitHub API for resource.

    Parameters
    ----------
    resource : str
        Resource, e.g., "/users/fnielsen" for the user 'fnielsen'.

    Returns
    -------
    data : dictionary or list
        Data from the GitHub API converted to a Python object from the JSON.

    References
    ----------
    https://developer.github.com/v3/

    """
    headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': USER_AGENT,
    }
    response = requests.get(
        "https://api.github.com" + resource,
        headers=headers)
    data = response.json()
    return data


def get_user(username):
    """Get user information from GitHub.

    Parameters
    ----------
    username : str
        GitHub username as a string.

    Returns
    -------
    data : dict
        User information as a dictionary.

    Examples
    --------
    >>> data = get_user('fnielsen')
    >>> data.get('name', '').startswith('Finn') or 'name' not in data
    True

    """
    return get('/users/' + username)


def get_user_followers(username):
    """Get user followers from GitHub.

    Parameters
    ----------
    username : str
        GitHub username as a string.

    Returns
    -------
    data : list of dict
        List of users.

    """
    return get('/users/' + username + '/followers')


def get_user_repos(username):
    """Get repos for a user from GitHub.

    Parameters
    ----------
    username : str
        GitHub username as a string.

    Returns
    -------
    data : list of dict
        List of repos.

    """
    return get('/users/' + username + '/repos')


def main():
    """Handle command-line interface."""
    from docopt import docopt

    arguments = docopt(__doc__)

    # TODO UTF-8
    if arguments['get-user']:
        print(json.dumps(get_user(arguments['<username>'])))

    elif arguments['get-user-followers']:
        print(json.dumps(get_user_followers(arguments['<username>'])))

    elif arguments['get-user-number-of-followers']:
        user = get_user(arguments['<username>'])
        print(user.get('followers'))

    elif arguments['get-user-repos']:
        print(json.dumps(get_user_repos(arguments['<username>'])))


if __name__ == '__main__':
    main()
