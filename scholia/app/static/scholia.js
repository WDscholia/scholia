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

//  A formatted version of a popular md5 implementation.
//  Original copyright (c) Paul Johnston & Greg Holt.

function md5(inputString) {
    var hc="0123456789abcdef";
    function rh(n) {var j,s="";for(j=0;j<=3;j++) s+=hc.charAt((n>>(j*8+4))&0x0F)+hc.charAt((n>>(j*8))&0x0F);return s;}
    function ad(x,y) {var l=(x&0xFFFF)+(y&0xFFFF);var m=(x>>16)+(y>>16)+(l>>16);return (m<<16)|(l&0xFFFF);}
    function rl(n,c)            {return (n<<c)|(n>>>(32-c));}
    function cm(q,a,b,x,s,t)    {return ad(rl(ad(ad(a,q),ad(x,t)),s),b);}
    function ff(a,b,c,d,x,s,t)  {return cm((b&c)|((~b)&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t)  {return cm((b&d)|(c&(~d)),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t)  {return cm(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t)  {return cm(c^(b|(~d)),a,b,x,s,t);}
    function sb(x) {
        var i;var nblk=((x.length+8)>>6)+1;var blks=new Array(nblk*16);for(i=0;i<nblk*16;i++) blks[i]=0;
        for(i=0;i<x.length;i++) blks[i>>2]|=x.charCodeAt(i)<<((i%4)*8);
        blks[i>>2]|=0x80<<((i%4)*8);blks[nblk*16-2]=x.length*8;return blks;
    }
    var i,x=sb(inputString),a=1732584193,b=-271733879,c=-1732584194,d=271733878,olda,oldb,oldc,oldd;
    for(i=0;i<x.length;i+=16) {olda=a;oldb=b;oldc=c;oldd=d;
        a=ff(a,b,c,d,x[i+ 0], 7, -680876936);d=ff(d,a,b,c,x[i+ 1],12, -389564586);c=ff(c,d,a,b,x[i+ 2],17,  606105819);
        b=ff(b,c,d,a,x[i+ 3],22,-1044525330);a=ff(a,b,c,d,x[i+ 4], 7, -176418897);d=ff(d,a,b,c,x[i+ 5],12, 1200080426);
        c=ff(c,d,a,b,x[i+ 6],17,-1473231341);b=ff(b,c,d,a,x[i+ 7],22,  -45705983);a=ff(a,b,c,d,x[i+ 8], 7, 1770035416);
        d=ff(d,a,b,c,x[i+ 9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,     -42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
        a=ff(a,b,c,d,x[i+12], 7, 1804603682);d=ff(d,a,b,c,x[i+13],12,  -40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);
        b=ff(b,c,d,a,x[i+15],22, 1236535329);a=gg(a,b,c,d,x[i+ 1], 5, -165796510);d=gg(d,a,b,c,x[i+ 6], 9,-1069501632);
        c=gg(c,d,a,b,x[i+11],14,  643717713);b=gg(b,c,d,a,x[i+ 0],20, -373897302);a=gg(a,b,c,d,x[i+ 5], 5, -701558691);
        d=gg(d,a,b,c,x[i+10], 9,   38016083);c=gg(c,d,a,b,x[i+15],14, -660478335);b=gg(b,c,d,a,x[i+ 4],20, -405537848);
        a=gg(a,b,c,d,x[i+ 9], 5,  568446438);d=gg(d,a,b,c,x[i+14], 9,-1019803690);c=gg(c,d,a,b,x[i+ 3],14, -187363961);
        b=gg(b,c,d,a,x[i+ 8],20, 1163531501);a=gg(a,b,c,d,x[i+13], 5,-1444681467);d=gg(d,a,b,c,x[i+ 2], 9,  -51403784);
        c=gg(c,d,a,b,x[i+ 7],14, 1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);a=hh(a,b,c,d,x[i+ 5], 4,    -378558);
        d=hh(d,a,b,c,x[i+ 8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16, 1839030562);b=hh(b,c,d,a,x[i+14],23,  -35309556);
        a=hh(a,b,c,d,x[i+ 1], 4,-1530992060);d=hh(d,a,b,c,x[i+ 4],11, 1272893353);c=hh(c,d,a,b,x[i+ 7],16, -155497632);
        b=hh(b,c,d,a,x[i+10],23,-1094730640);a=hh(a,b,c,d,x[i+13], 4,  681279174);d=hh(d,a,b,c,x[i+ 0],11, -358537222);
        c=hh(c,d,a,b,x[i+ 3],16, -722521979);b=hh(b,c,d,a,x[i+ 6],23,   76029189);a=hh(a,b,c,d,x[i+ 9], 4, -640364487);
        d=hh(d,a,b,c,x[i+12],11, -421815835);c=hh(c,d,a,b,x[i+15],16,  530742520);b=hh(b,c,d,a,x[i+ 2],23, -995338651);
        a=ii(a,b,c,d,x[i+ 0], 6, -198630844);d=ii(d,a,b,c,x[i+ 7],10, 1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);
        b=ii(b,c,d,a,x[i+ 5],21,  -57434055);a=ii(a,b,c,d,x[i+12], 6, 1700485571);d=ii(d,a,b,c,x[i+ 3],10,-1894986606);
        c=ii(c,d,a,b,x[i+10],15,   -1051523);b=ii(b,c,d,a,x[i+ 1],21,-2054922799);a=ii(a,b,c,d,x[i+ 8], 6, 1873313359);
        d=ii(d,a,b,c,x[i+15],10,  -30611744);c=ii(c,d,a,b,x[i+ 6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21, 1309151649);
        a=ii(a,b,c,d,x[i+ 4], 6, -145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+ 2],15,  718787259);
        b=ii(b,c,d,a,x[i+ 9],21, -343485551);a=ad(a,olda);b=ad(b,oldb);c=ad(c,oldc);d=ad(d,oldd);
    }
    return rh(a)+rh(b)+rh(c)+rh(d);
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
