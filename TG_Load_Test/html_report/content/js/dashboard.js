/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 76.01236745691745, "KoPercent": 23.987632543082558};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7537848682807684, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7588659344912672, 500, 1500, "02_POST_create_character"], "isController": false}, {"data": [0.7600058145169105, 500, 1500, "03_GET by id"], "isController": false}, {"data": [0.7613708072423668, 500, 1500, "04_PUT_update_character"], "isController": false}, {"data": [0.7257496016609531, 500, 1500, "01_GET_all_characters"], "isController": false}, {"data": [0.7630746776939917, 500, 1500, "05_DELETE_character"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 103174, 24749, 23.987632543082558, 134.72488223777322, 0, 669, 303.0, 611.0, 617.0, 629.0, 1290.4976922788278, 1466.0183024881487, 188.55726580382495], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["02_POST_create_character", 20669, 4984, 24.11340655087329, 82.88973825535814, 1, 646, 4.0, 465.0, 474.0, 617.0, 258.60817776888047, 197.1442328219621, 44.95547625713177], "isController": false}, {"data": ["03_GET by id", 20638, 4953, 23.999418548308945, 85.79382692121337, 0, 669, 4.0, 467.0, 476.0, 616.0, 258.25585324039895, 195.70700861796578, 30.861845948875654], "isController": false}, {"data": ["04_PUT_update_character", 20601, 4916, 23.862919275763314, 81.96577836027397, 1, 668, 3.0, 462.0, 473.0, 616.0, 257.8089803273765, 195.41574373028982, 47.26623361005782], "isController": false}, {"data": ["01_GET_all_characters", 20711, 5026, 24.2672975713389, 345.36386461300697, 2, 661, 372.0, 505.0, 563.9500000000007, 624.0, 259.05264606186444, 683.5258600404633, 30.46271832277452], "isController": false}, {"data": ["05_DELETE_character", 20555, 4870, 23.692532230600825, 76.61571393821475, 0, 669, 2.0, 461.0, 473.0, 616.0, 257.2268802402703, 194.57035649480667, 35.0802978546177], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 24746, 99.98787829811306, 23.98472483377595], "isController": false}, {"data": ["404/Not Found", 3, 0.012121701886944928, 0.002907709306608254], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 103174, 24749, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 24746, "404/Not Found", 3, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["02_POST_create_character", 20669, 4984, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 4984, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["03_GET by id", 20638, 4953, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 4952, "404/Not Found", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["04_PUT_update_character", 20601, 4916, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 4915, "404/Not Found", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["01_GET_all_characters", 20711, 5026, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 5026, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["05_DELETE_character", 20555, 4870, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 4869, "404/Not Found", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
