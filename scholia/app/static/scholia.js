// https://stackoverflow.com/questions/6020714
function escapeHTML(html) {
    if (typeof html !== "undefined") {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    else {
        return "";
    }
}

// http://stackoverflow.com/questions/1026069/
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function convertDataTableData(data, columns, linkPrefixes = {}, linkSuffixes = {}) {
    // Handle 'Label' columns.

    // var linkPrefixes = (options && options.linkPrefixes) || {};

    var convertedData = [];
    var convertedColumns = [];
    for (var i = 0; i < columns.length; i++) {
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

	    } else if (
			key + 'Label' in data[i] &&
			/^http/.test(data[i][key]) &&
			data[i][key].length > 30
	    ) {
		convertedRow[key] = '<a href="' +
		    (linkPrefixes[key] || "../") + 
		    data[i][key].substr(31) +
            (linkSuffixes[key] || "") +
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
    return { data: convertedData, columns: convertedColumns }
}


function entityToLabel(entity, language = 'en') {
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


function resize(element) {
    //width = document.getElementById("topics-works-matrix").clientWidth;
    width = $(element)[0].clientWidth;
    d3.select(element).attr("width", width);
    console.log("resized with width " + width);
}


function sparqlToResponse(sparql, doneCallback) {
    var endpointUrl = "https://query.wikidata.org/bigdata/namespace/wdq/sparql";
    var settings = {
        headers: { Accept: "application/sparql-results+json" },
        data: { query: sparql }
    };
    return $.ajax(endpointUrl, settings).then(doneCallback);
}


function sparqlDataToSimpleData(response) {
    // Convert long JSON data from from SPARQL endpoint to short form
    let data = response.results.bindings;
    let columns = response.head.vars
    var convertedData = [];
    for (var i = 0; i < data.length; i++) {
        var convertedRow = {};
        for (var key in data[i]) {
            convertedRow[key] = data[i][key]['value'];
        }
        convertedData.push(convertedRow);
    }
    return { data: convertedData, columns: columns };
}


function sparqlToDataTablePost(sparql, element, filename, options = {}) {
    // Options: linkPrefixes={}, paging=true
    var linkPrefixes = (typeof options.linkPrefixes === 'undefined') ? {} : options.linkPrefixes;
    var linkSuffixes = (typeof options.linkSuffixes === 'undefined') ? {} : options.linkSuffixes;
    var paging = (typeof options.paging === 'undefined') ? true : options.paging;
    var sDom = (typeof options.sDom === 'undefined') ? 'lfrtip' : options.sDom;
    var url = "https://query.wikidata.org/sparql";

    $.post(url, data = { query: sparql }, function (response, textStatus) {
        var simpleData = sparqlDataToSimpleData(response);

        convertedData = convertDataTableData(simpleData.data, simpleData.columns, linkPrefixes = linkPrefixes, linkSuffixes = linkSuffixes);
        columns = [];
        for (i = 0; i < convertedData.columns.length; i++) {
            var column = {
                data: convertedData.columns[i],
                title: capitalizeFirstLetter(convertedData.columns[i]).replace(/_/g, "&nbsp;"),
                defaultContent: "",
            }
            columns.push(column)
        }
	
        if (convertedData.data.length <= 10) {
          paging = false;
        }

        var table = $(element).DataTable({
            data: convertedData.data,
            columns: columns,
            lengthMenu: [[10, 25, 100, -1], [10, 25, 100, "All"]],
            ordering: true,
            order: [],
            paging: paging,
            sDom: sDom,
        });

        $(element).append(
            '<caption><span style="float:left; font-size:smaller;"><a href="https://query.wikidata.org/#' +
                encodeURIComponent(sparql) +
                '">Wikidata Query Service</a></span>' +
                '<span style="float:right; font-size:smaller;"><a href="https://github.com/WDscholia/scholia/blob/master/scholia/app/templates/' +
                filename + '">' +
                filename.replace("_", ": ") +
                '</a></span></caption>'
        );
    }, "json");
};


function sparqlToDataTable(sparql, element, filename, options = {}) {
    // Options: linkPrefixes={}, paging=true
    var linkPrefixes = (typeof options.linkPrefixes === 'undefined') ? {} : options.linkPrefixes;
    var linkSuffixes = (typeof options.linkSuffixes === 'undefined') ? {} : options.linkSuffixes;
    var paging = (typeof options.paging === 'undefined') ? true : options.paging;
    var sDom = (typeof options.sDom === 'undefined') ? 'lfrtip' : options.sDom;
    var url = "https://query.wikidata.org/sparql?query=" +
        encodeURIComponent(sparql) + '&format=json';

    $.getJSON(url, function (response) {
        var simpleData = sparqlDataToSimpleData(response);

        convertedData = convertDataTableData(simpleData.data, simpleData.columns, linkPrefixes = linkPrefixes, linkSuffixes = linkSuffixes);
        columns = [];
        for (i = 0; i < convertedData.columns.length; i++) {
            var column = {
                data: convertedData.columns[i],
                title: capitalizeFirstLetter(convertedData.columns[i]).replace(/_/g, "&nbsp;"),
                defaultContent: "",
            }
            if (column['title'] == 'Count') {
              column['render'] = $.fn.dataTable.render.number(',', '.');
              if (i == 0) {
                column['className'] = 'dt-right';
              }
            } else if (
              column['title'] == 'Score' ||
              column['title'] == 'Distance' ||
              /\Wper\W/.test(column['title'])
            ) {
              column['render'] = $.fn.dataTable.render.number(',', '.', 2);
            }
            columns.push(column);
        }
	
        if (convertedData.data.length <= 10) {
            paging = false;
        }

        var table = $(element).DataTable({ 
            data: convertedData.data,
            columns: columns,
            lengthMenu: [[10, 25, 100, -1], [10, 25, 100, "All"]],
            ordering: true,
            order: [],
            paging: paging,
            sDom: sDom,
            language: {
              emptyTable: "This query yielded no results. ",
              sZeroRecords: "This query yielded no results."
            }
        });

        $(element).append(
            '<caption><span style="float:left; font-size:smaller;"><a href="https://query.wikidata.org/#' + 
                encodeURIComponent(sparql) +    
                '">Wikidata Query Service</a></span>' +
                '<span style="float:right; font-size:smaller;"><a href="https://github.com/WDscholia/scholia/blob/master/scholia/app/templates/' +
                filename + '">' +
                filename.replace("_", ": ") +
                '</a></span></caption>'
        );
    });
};


function sparqlToIframe(sparql, element, filename) {
    let $iframe = $(element)
    url = "https://query.wikidata.org/embed.html#" + encodeURIComponent(sparql);
    $iframe.attr('src', url);

    const wikidata_sparql = "https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparql)
    const wikidata_query = "https://query.wikidata.org/#" + encodeURIComponent(sparql)

    $.ajax({
        url: wikidata_sparql,
        success: function (data) {
            let $xml = $(data);
            let results = $xml.find('results')
            if (results.text().trim().length === 0) {
                $iframe.parent().css("display", "none")
                $iframe.parent().after('<hr><p>This query yielded no results. You can still try to find something by ' +
                    '<a href="' + wikidata_query + '" target="_blank">modifying it</a></p>')
            }
            $iframe.parent().after(
                '<span style="float:right; font-size:smaller">' +
                    '<a href="https://github.com/WDscholia/scholia/blob/master/scholia/app/templates/' + filename + '">' +
                        filename.replace("_", ": ") +
                    '</a>' +
                '</span>'
            );
        }
    })
};


function sparqlToMatrix(sparql, element, filename){
    
    window.onresize = resize(element);

    sparqlToResponse(sparql, function(response) {
        var data = response.results.bindings;

        var qToLabel = new Object();
        data.forEach(function(item, index) {
            qToLabel[item.topic.value.substring(31)] = item.topicLabel.value || item.topic.value.substring(31);
            qToLabel[item.work.value.substring(31)] = item.workLabel.value || item.work.value.substring(31);
        });
   
        var works = $.map(data, function(row) {
            return row.work.value.substring(31);
        });
        var topics = $.map(data, function(row) {
            return row.topic.value.substring(31);
        });
   
        // Sizes
        var margin = { top: 100, right: 0, bottom: 0, left: 0 },
            width = $(element)[0].clientWidth
            axis_height = works.length * 12,
            full_height = axis_height + margin.top;
   
        var svg = d3
            .select(element)
            .append("svg")
            .attr("width", width)
            .attr("height", full_height)
            .append("g")
            .attr("transform", "translate(0, " + margin.top + ")");
   
        // X scales and axis
        var xScale = d3
            .scaleBand()
            .range([0, width])
            .domain(topics);
        svg
            .append("g")
            .call(
            d3
                .axisTop(xScale)
                .tickSize(0)
                .tickFormat(function(d) {
                return qToLabel[d];
                })
            )
            .selectAll("text")
            .style("text-anchor", "start")
            .attr("transform", "rotate(-65)");
   
        // Y scales and axis
        var yScale = d3
            .scaleBand()
            .range([0, axis_height])
            .domain(works)
   
        svg
            .append("g")
            .style("font-size", "16px")
            .style("text-anchor", "start")
            .style("opacity", 0.3)
            .call(
            d3
                .axisLeft(yScale)
                .tickSize(0)
                .tickFormat(function(d) {
                return qToLabel[d];
                })
            )
   
        // Move y-label slight to the right so the first lette is not cut
            .selectAll("text")
            .attr("x", 1)
   
        svg.selectAll("g .domain").remove()
   
        // Tooltip
        var tooltip = d3
            .select("body")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("padding", "10px")
            .style("font-size", "16px");
   
        var mouseover = function(d) {
            html =
            "<a href='../work/" +
            d.work.value.substring(31) +
            "'>" +
            d.workLabel.value +
            "</a>" +
            "<br/>" +
            "<a href='../topic/" +
            d.topic.value.substring(31) +
            "'>" +
            d.topicLabel.value +
            "</a>";
   
            tooltip
            .html(html)
            .transition()
            .delay(0)
            .style("opacity", 1)
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
            .style("position", "absolute");
        };
        var inMouseOut = false;
        var mouseout = function(d) {
            tooltip
            .transition()
            .delay(2000)
            .duration(2000)
            .style("opacity", 0);
        };
   
        // Add elements in matrix
        svg
            .selectAll()
            .data(data, function(d) {
            return true;
            })
            .enter()
            .append("rect")
            .attr("x", function(d) {
            var xIndex = d.topic.value.substring(31);
            var xValue = xScale(xIndex);
            return xValue;
            })
            .attr("y", function(d) {
            var yValue = yScale(d.work.value.substring(31));
            return yValue;
            })
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("opacity", 0.5)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
        });

        $(element).after(
            '<span style="float:right; font-size:smaller"><a href="https://github.com/fnielsen/scholia/blob/master/scholia/app/templates/' + filename + '">' +
            filename.replace("_", ": ") +
            '</a></span>');

}


function sparqlToPathWayPageViewer(sparql, filename){

    $(document).ready(function() {
        // Hide optional sections until data values are confirmed and ready
        var organismSection = document.getElementById("Organism")                                                                                         
        organismSection.style.display = "none"; 
      
        var pathwayViewerSection = document.getElementById("pathway-viewer")                                                                                
        pathwayViewerSection.style.display = "none"; 
      
        // Check for optional data values and then use them if available
        const sparqlURL = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=' + 
          encodeURIComponent(sparql) + '&format=json';
        $.getJSON(sparqlURL, function(response) {
          const simpleData = sparqlDataToSimpleData(response);
          const dataValues = simpleData.data[0];
          if ("pathwayDescription" in dataValues) {
            $("#description").text(dataValues.pathwayDescription);
          }
          if ("organism" in dataValues) {
            organismScholia = dataValues.organism.replace("http://www.wikidata.org/entity/","https://scholia.toolforge.org/taxon/")
            $("#Organism").after('<a href="' + organismScholia + '">' +
                     escapeHTML(dataValues.organismLabel) +
                     '</a>'); 
            organismSection.style.display = "";
          }
          if ("wpid" in dataValues) {
            const pathwayViewerIFrameResults = $.find("#pathway-viewer > iframe");
            pathwayViewerIFrameResults.every(function(pathwayViewerIFrameResult) {
              pathwayViewerIFrameResult.setAttribute("src", `https://pathway-viewer.toolforge.org/?id=${dataValues.wpid}`);
            });
            pathwayViewerSection.style.display = "";
            $("#pathway-viewer").after(
                '<p>This diagram is showing WikiPathways <a href="https://www.wikipathways.org/instance/' + 
                dataValues.wpid + '">' + dataValues.wpid + 
                '</a> in an iframe with this <a href=' +
                '"https://pathway-viewer.toolforge.org/?id=' + 
                dataValues.wpid + 
                '">pathway-viewer running on Toolforge</a>.</p>' );
                       
          }
        });
      });

}


function sparqlToShortInchiKey(sparql, key,  element, filename) {
    shortkey = key.substring(0,14)
    new_sparql = sparql.replace("_shortkey_",shortkey)
    sparqlToDataTable(new_sparql, element, filename);
}


function workWithQ(q, q2, urlstatic) {
    var url = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' +
	        q  + 
	       '&format=json&callback=?';
    
    $.getJSON(url, function (data) {
	 var item = data.entities[q];
	 if ('en' in item.labels) {
	     $("#h1").text(item.labels.en.value);
	 }
	 $("#h1").append(' (<a href="https://www.wikidata.org/wiki/' +  q  + ' ">' + q  + '</a>)');
	 
	 var detailsList = Array();
	 try {
	     var orcid = item.claims.P496[0].mainsnak.datavalue.value;
	     detailsList.push( '<a href="https://orcid.org/">' + 
                   `<img alt="ORCID logo" src="${urlstatic}/images/orcid_16x16.gif" width="16" height="16" hspace="4" />` + 
                   '</a> <a href="https://orcid.org/' +
			       encodeURI( orcid ) + '">https://orcid.org/' + escapeHTML( orcid ) + '</a>');
	 }
	 catch(e) {}

	 try {
	     var mastodonAccount = item.claims.P4033[0].mainsnak.datavalue.value;
	     var mastodonComponents = mastodonAccount.split("@");
	     if (mastodonComponents.length == 2) {
		 detailsList.push( '<img alt="Twitter t icon" src="' +
				   'https://upload.wikimedia.org/wikipedia/commons/4/48/Mastodon_Logotype_%28Simple%29.svg' +
				   '" width="16" height="16" hspace="4" /> <a href="https://' + mastodonComponents[1] + '/@' +
				   encodeURI( mastodonComponents[0] ) + '">@' + escapeHTML( mastodonComponents[0] ) + '</a> ');
	     }
	 }
	 catch(e) { }

	 try {
	     var twitterAccount = item.claims.P2002[0].mainsnak.datavalue.value;
	     detailsList.push( '<img alt="Twitter t icon" src="' +
			       'https://upload.wikimedia.org/wikipedia/commons/8/8b/Twitter_logo_initial.svg' +
			       '" width="16" height="16" hspace="4" /> <a href="https://twitter.com/' +
			       encodeURI( twitterAccount ) + '">@' + escapeHTML( twitterAccount ) + '</a> ');
	 }
	 catch(e) { }

	 try {
	     var rorID = item.claims.P6782[0].mainsnak.datavalue.value;
	     detailsList.push( 'ROR <a href="https://ror.org/' + encodeURI( rorID ) + '">' + rorID + '</a> ');
	 }
	 catch(e) { }

	 try {
	     var hashtag = item.claims.P2572[0].mainsnak.datavalue.value;
	     detailsList.push( '<a href="https://hashtags-hub.toolforge.org/' +
			       encodeURI( hashtag ) + '">#' + escapeHTML( hashtag ) + '</a> ');
	 }
	 catch(e) {}

	 try {
	     var doi = item.claims.P356[0].mainsnak.datavalue.value;
	     $("head").append( '<meta name="citation_doi" content="' + doi + '"/>' );
	 }
	 catch(e) {}

	 try {
	     $( '#details' ).append( detailsList.join( " | " ) );
	 }
	 catch(e) {}
	 
	 /* BioSchemas annotation */
	 if (item.claims.P31 &&
	     ((item.claims.P31[0].mainsnak.datavalue.value.id == 'Q5'))) {
	   try { /* Person */
	       bioschemasAnnotation = {
	          "@context" : "https://schema.org",
	          "@type" : "Person" ,
	          "http://purl.org/dc/terms/conformsTo": { "@type": "CreativeWork", "@id": "https://bioschemas.org/profiles/Person/0.2-DRAFT-2019_07_19/" },
	          "description" : "A person" ,
	          "identifier" : q ,
	          "mainEntityOfPage" : "http://www.wikidata.org/entity/" +  q
	       }
	       if ('en' in item.labels) {
	         bioschemasAnnotation.name = item.labels.en.value;
	       }
	       $( '#bioschemas' ).append( JSON.stringify(bioschemasAnnotation) );
	    } catch(e) {}
	 } else if (item.claims.P31 &&
	     ((item.claims.P31[0].mainsnak.datavalue.value.id == 'Q47461491') ||
	      (item.claims.P31[0].mainsnak.datavalue.value.id == 'Q967847'))) {
	   try { /* ChemicalSubstance */
	       bioschemasAnnotation = {
	          "@context" : "https://schema.org",
	          "@type" : "ChemicalSubstance" ,
	          "http://purl.org/dc/terms/conformsTo": { "@type": "CreativeWork", "@id": "https://bioschemas.org/profiles/ChemicalSubstance/0.4-RELEASE/" },
	          "identifier" : q,
	          "url" : "http://www.wikidata.org/entity/" +  q
	       }
	       if ('en' in item.labels) {
	         bioschemasAnnotation.name = item.labels.en.value;
	       }
	       $( '#bioschemas' ).append( JSON.stringify(bioschemasAnnotation) );
	    } catch(e) {}
	 } else if (item.claims.P225) {
             try { /* Taxon */
		 var taxonName = item.claims.P225[0].mainsnak.datavalue.value;
		 bioschemasAnnotation = {
	             "@context" : "https://schema.org",
	             "@type" : "Taxon" ,
	             "http://purl.org/dc/terms/conformsTo": { "@type": "CreativeWork", "@id": "https://bioschemas.org/profiles/Taxon/0.6-RELEASE/" },
	             "name" : taxonName ,
	             "url" : "http://www.wikidata.org/entity/" + q
		 }
		 if (item.claims.P105) {
	             var taxonRank = item.claims.P105[0].mainsnak.datavalue.value.id;
	             bioschemasAnnotation.taxonRank = "http://www.wikidata.org/entity/" + taxonRank ;
		 }
		 if (item.claims.P171) {
	             var parent = item.claims.P171[0].mainsnak.datavalue.value.id;
	             bioschemasAnnotation.parentTaxon = "http://www.wikidata.org/entity/" + parent ;
		 }
		 $( '#bioschemas' ).append( JSON.stringify(bioschemasAnnotation) );
		 // console.log(JSON.stringify(bioschemasAnnotation, "", 2))
	     } catch(e) {}
	 } else if (item.claims.P235) {
	     try { /* Chemical Compound */
		 var inchiKey = item.claims.P235[0].mainsnak.datavalue.value;
		 bioschemasAnnotation = {
	             "@context" : "https://schema.org",
	             "@type" : "MolecularEntity" ,
	             "http://purl.org/dc/terms/conformsTo": { "@type": "CreativeWork", "@id": "https://bioschemas.org/profiles/MolecularEntity/0.5-RELEASE/" },
	             "identifier" : q,
	             "inChIKey" : inchiKey ,
	             "url" : "http://www.wikidata.org/entity/" + q
		 }
		 if ('en' in item.labels) {
	         bioschemasAnnotation.name = item.labels.en.value;
         }
		 if (item.claims.P234 && item.claims.P234[0].mainsnak.datavalue) {
	             var inchi = item.claims.P234[0].mainsnak.datavalue.value;
	             bioschemasAnnotation.inChI = inchi ;
		 }
		 if (item.claims.P274 && item.claims.P274[0].mainsnak.datavalue) {
	             var chemformula = item.claims.P274[0].mainsnak.datavalue.value;
	             bioschemasAnnotation.molecularFormula = chemformula ;
		 }
		 if (item.claims.P2017 && item.claims.P2017[0].mainsnak.datavalue) {
	             var smiles = item.claims.P2017[0].mainsnak.datavalue.value;
	             bioschemasAnnotation.molecularFormula = smiles.replace("\"", "\'\'") ;
		 } else if (item.claims.P233 && item.claims.P233[0].mainsnak.datavalue) {
	             var smiles = item.claims.P233[0].mainsnak.datavalue.value;
	             bioschemasAnnotation.smiles = smiles.replace("\"", "\'\'") ;
		 }
		 $( '#bioschemas' ).append( JSON.stringify(bioschemasAnnotation) );
	     } catch(e) { console.log("Exception: " + e)
	     }
	 } else if (item.claims.P352) { // UniProt ID
	     try { /* Protein */
		 var uniprot = item.claims.P352[0].mainsnak.datavalue.value;
		 bioschemasAnnotation = {
	             "@context" : "https://schema.org",
	             "@type" : "Protein" ,
	             "http://purl.org/dc/terms/conformsTo": { "@type": "CreativeWork", "@id": "https://bioschemas.org/profiles/Protein/0.11-RELEASE/" },
	             "identifier" : q ,
	             "url" : "http://www.wikidata.org/entity/" + q ,
	             "sameAs": "https://www.uniprot.org/uniprot/" + uniprot
		 }
		 if ('en' in item.labels) {
	       bioschemasAnnotation.name = item.labels.en.value;
         }
		 $( '#bioschemas' ).append( JSON.stringify(bioschemasAnnotation) );
	     } catch(e) { console.log("Exception: " + e)
	     }
	 } else if (item.claims.P351 || item.claims.P594) { // NCBI Gene or Ensembl
	     try { /* Gene */
		 bioschemasAnnotation = {
	             "@context" : "https://schema.org",
	             "@type" : "Gene" ,
	             "http://purl.org/dc/terms/conformsTo": { "@type": "CreativeWork", "@id": "https://bioschemas.org/profiles/Gene/0.7-RELEASE/" },
	             "identifier" : q ,
	             "url" : "http://www.wikidata.org/entity/" + q 
		 }
		 if ('en' in item.labels) {
	       bioschemasAnnotation.name = item.labels.en.value;
         }
		 counter = 0
		 bioschemasAnnotation.sameAs = []
		 if (item.claims.P351 && item.claims.P351[0].mainsnak.datavalue) {
	             var ncbi = item.claims.P351[0].mainsnak.datavalue.value;
	             bioschemasAnnotation.sameAs[counter] = "https://www.ncbi.nlm.nih.gov/gene/" + ncbi;
	             counter++
		 }
		 if (item.claims.P594 && item.claims.P594[0].mainsnak.datavalue) {
	             var ensembl = item.claims.P594[0].mainsnak.datavalue.value;
	             bioschemasAnnotation.sameAs[counter] = "http://identifiers.org/ensembl/" + ensembl;
		 }
		 $( '#bioschemas' ).append( JSON.stringify(bioschemasAnnotation) );
	     } catch(e) { console.log("Exception: " + e)
	     }
	 }
	 
	 /* English Wikipedia */
	 if ('enwiki' in item.sitelinks) {
	     var title = item.sitelinks.enwiki.title;
	     var wikipediaApiUrl = 'https://en.wikipedia.org/w/api.php?' +
				   'action=query&prop=extracts&exsentences=3&exlimit=1&exintro=1&' + 
				   'explaintext=1&callback=?&format=json&titles=' +
				   encodeURIComponent(title);
	     var wikipediaUrl = 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title)
	     
	     $.getJSON(wikipediaApiUrl, function(data) {
		 var pages = data.query.pages;
		 var text = pages[Object.keys(pages)[0]].extract + " ... "
		 var html = "(from the <a href=\"" + wikipediaUrl + "\">English Wikipedia</a>)";
		 $("#intro").text(text).append(html);
	     }).fail(function(d, textStatus, error) {
		 console.error("getJSON failed, status: " + textStatus + ", error: "+error)
	     });
	 }

	 
	 /* English Wikiversity */
	 if ('enwikiversity' in item.sitelinks) {
	     var enwikiversityTitle = item.sitelinks.enwikiversity.title;
	     var wikiversityApiUrl = 'https://en.wikiversity.org/w/api.php?' +
				     'action=query&prop=extracts&exsentences=3&exlimit=1&exintro=1&' + 
				     'explaintext=1&callback=?&format=json&titles=' +
				     encodeURIComponent(enwikiversityTitle);
	     var wikiversityUrl = 'https://en.wikiversity.org/wiki/' + encodeURIComponent(enwikiversityTitle)

	     $.getJSON(wikiversityApiUrl, function(data) {
		 var pages = data.query.pages;
		 var text = pages[Object.keys(pages)[0]].extract; 
		 if (text) {
		     var html = "... (from the <a href=\"" + wikiversityUrl + "\">English Wikiversity</a>)";
		 }
		 else {
		     var html = "Read on the <a href=\"" + wikiversityUrl + "\">English Wikiversity</a>";
		 }
		 $("#wikiversity-extract").text(text).append(html);
	     }).fail(function(d, textStatus, error) {
		 console.error("getJSON failed, status: " + textStatus + ", error: "+error)
	     });
	 }

     });
}
 
function workWithQ2(q2) {
    var url2 = 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' +
				   q2  + 
				   '&format=json&callback=?';
		$.getJSON(url2, function (data) {
			 var item = data.entities[q2];
			 if ('en' in item.labels) {
				 $("#h1").append(' - '+item.labels.en.value);
			 }
			 $("#h1").append(' (<a href="https://www.wikidata.org/wiki/'+ q2 + '">' +  q2 + '</a>)');	
		});
    
}

function wikiItemAsDifferentAspect(query, q, q2, urlfor) {
    
    var endpointUrl = 'https://query.wikidata.org/sparql';
    settings = {
    headers: { Accept: 'application/sparql-results+json' },
    data: { query: query }
    };
    
    $.ajax( endpointUrl, settings ).then( function ( data ) {
    data.results.bindings.forEach(function(entry) {
        var aspect = entry.aspect.value;
        var href = urlfor + aspect + '/' + q 
        $( '#aspect-chooser' ).append(
        `<a role="button" class="btn btn-outline-dark btn-sm" href="${href} "> ${aspect} </a> ` )
    });
    } );
}

function wikiItemSubpage(query, q, q2, urlfor) {
    var endpointUrl = 'https://query.wikidata.org/sparql';
    settings = {
    headers: { Accept: 'application/sparql-results+json' },
    data: { query: query }
    };

    $.ajax( endpointUrl, settings ).then( function ( data ) {
    data.results.bindings.forEach(function(entry) {
        var props = entry.aspectsubpage.value.split("-");
        var aspect = props[0];
        var subpage = props[1];
        var href = urlfor + aspect + '/' + q  + '/' + subpage
        $( '#aspect-chooser' ).append(
        `<a role="button" class="btn btn-outline-dark btn-sm" href="${href}">  ${subpage}  </a> ` );
    });
    } );
    
}

function wembedder(q) {
    var wembedderUrl = `https://wembedder.toolforge.org/api/most-similar/${q}`;
    $.ajax({
        url: wembedderUrl,
        success: function (data) {
            var html = `<hr><span data-toogle="tooltip" title="Related items from Wembedder knowledge graph embedding.">Related:</span> `; 
            $( '#wembedder' ).append(html);

            // Make list with results
            data.most_similar.forEach(function(entry, idx, array) {
                var listed_q = entry.item;
                var language = 'en';

                if (idx !== 0) {
                    $( '#wembedder' ).append( ' &middot; ');
                }

                var html = '<a href="../' + listed_q + '"><span id="wembedder-result-' + listed_q + '">' + listed_q + '</span></a> '
                $( '#wembedder' ).append( html );

                // Convert Q identifier to labels
                $.getJSON("https://www.wikidata.org/w/api.php?callback=?", {
                    action: "wbgetentities",
                    ids: listed_q,
                    language: language,
                    uselang: language,
                    format: "json",
                    strictlanguage: true,
                }, function (data) {
                    if (listed_q in data.entities) {
                        label = entityToLabel(data.entities[listed_q],
                                            language=language);
                        $('#wembedder-result-' + listed_q).empty();
                        $('#wembedder-result-' + listed_q).text(label);
                    }
                });
            });
            $( '#wembedder' ).append( '<hr>' );
        }
    });
    
}

function searchTerm(placeholder, urlfor) {

	let search_text = ""
    
    
	$('#searchterm').select2({
		allowClear: true,
		placeholder: placeholder,
		ajax: {
			url: "https://www.wikidata.org/w/api.php?callback=?",
			dataType: 'jsonp',
			data: function (params) {
				search_text = params.term
				var query = {
					search: params.term,
					action: "wbsearchentities",
					language: "en",
					uselang: "en",
					format: "json",
					strictlanguage: true
				}
				return query
			},
			processResults: function (data) {
				var results = [{id: -1, text: "Advanced search"}];
				$.each(data.search, function (index, item) {
					results.push({
						id: urlfor + item.title,
						text: item.label + " - " + item.description
					});
				});

				return {
					"results": results
				};
			}
		}
	});

	$("#searchterm").on("select2:select", function (e) {
		const search_id = e.params.data.id
		if (search_id === -1) {
			if(search_text === undefined) search_text = ""
			window.location.href = "/search?q=" + search_text;
		} else {
			window.location.href = e.params.data.id;
		}
	});	
	
	
}

function quickStatement404DOI(doi, element) {
	const c = require('citation-js')

	try {
		let example = new c.Cite([doi])
		let output = example.format('quickstatements')
		$( element ).append( output );
		output = encodeURIComponent(
		output.replaceAll('\t', '|')
			  .replaceAll('\n', '||'))
	
		htmlOutput = "<a href=\"https://quickstatements.toolforge.org/#/v1=" + output + "\">\n" +
					"  <button class=\"btn btn-primary\">Submit to Quickstatements ↗</button>\n" +
					"</a>\n"
		$( element ).after( htmlOutput );
	} catch (error) {
		if (error.message.includes("status code 404")) {
			$( element ).append( "DOI does not exist" )
		} else {
			console.log(error)
		}
	}
}
