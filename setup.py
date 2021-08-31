import os

import versioneer
from setuptools import find_packages, setup

filename = os.path.join(os.path.dirname(__file__), "requirements.txt")
requirements = open(filename).read().splitlines()

setup(
    name="scholia",
    author="Finn Aarup Nielsen",
    author_email="faan@dtu.dk",
    cmdclass=versioneer.get_cmdclass(),
    description="Scholia - Wikidata-based scholarly profiles",
    license="GPL",
    keywords="wikidata",
    url="https://github.com/WDscholia/scholia",
    packages=find_packages(),
    package_data={
        "scholia": [
            "data/*",
            "app/templates/*",
            "app/static/*",
            "app/static/css/*",
            "app/static/favicon/*",
            "app/static/fonts/*",
            "app/static/images/*",
            "app/static/js/*",
            "app/static/widgets/select2/css/*",
            "app/static/widgets/select2/js/*",
        ]
    },
    install_requires=requirements,
    long_description="",
    classifiers=[
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3.5",
    ],
    tests_require=["pytest", "flake8"],
    version=versioneer.get_version(),
)
