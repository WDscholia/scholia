// https://stackoverflow.com/questions/6020714
function escapeHTML(html) {
    if (typeof html !== "undefined") {
	return html
	    .replace(/&/g,'&amp;')
	    .replace(/</g,'&lt;')
	    .replace(/>/g,'&gt;');
    }
    else {
	return "";
    }
}

// http://stackoverflow.com/questions/1026069/
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function convertDataTableData(data, columns, linkPrefixes={}) {
    // Handle 'Label' columns.

    // var linkPrefixes = (options && options.linkPrefixes) || {};
    
    var convertedData = [];
    var convertedColumns = [];
    for (var i = 0 ; i < columns.length ; i++) {
	column = columns[i];
	if (column.substr(-11) == 'Description') {
	    convertedColumns.push(column.substr(0, column.length - 11) + ' description');
	} else if (column.substr(-5) == 'Label') {
	    // pass
	} else if (column.substr(-3) == 'Url') {
	    // pass
	} else {
	    convertedColumns.push(column);
	}
    }
    for (var i = 0 ; i < data.length ; i++) {
	var convertedRow = {};
	for (var key in data[i]) {
	    if (key.substr(-11) == 'Description') {
		convertedRow[key.substr(0, key.length - 11) + ' description'] = data[i][key];

	    } else if (key + 'Label' in data[i]) {
		convertedRow[key] = '<a href="' +
		    (linkPrefixes[key] || "../") + 
		    data[i][key].substr(31) +
		    '">' + data[i][key + 'Label'] + '</a>';
	    } else if (key.substr(-5) == 'Label') {
		// pass
		
	    } else if (key + 'Url' in data[i]) {
		convertedRow[key] = '<a href="' +
		    data[i][key + 'Url'] +
		    '">' + data[i][key] + '</a>';
	    } else if (key.substr(-3) == 'Url') {
		// pass

	    } else if (key.substr(-3) == 'url') {
		// Convert URL to a link
		convertedRow[key] = "<a href='" +
		    data[i][key] + "'>" + 
		    $("<div>").text(data[i][key]).html() + '</a>';

	    } else if (key == 'orcid') {
		// Add link to ORCID website
		convertedRow[key] = '<a href="https://orcid.org/' +
		    data[i][key] + '">' + 
		    data[i][key] + '</a>';

	    } else if (key == 'doi') {
		// Add link to Crossref
		convertedRow[key] = '<a href="https://doi.org/' +
		    encodeURIComponent(data[i][key]) + '">' +
		    $("<div>").text(data[i][key]).html() + '</a>';
	    } else {
		convertedRow[key] = data[i][key];
	    }
	}
	convertedData.push(convertedRow);
    }
    return {data: convertedData, columns: convertedColumns}
}


function entityToLabel(entity, language='en') {
    if (language in entity['labels']) {
        return entity['labels'][language].value;
    }

    // Fallback
    languages = ['en', 'da', 'de', 'es', 'fr', 'jp',
                 'nl', 'no', 'ru', 'sv', 'zh'];
    for (lang in languages) {
        if (lang in entity['labels']) {
            return entity['labels'][lang].value;
        }
    }

    // Last resort
    return entity['id']
}


function sparqlDataToSimpleData(response) {
    // Convert long JSON data from from SPARQL endpoint to short form
    let data = response.results.bindings;
    let columns = response.head.vars
    var convertedData = [];
    for (var i = 0 ; i < data.length ; i++) {
	var convertedRow = {};
	for (var key in data[i]) {
	    convertedRow[key] = data[i][key]['value'];
	}
	convertedData.push(convertedRow);
    }
    return {data: convertedData, columns: columns};
}


function sparqlToDataTable(sparql, element, options={}) {
    // Options: linkPrefixes={}, paging=true
    var linkPrefixes = (typeof options.linkPrefixes === 'undefined') ? {} : options.linkPrefixes;
    var paging = (typeof options.paging === 'undefined') ? true : options.paging;
    
    var url = "https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=" + 
	encodeURIComponent(sparql) + '&format=json';

    $.getJSON(url, function(response) {
	var simpleData = sparqlDataToSimpleData(response);

	convertedData = convertDataTableData(simpleData.data, simpleData.columns, linkPrefixes=linkPrefixes);
	columns = [];
	for ( i = 0 ; i < convertedData.columns.length ; i++ ) {
	    var column = {
		data: convertedData.columns[i],
		title: capitalizeFirstLetter(convertedData.columns[i]).replace(/_/g, "&nbsp;"),
		defaultContent: "",
	    }
	    columns.push(column)
	}

	table = $(element).DataTable({ 
	    data: convertedData.data,
	    columns: columns,
	    lengthMenu: [[10, 25, 100, -1], [10, 25, 100, "All"]],
	    ordering: true,
	    order: [], 
	    paging: paging,
	});

	$(element).append(
	    '<caption><a href="https://query.wikidata.org/#' + 
		encodeURIComponent(sparql) +	
		'">Edit on query.Wikidata.org</a></caption>');
    });
}
