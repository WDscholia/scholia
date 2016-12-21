import os
from setuptools import setup


filename = os.path.join(os.path.dirname(__file__), 'requirements.txt')
requirements = open(filename).read().splitlines()

setup(
    name='scholia',
    version='0.1.dev0',
    author='Finn Aarup Nielsen',
    author_email='faan@dtu.dk',
    description='Scholia - Wikidata-based scholarly profiles',
    license='GPL',
    keywords='wikidata',
    url='https://github.com/fnielsen/scholia',
    packages=['scholia'],
    package_data={},
    install_requires=requirements,
    long_description='',
    classifiers=[
        'Programming Language :: Python :: 2.7',
        ],
    test_requires=['pytest', 'flake8'],
    )
