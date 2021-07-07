# Wikibase Query Service GUI

This repository contains the GUI for the [Wikidata Query Service](https://query.wikidata.org/).

Please see more details about the service in the [User Manual](https://www.mediawiki.org/wiki/Special:MyLanguage/Wikidata_Query_Service/User_Manual).

## Download & setup

Clone git repo, go into created folder and then pull all dependencies via npm package manager.

```bash
$ git clone https://gerrit.wikimedia.org/r/wikidata/query/gui
$ cd gui
$ npm install
```

Alternatively, use `npm install`.

```bash
npm install wikidata-query-gui
```

## Configuration
Per default the Wikibase Query Service GUI is configured to be used as a local development test instance. It can be customized by creating a `custom-config.json` in the repository's root dir. This file can be used to override any of the default settings obtained from `default-config.json`.

## Run tests

Run JSHint, JSCS and QUnit tests.

```bash
$ npm test
```

## Debug
Start a test server for local debugging. Do not use it in production.

```bash
$ npm start
```

## Build
Create a build with bundled and minified files.

```bash
$ npm run build
```


## Deploy
Create a build and push it to the deployment branch via git review.

```bash
$ npm run deploy
```


Please make sure you have defined a gitreview username:
```bash
git config --global --add gitreview.username "[username]"
```


## Components
### Editor
A [CodeMirror](https://codemirror.net/) based SPARQL editor with code completion (ctrl+space) and tooltips (hover).
```
var editor = new wikibase.queryService.ui.editor.Editor();
editor.fromTextArea( $( '.editor' )[0] );
```
See `examples/editor.html`.

### Example dialog

A dialog that allows browsing of SPARQL examples.
```
new wikibase.queryService.ui.dialog.QueryExampleDialog(  $element, querySamplesApi, callback, previewUrl );
```
See `examples/dialog.html`.

### SPARQL

```
var api = new wikibase.queryService.api.Sparql();
api.query( query ).done( function() {
	var json = JSON.parse( api.getResultAsJson() );

} );
```
See `examples/sparql.html`.
[JSFiddle.net](https://jsfiddle.net/jonaskress/qpuynfz8/)


### Result Views
Views that allow rendering SPARQL results ([see documentation](https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:SPARQL_query_service/Wikidata_Query_Help/Result_Views)).

```
var api = new wikibase.queryService.api.Sparql();
api.query( query ).done(function() {
	var result = new wikibase.queryService.ui.resultBrowser.CoordinateResultBrowser();
	result.setResult( api.getResultRawData() );
	result.draw( element );
} );
```
See `examples/result.html`.
[JSFiddle.net](https://jsfiddle.net/jonaskress/9dhv0yLp/)

### Release Notes and npm package

Unfortunately there are no releases and the provided code and interfaces are not considered to be stable.
Also the dist/ folder contains a build that may not reflect the current code on master branch.
