function convertDataTableData(data) {
    // Handle 'Label' columns.
    var convertedData = [];
    for (var i = 0 ; i < data.length ; i++) {
	var convertedRow = {};
	for (var key in data[i]) {
	    if (key + 'Label' in data[i]) {
		convertedRow[key] = '<a href="../' + data[i][key].substr(31) + '">' + data[i][key + 'Label'] + '</a>';
	    } else if (key.substr(-5) == 'Label') {
		// pass
	    } else {
		convertedRow[key] = data[i][key];
	    }
	}
	convertedData.push(convertedRow);
    }
    return convertedData;
}


function sparqlDataToSimpleData(response) {
    // Convert long JSON data from from SPARQL endpoint to short form
    let data = response.results.bindings;
    var convertedData = [];
    for (var i = 0 ; i < data.length ; i++) {
	var convertedRow = {};
	for (var key in data[i]) {
	    convertedRow[key] = data[i][key]['value'];
	}
	convertedData.push(convertedRow);
    }
    return convertedData;
}
