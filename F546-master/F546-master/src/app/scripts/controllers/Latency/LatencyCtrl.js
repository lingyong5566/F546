/*
 This Controller sets up the main Latency Graph.
 */
angular.module('traceroute').controller('LatencyGraphCtrl', ['$scope', '$http', '$q', '$log', '$interval', 'HostService', 'LatencyGraphService', 'UnixTimeConverterService', 'GeoIPNekudoService', 'UniqueArrayService', 'LatencyResultsService', 'AnalyzeLatency', 'CurrentTimeUnixService', 'DNSLookup', 'toastr', function ($scope, $http, $q, $log, $interval, HostService, LatencyGraphService, UnixTimeConverterService, GeoIPNekudoService, UniqueArrayService, LatencyResultsService, AnalyzeLatency, CurrentTimeUnixService, DNSLookup, toastr) {
  // Threshold values
  var packetLossGreen = 0.01;
  // Yellow is in between green and red.
  var packetLossRed = 0.1;
  loadLatencyGraph();

  // Set up interval to auto load every 30 minutes
  $interval(function () {

    //Call this again every 30 minutes
    loadLatencyGraph();

  }, 30 * 60 * 1000);

  function loadLatencyGraph() {

    var sourceAndDestinationList;
    var nodeToIPList;

    LatencyResultsService.getMainResult({
      'format': 'json',
      'event-type': 'histogram-rtt',
      //'event-type': 'packet-loss-rate',
      // 'limit': 10,
      // 'time-end': (Math.floor(Date.now() / 1000)),
      'time-range': 604800
      //48 Hours = 172800
      // 24 hours = 86400
      // 7 days = 604800
    }).then(function (response) {

      sourceAndDestinationList = [];
      nodeToIPList = [];
      var promises = [];

      for (var i = 0; i < response.data.length; i++) {

        sourceAndDestinationList.push(
          {
            source: response.data[i]['source'],
            destination: response.data[i]['destination'],
            metadataKey: response.data[i]['metadata-key']
          }
        );

        //Adding DESTINATION nodes into visualisation
        if (LatencyGraphService.getGraph().elements('node[id = "' + response.data[i]['destination'] + '"]').size() == 0) {
          // $log.debug("Unique Destination Name: " + response.data[i]['destination'])
          LatencyGraphService.add_node(response.data[i]['destination'], false, null, null);
          nodeToIPList.push(response.data[i]['destination']);

          // // Event
          // LatencyGraphService.getGraph().on('tap', 'node[id = "' + response.data[i]['destination'] + '"]', function (event) {
          //
          // });
        }

        //Adding SOURCE nodes into visualisation
        if (LatencyGraphService.getGraph().elements('node[id = "' + response.data[i]['source'] + '"]').size() == 0) {
          // $log.debug("Unique Source Name: " + response.data[i]['source'])
          LatencyGraphService.add_node(response.data[i]['source'], true, response.data[i]['source'], response.data[i]['destination']);
          nodeToIPList.push(response.data[i]['source']);

        } else {
          //update it to be source node as well.
          LatencyGraphService.getGraph().elements('node[id = "' + response.data[i]['source'] + '"]').data({
            sourceNode: "true"
          });
        }

        //Adding EDGES for SOURCE and DESTINATION
        if (LatencyGraphService.getGraph().elements('edge[id = "' + response.data[i]['metadata-key'] + '"]').size() == 0) {

          //ID, source, target, tracerouteRTT, latency, time, startNode, endNode, metadataKey)
          LatencyGraphService.add_edge(response.data[i]['metadata-key'], response.data[i]['source'], response.data[i]['destination'], null, null, null, response.data[i]['source'], response.data[i]['destination'], response.data[i]['metadata-key']);

        }


        for (var j = 0; j < response.data[i]['event-types'].length; j++) {

          if (response.data[i]['event-types'][j]['event-type'] == 'histogram-rtt') {

            for (var k = 0; k < response.data[i]['event-types'][j]['summaries'].length; k++) {

              //Choose Aggregation or Statistics.
              if (response.data[i]['event-types'][j]['summaries'][k]['summary-type'] == "statistics" && response.data[i]['event-types'][j]['summaries'][k]['summary-window'] == 0) {

                var latencyURL = response.data[i]['url'] + "histogram-rtt/" + response.data[i]['event-types'][j]['summaries'][k]['summary-type'] + "/" + response.data[i]['event-types'][j]['summaries'][k]['summary-window']
                // $log.debug("LATENCY URL: "+ latencyURL)

                var promise = $http({
                  method: 'GET',
                  url: latencyURL,
                  params: {
                    'format': 'json',
                    // 'limit': '2',
                    // 'time-end': (Math.floor(Date.now() / 1000)),
                    // 'time-range': 604800
                    //48 Hours = 172800
                    // 24 hours = 86400
                    // 7 days = 604800
                    'time-start': response.data[i]['event-types'][j]['summaries'][k]['time-updated'] - 900
                  },
                  cache: true
                });

                promises.push(promise);
              }


            }

          }
        }

      }

      return $q.all(promises);

    }).then(function (response) {

      for (var i = 0; i < response.length; i++) {

        var startNode = sourceAndDestinationList[i].source;
        var destinationNode = sourceAndDestinationList[i].destination;
        var metadataKey = sourceAndDestinationList[i].metadataKey;

        var reversedResponse = response[i].data.reverse();
        var returnedDate = AnalyzeLatency.getMinMaxDate(reversedResponse);

        var minDateToDisplay = UnixTimeConverterService.getDate(returnedDate[0])
        var maxDateToDisplay = UnixTimeConverterService.getDate(returnedDate[1])
        $scope.minDate = minDateToDisplay[1] + " " + minDateToDisplay[0] + " " + minDateToDisplay[2];
        $scope.maxDate = maxDateToDisplay[1] + " " + maxDateToDisplay[0] + " " + maxDateToDisplay[2];


        //TODO: Consider removing showing unnecessary values.

        for (var j = 0; j < reversedResponse.length; j++) {

          var edge = LatencyGraphService.getGraph().elements('edge[startNode = "' + startNode + '"][endNode = "' + destinationNode + '"][metadataKey = "' + metadataKey + '"]');
          var latencyMin = reversedResponse[j]['val']['minimum'];
          //ID, source, target, tracerouteRTT, latency, time, startNode, endNode, metadataKey,rttMax,rttMin,rttMean

          edge.data({
            latency: math.round(latencyMin, 3),
            time: reversedResponse[j]['ts'],
            rttMax: math.round(reversedResponse[j]['val']['maximum'], 3),
            rttMin: math.round(reversedResponse[j]['val']['minimum'], 3),
            rttMean: math.round(reversedResponse[j]['val']['mean'], 3)
          })

          break;
        }

      }


      var uniqueIP = UniqueArrayService.getUnique(nodeToIPList);
      var nodeToIP_promises = [];

      for (var i = 0; i < uniqueIP.length; i++) {
        nodeToIP_promises.push(GeoIPNekudoService.getCountry(uniqueIP[i]));
      }

      return $q.all(nodeToIP_promises);

    }).then(function (response) {

      for (var i = 0; i < response.length; i++) {

        var node = LatencyGraphService.getGraph().elements('[id = "' + response[i].ip + '"]');
        node.data({
          label: response[i].ip + "\n" + response[i].city + ", " + response[i].countrycode
        });

      }


      LatencyGraphService.getGraph().layout({
        name: 'concentric',
        fit: true, // whether to fit the viewport to the graph
        padding: 30, // the padding on fit
        startAngle: 3 / 2 * Math.PI, // where nodes start in radians
        sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
        clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
        equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
        minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        height: undefined, // height of layout area (overrides container height)
        width: undefined, // width of layout area (overrides container width)
        concentric: function (node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
          return node.degree();
        },
        levelWidth: function (nodes) { // the variation of concentric values in each level
          return nodes.maxDegree() / 4;
        },
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled
        ready: undefined, // callback on layoutready
        stop: undefined // callback on layoutstop
      });

      LatencyGraphService.getGraph().on('tap', 'edge,:selected', function (event) {
        var element = event.cyTarget;

        // window.dispatchEvent(new Event('resize'));
        // Latency_To_Traceroute_InfoService.setMetadata(element.data().metadataKey);

        // Latency_To_Traceroute_InfoService.setTracerouteGraph(element.data().startNode, element.data().endNode).then(function (response) {
        //
        //   if (response !== undefined) {
        //     $scope.showTraceroute = true;
        //     // window.dispatchEvent(new Event('resize'));
        //     $scope.tracerouteTime = response[0][0] + ":" + response[0][1] + ":" + response[0][2] + " " + response[0][3];
        //     $scope.tracerouteDate = response[1][0] + " " + response[1][1] + " " + response[1][2];
        //
        //   } else if (response === undefined) {
        //     //No Traceroute is available.
        //     // console.log("NO TR");
        //     $scope.showTraceroute = false;
        //     $scope.tracerouteTime = "";
        //     $scope.tracerouteDate = "";
        //   }
        //
        //
        // });


        $scope.$apply(function (response) {

          $scope.latencyMetadata = element.data().metadataKey;
          $scope.$broadcast('LatencyMetadata', element.data().metadataKey);


          var time = UnixTimeConverterService.getTime(element.data().time);
          var date = UnixTimeConverterService.getDate(element.data().time);

          var errorStatus = null;
          //TODO: FIX THIS
          if (element.data().tracerouteError == "true") {
            errorStatus = true;
          } else if (element.data().tracerouteError == "false") {
            errorStatus = false;
          }

          //rttMax,rttMin,rttMean
          $scope.selectedPath = {
            metadata: element.data().metadataKey,
            source: element.data().startNode,
            destination: element.data().endNode,
            errorStatus: element.data().tracerouteError,
            time: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3],
            date: date[1] + " " + date[0] + " " + date[2],
            rttMax: element.data().rttMax,
            rttMin: element.data().rttMin,
            rttMean: element.data().rttMean,
            sourceDNS: DNSLookup.getDomain(element.data().startNode)['dns'],
            destinationDNS: DNSLookup.getDomain(element.data().endNode)['dns']
          }

        });

        LatencyGraphService.getGraph().style()
          .selector('edge')
          .style({
            'line-color': '#a8ea00',
            'width': 2
          }).update();

        LatencyGraphService.getGraph().style()
          .selector('edge[id = "' + element.data().metadataKey + '"]')
          .style({
            'line-color': 'green',
            'width': 4
          }).update();

        //
        //
        // if (element.data().tracerouteError == "true") {
        //   //Make this Dark Red
        //   TracerouteGraphService.getGraph().style()
        //     .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
        //     .style({
        //       'line-color': 'DarkRed',
        //       'width': 4
        //     }).update();
        // } else if (element.data().tracerouteError == "false") {
        //   TracerouteGraphService.getGraph().style()
        //     .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
        //     .style({
        //       'line-color': 'green',
        //       'width': 4
        //     }).update();
        // }

      });

      var tempTime = CurrentTimeUnixService.time()
      $scope.lastUpdated = tempTime[0] + ":" + tempTime[1] + ":" + tempTime[2] + " " + tempTime[3];


    }).catch(function (error) {
      $log.debug("LatencyGraphCtrl ERROR:")
      $log.error(error);
      $log.debug("Server Response: " + error.status);

      if (error.status == 500) {
        //500 on server.
        toastr.error('Unable to reach host. Server Status Code: 500');
      } else {
        toastr.error('Unable to reach host. Status Code: ' + error.status);
      }

    });


    //Add onlayoutstop here if needed.

  }

}]);


angular.module('traceroute').controller('LatencyInfoCtrl', ['$scope', '$http', '$q', '$log', 'HostService', 'UnixTimeConverterService', 'LatencyResultsService', 'toastr', function ($scope, $http, $q, $log, HostService, UnixTimeConverterService, LatencyResultsService, toastr) {

  // $log.debug("LatencyHistoryCtrl:START");

  //To allow Cytoscape graph to load upon showing/hiding.
  //window.dispatchEvent(new Event('resize'));

  //This is called upon clicking on the edge.
  $scope.$on('LatencyMetadata', function (event, metadata) {

    window.dispatchEvent(new Event('resize'));
    var latencyMetadata = metadata;
    var metadataURL = HostService.getHost() + latencyMetadata + "/";

    $scope.latencyMetadata = metadata;


    LatencyResultsService.getIndividualResult(metadataURL,
      {
        'format': 'json',
        'event-type': 'histogram-rtt',
        'time-range': 604800
        // 'limit': 10,
        // 'time-end': (Math.floor(Date.now() / 1000)),
        // 'time-range': 86400
      }
    ).then(function (response) {

      $scope.latencySummaryData = [];

      for (var j = 0; j < response.data['event-types'].length; j++) {

        if (response.data['event-types'][j]['event-type'] == 'histogram-rtt') {

          for (var k = 0; k < response.data['event-types'][j]['summaries'].length; k++) {

            var tabName = "";

            if (response.data['event-types'][j]['summaries'][k]['summary-type'] == "aggregation") {
              tabName = "Aggregated Results: " + (response.data['event-types'][j]['summaries'][k]['summary-window'] / 60 / 60) + " hour";
            } else if (response.data['event-types'][j]['summaries'][k]['summary-type'] == "statistics") {
              tabName = "Statistical Results: " + (response.data['event-types'][j]['summaries'][k]['summary-window'] / 60 / 60) + " hour";
            }

            if (response.data['event-types'][j]['summaries'][k]['summary-window'] != 0) {
              $scope.latencySummaryData.push({
                tabName: tabName,
                type: response.data['event-types'][j]['summaries'][k]['summary-type'],
                uri: response.data['event-types'][j]['summaries'][k]['uri'],
                time: UnixTimeConverterService.getTime(response.data['event-types'][j]['summaries'][k]['time-updated']),
                date: UnixTimeConverterService.getDate(response.data['event-types'][j]['summaries'][k]['time-updated']),
                window: response.data['event-types'][j]['summaries'][k]['summary-window'],
                url: response.data['url'],
                event_type: response.data['event-types'][j]['event-type']

              });

            }

          }

        }
      }


    }).catch(function (error) {
      $log.debug("LatencyHistoryCtrl: ERROR")
      console.log(error);
      $log.debug("Server Response: " + error.status);

    });

  });

  $scope.showTracerouteFunction = function () {
    window.dispatchEvent(new Event('resize'));
    $scope.showTraceroute = true;
  }

  $scope.loadChart_LatencySummary = function (URL, event_type, summary_type, summary_window, uri) {
    $log.debug("loadChart_LatencySummary() " + uri);

    $scope.showTraceroute = false;

    // var latencyURL = response.data[i]['url'] + "histogram-rtt/" + response.data[i]['event-types'][j]['summaries'][k]['summary-type'] + "/" + response.data[i]['event-types'][j]['summaries'][k]['summary-window']
    if (summary_type == "aggregation") {
      var individualLatencyResultsURL = URL + event_type + "/" + summary_type + "s/" + summary_window;
    } else {
      var individualLatencyResultsURL = URL + event_type + "/" + summary_type + "/" + summary_window;
    }

    $log.debug("LatencyInformationCtrl: loadLatencySummaryChart URL:" + individualLatencyResultsURL);

    LatencyResultsService.getIndividualResult(individualLatencyResultsURL, {
      'format': 'json',
      // 'event-type': 'histogram-rtt',
      // 'limit': 10,
      // 'time-end': (Math.floor(Date.now() / 1000)),
      // 'time-range': 86400
      // 604800 = 7 days
      // 86400 = 24 hours
    }).then(function (response) {

      if (summary_type == "aggregation") {

        $scope.resultTypeAggregation = true;
        $scope.individualLatencyResults = [];
        // var reversedResponse = response.data.reverse();
        var reversedResponse = response.data;

        // $scope.options = {
        //
        //     title: {
        //       display: true,
        //       text: 'Custom Chart Title'
        //     },
        //   legend: {
        //     display: false,
        //     labels: {
        //       fontColor: 'rgb(255, 99, 132)'
        //     }
        //   }
        // };

        // options = {
        //   scales: {
        //     yAxes: [{
        //       scaleLabel: {
        //         display: true,
        //         labelString: 'probability'
        //       }
        //     }]
        //   }
        // };

        for (var i = 0; i < reversedResponse.length; i++) {
          var labelsWithFloat = {};
          var labels = [];
          var values = [];
          var keys = Object.keys(reversedResponse[i]['val']), len = keys.length;
          var keysFloat = [];

          for (var k = 0; k < len; k++) {
            // keysFloat.push(parseFloat(keys[k]));

            // labelsWithFloat[keys[k]] = parseFloat(keys[k]);
            labelsWithFloat[parseFloat(keys[k])] = keys[k];

            // labelsWithFloat.push({
            //   float:keys[k],
            //   string:parseFloat(keys[k])
            // });
          }


          var floatKeys = Object.keys(labelsWithFloat), len2 = floatKeys.length;
          floatKeys.sort(function (a, b) {
            return a - b;
          });

          for (var k = 0; k < len2; k++) {

            var objKey = floatKeys[k];
            console.log("OBJKEY:" + objKey + "TYPE: " + typeof(objKey))
            console.log(reversedResponse[i]['val'][labelsWithFloat[objKey]])


            // var objKeyStr = keys[k];
            labels.push(objKey);
            values.push(reversedResponse[i]['val'][labelsWithFloat[objKey]]);

          }


          // labelsWithFloat.float.sort(function(a,b) { return a - b;});
          // keys.sort();
          //
          // for (var k = 0; k < len; k++) {
          //   var objKey = keysFloat[k];
          //   console.log(objKey)
          //   // var objKeyStr = keys[k];
          //   labels.push(objKey);
          //   values.push(reversedResponse[i]['val'][objKey.toString()]);
          // }


          // angular.forEach(reversedResponse[i]['val'], function (value, key) {
          //
          //   labels.push(key);
          //   values.push(value);
          //
          //
          // });


          var time = UnixTimeConverterService.getTime(reversedResponse[i]['ts']);
          var date = UnixTimeConverterService.getDate(reversedResponse[i]['ts']);


          // $scope.options = {
          //   title: {
          //     display: true,
          //     // text: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3] + ", " + date[0] + " " + date[1] + " " + date[2]
          //   },
          //   scales: {
          //     yAxes: [
          //       {
          //         display: true,
          //         position: 'left',
          //         scaleLabel:{
          //           labelString: "Number of Packets",
          //           display: true
          //         }
          //       }
          //     ],
          //     xAxes: [
          //       {
          //         display: true,
          //         position: 'bottom',
          //         scaleLabel:{
          //           labelString: "Time in milliseconds",
          //           display: true
          //         }
          //       }
          //     ]
          //   }
          // };
          //


          $scope.individualLatencyResults.push({
            ts: reversedResponse[i]['ts'],
            time: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3],
            date: date[0] + " " + date[1] + " " + date[2],
            label: labels,
            data: values,
            options: {
              title: {
                display: true,
                text: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3] + ", " + date[0] + " " + date[1] + " " + date[2]
              },
              scales: {
                yAxes: [
                  {
                    display: true,
                    position: 'left',
                    scaleLabel: {
                      labelString: "Number of Packets",
                      display: true
                    }
                  }
                ],
                xAxes: [
                  {
                    display: true,
                    position: 'bottom',
                    scaleLabel: {
                      labelString: "Time in milliseconds",
                      display: true
                    }
                  }
                ]
              }
            }

            // type: response.data['event-types'][j]['summaries'][k]['summary-type'],
            // uri: response.data['event-types'][j]['summaries'][k]['uri'],
            //
            // window: response.data['event-types'][j]['summaries'][k]['summary-window'],
            // url: response.data['url'],
            // event_type: response.data['event-types'][j]['event-type']

          });


          // $scope.IndividualLatencyResultIndex = 0;

        }
      }
      else if (summary_type == "statistics") {
        $scope.resultTypeAggregation = false;
        $scope.individualLatencyResults = [];
        // var reversedResponse = response.data.reverse();
        var reversedResponse = response.data;

        for (var i = 0; i < reversedResponse.length; i++) {

          // reversedResponse[i]['val'].s

          $log.debug(labels);
          $log.debug(values);

          var time = UnixTimeConverterService.getTime(reversedResponse[i]['ts']);
          var date = UnixTimeConverterService.getDate(reversedResponse[i]['ts']);


          //Round up so table will not be too long.
          $scope.individualLatencyResults.push({
            time: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3],
            date: date[0] + " " + date[1] + " " + date[2],
            // stddev: reversedResponse[i]['val']['standard-deviation'],
            stddev: math.round(reversedResponse[i]['val']['standard-deviation'], 5),
            median: reversedResponse[i]['val']['median'],
            maximum: reversedResponse[i]['val']['maximum'],
            minimum: reversedResponse[i]['val']['minimum'],
            percentile75: reversedResponse[i]['val']['percentile-75'],
            // percentile95: reversedResponse[i]['val']['percentile-95'],
            percentile95: math.round(reversedResponse[i]['val']['percentile-95'], 5),
            percentile25: reversedResponse[i]['val']['percentile-25'],
            // variance: reversedResponse[i]['val']['variance'],
            variance: math.round(reversedResponse[i]['val']['variance'], 5),
            // mean: reversedResponse[i]['val']['mean']
            mean: math.round(reversedResponse[i]['val']['mean'], 5)

          });


          // $scope.IndividualLatencyResultIndex = 0;

        }

        $scope.individualLatencyResults.reverse();

        // $scope.val.label
      }


    }).catch(function (error) {
      $log.debug("LatencyInformationCtrl:loadLatencySummaryChart ERROR")
      $log.error(error);
      $log.debug("Server Response: " + error.status);

      if (error.status == 500) {
        //500 on server.
        toastr.error('Unable to reach host. Server Status Code: 500');
      } else {
        toastr.error('Unable to reach host. Status Code: ' + error.status);
      }

    });


    $scope.loadIndividualLatencyChart = function (key) {

      $scope.IndividualLatencyResultIndex = key;

    };

  }


}]);


angular.module('traceroute').controller('LatencyGraphPanelCtrl', ['$scope', '$log', '$cacheFactory', 'LatencyGraphService', function ($scope, $log, $cacheFactory, LatencyGraphService) {

  $scope.mainGraph_layoutBreathFirst = function () {

    var options = {
      name: 'breadthfirst',

      fit: true, // whether to fit the viewport to the graph
      directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
      padding: 30, // padding on fit
      circle: false, // put depths in concentric circles if true, put depths top down if false
      spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      roots: undefined, // the roots of the trees
      maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      ready: undefined, // callback on layoutready
      stop: undefined // callback on layoutstop
    };

    LatencyGraphService.getGraph().layout(options);
  }

  $scope.mainGraph_layoutdisplayConcentric = function () {

    var options = {
      name: 'concentric',

      fit: true, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
      minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      height: undefined, // height of layout area (overrides container height)
      width: undefined, // width of layout area (overrides container width)
      concentric: function (node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
        return node.degree();
      },
      levelWidth: function (nodes) { // the variation of concentric values in each level
        return nodes.maxDegree() / 4;
      },
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      ready: undefined, // callback on layoutready
      stop: undefined // callback on layoutstop
    };

    LatencyGraphService.getGraph().layout(options);

  }

  $scope.mainGraph_layoutGrid = function () {
    var options = {
      name: 'grid',

      fit: true, // whether to fit the viewport to the graph
      padding: 30, // padding used on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
      condense: false, // uses all available space on false, uses minimal space on true
      rows: undefined, // force num of rows in the grid
      cols: undefined, // force num of columns in the grid
      position: function (node) {
      }, // returns { row, col } for element
      sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      ready: undefined, // callback on layoutready
      stop: undefined // callback on layoutstop
    };

    LatencyGraphService.getGraph().layout(options);

  }

  $scope.mainGraph_layoutCose = function () {

    var options = {
      name: 'cose',

      // Called on `layoutready`
      ready: function () {
      },

      // Called on `layoutstop`
      stop: function () {
      },

      // Whether to animate while running the layout
      animate: true,

      // The layout animates only after this many milliseconds
      // (prevents flashing on fast runs)
      animationThreshold: 250,

      // Number of iterations between consecutive screen positions update
      // (0 -> only updated on the end)
      refresh: 20,

      // Whether to fit the network view after when done
      fit: true,

      // Padding on fit
      padding: 30,

      // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      boundingBox: undefined,

      // Extra spacing between components in non-compound graphs
      componentSpacing: 100,

      // Node repulsion (non overlapping) multiplier
      nodeRepulsion: function (node) {
        return 400000;
      },

      // Node repulsion (overlapping) multiplier
      nodeOverlap: 10,

      // Ideal edge (non nested) length
      idealEdgeLength: function (edge) {
        return 10;
      },

      // Divisor to compute edge forces
      edgeElasticity: function (edge) {
        return 100;
      },

      // Nesting factor (multiplier) to compute ideal edge length for nested edges
      nestingFactor: 5,

      // Gravity force (constant)
      gravity: 80,

      // Maximum number of iterations to perform
      numIter: 1000,

      // Initial temperature (maximum node displacement)
      initialTemp: 200,

      // Cooling factor (how the temperature is reduced between consecutive iterations
      coolingFactor: 0.95,

      // Lower temperature threshold (below this point the layout will end)
      minTemp: 1.0,

      // Whether to use threading to speed up the layout
      useMultitasking: true
    };

    LatencyGraphService.getGraph().layout(options);

  }

  $scope.mainGraph_layoutCircle = function () {

    var options = {
      name: 'circle',

      fit: true, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
      radius: undefined, // the radius of the circle
      startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      ready: undefined, // callback on layoutready
      stop: undefined // callback on layoutstop
    };

    LatencyGraphService.getGraph().layout(options);

  }

  $scope.mainGraph_Centred = function () {
    LatencyGraphService.getGraph().centre();
    LatencyGraphService.getGraph().fit();
    // LatencyGraphService.getGraph().zoomingEnabled(true);
  }

  $scope.mainGraphSearchNode = function (IPAddr) {

    // $log.debug("Node Search: " + IPAddr);

    LatencyGraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');

  }

  $scope.mainGraphSearchNodeKeypress = function () {
    if (keyEvent.which === 13) {
      // $log.debug("Node Search: " + IPAddr);
      LatencyGraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');
    }
  }

}]);


// //Modifications to remove TR graph
// angular.module('traceroute').controller('LatencyInfoCtrl', ['$scope', '$http', '$q', '$log', 'HostService', 'UnixTimeConverterService', 'LatencyResultsService', function ($scope, $http, $q, $log, HostService, UnixTimeConverterService, LatencyResultsService) {
//
//   //To allow Cytoscape graph to load upon showing/hiding.
//   //window.dispatchEvent(new Event('resize'));
//   var host = HostService.getHost();
//
//   //This is called upon clicking on the edge.
//   $scope.$on('LatencyMetadata', function (event, metadata) {
//
//
//     window.dispatchEvent(new Event('resize'));
//     var latencyMetadata = metadata;
//     var metadataURL = host + latencyMetadata + "/";
//
//     $scope.latencyMetadata = metadata;
//
//
//     LatencyResultsService.getIndividualResult(metadataURL,
//       {
//         'format': 'json',
//         'event-type': 'histogram-rtt',
//         // 'limit': 10,
//         // 'time-end': (Math.floor(Date.now() / 1000)),
//         // 'time-range': 86400
//       }
//     ).then(function (response) {
//
//       $scope.latencySummaryData = [];
//
//
//       for (var j = 0; j < response.data['event-types'].length; j++) {
//
//         if (response.data['event-types'][j]['event-type'] == 'histogram-rtt') {
//
//           for (var k = 0; k < response.data['event-types'][j]['summaries'].length; k++) {
//
//             var tabName = "";
//
//             if (response.data['event-types'][j]['summaries'][k]['summary-type'] == "aggregation") {
//               tabName = "Aggregated Results: " + (response.data['event-types'][j]['summaries'][k]['summary-window'] / 60 / 60) + " hour";
//
//
//             } else if (response.data['event-types'][j]['summaries'][k]['summary-type'] == "statistics") {
//               tabName = "Statistical Results: " + (response.data['event-types'][j]['summaries'][k]['summary-window'] / 60 / 60) + " hour";
//
//             }
//
//             if (response.data['event-types'][j]['summaries'][k]['summary-window'] != 0) {
//               $scope.latencySummaryData.push({
//                 tabName: tabName,
//                 type: response.data['event-types'][j]['summaries'][k]['summary-type'],
//                 uri: response.data['event-types'][j]['summaries'][k]['uri'],
//                 time: UnixTimeConverterService.getTime(response.data['event-types'][j]['summaries'][k]['time-updated']),
//                 date: UnixTimeConverterService.getDate(response.data['event-types'][j]['summaries'][k]['time-updated']),
//                 window: response.data['event-types'][j]['summaries'][k]['summary-window'],
//                 url: response.data['url'],
//                 event_type: response.data['event-types'][j]['event-type']
//
//               });
//
//             }
//
//
//           }
//
//         }
//       }
//
//
//     }).catch(function (error) {
//       $log.debug("LatencyHistoryCtrl: ERROR")
//       console.log(error);
//       $log.debug("Server Response: " + error.status);
//
//     });
//
//   });
//
//
//   $scope.loadChart_LatencySummary = function (URL, event_type, summary_type, summary_window, uri) {
//     $log.debug("loadChart_LatencySummary() " + uri);
//
//     $scope.showTraceroute = false;
//
//     // var latencyURL = response.data[i]['url'] + "histogram-rtt/" + response.data[i]['event-types'][j]['summaries'][k]['summary-type'] + "/" + response.data[i]['event-types'][j]['summaries'][k]['summary-window']
//     if (summary_type == "aggregation") {
//       var individualLatencyResultsURL = URL + event_type + "/" + summary_type + "s/" + summary_window;
//     } else {
//       var individualLatencyResultsURL = URL + event_type + "/" + summary_type + "/" + summary_window;
//     }
//
//     $log.debug("LatencyInformationCtrl: loadLatencySummaryChart URL:" + individualLatencyResultsURL);
//
//     LatencyResultsService.getIndividualResult(individualLatencyResultsURL, {
//       'format': 'json',
//       // 'event-type': 'histogram-rtt',
//       // 'limit': 10,
//       // 'time-end': (Math.floor(Date.now() / 1000)),
//       // 'time-range': 86400
//       // 604800 = 7 days
//       // 86400 = 24 hours
//     }).then(function (response) {
//
//       if (summary_type == "aggregation") {
//
//         $scope.resultTypeAggregation = true;
//         $scope.individualLatencyResults = [];
//         // var reversedResponse = response.data.reverse();
//         var reversedResponse = response.data;
//
//         // $scope.options = {
//         //
//         //     title: {
//         //       display: true,
//         //       text: 'Custom Chart Title'
//         //     },
//         //   legend: {
//         //     display: false,
//         //     labels: {
//         //       fontColor: 'rgb(255, 99, 132)'
//         //     }
//         //   }
//         // };
//
//         // options = {
//         //   scales: {
//         //     yAxes: [{
//         //       scaleLabel: {
//         //         display: true,
//         //         labelString: 'probability'
//         //       }
//         //     }]
//         //   }
//         // };
//
//         for (var i = 0; i < reversedResponse.length; i++) {
//           var labelsWithFloat = {};
//           var labels = [];
//           var values = [];
//           var keys = Object.keys(reversedResponse[i]['val']), len = keys.length;
//           var keysFloat = [];
//
//           for (var k = 0; k < len; k++) {
//             // keysFloat.push(parseFloat(keys[k]));
//
//             // labelsWithFloat[keys[k]] = parseFloat(keys[k]);
//             labelsWithFloat[parseFloat(keys[k])] = keys[k];
//
//             // labelsWithFloat.push({
//             //   float:keys[k],
//             //   string:parseFloat(keys[k])
//             // });
//           }
//
//
//           var floatKeys = Object.keys(labelsWithFloat), len2 = floatKeys.length;
//           floatKeys.sort(function (a, b) {
//             return a - b;
//           });
//
//           for (var k = 0; k < len2; k++) {
//
//             var objKey = floatKeys[k];
//             console.log("OBJKEY:" + objKey + "TYPE: " + typeof(objKey))
//             console.log(reversedResponse[i]['val'][labelsWithFloat[objKey]])
//
//
//             // var objKeyStr = keys[k];
//             labels.push(objKey);
//             values.push(reversedResponse[i]['val'][labelsWithFloat[objKey]]);
//
//           }
//
//
//           // labelsWithFloat.float.sort(function(a,b) { return a - b;});
//           // keys.sort();
//           //
//           // for (var k = 0; k < len; k++) {
//           //   var objKey = keysFloat[k];
//           //   console.log(objKey)
//           //   // var objKeyStr = keys[k];
//           //   labels.push(objKey);
//           //   values.push(reversedResponse[i]['val'][objKey.toString()]);
//           // }
//
//
//           // angular.forEach(reversedResponse[i]['val'], function (value, key) {
//           //
//           //   labels.push(key);
//           //   values.push(value);
//           //
//           //
//           // });
//
//
//           var time = UnixTimeConverterService.getTime(reversedResponse[i]['ts']);
//           var date = UnixTimeConverterService.getDate(reversedResponse[i]['ts']);
//
//
//           // $scope.options = {
//           //   title: {
//           //     display: true,
//           //     // text: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3] + ", " + date[0] + " " + date[1] + " " + date[2]
//           //   },
//           //   scales: {
//           //     yAxes: [
//           //       {
//           //         display: true,
//           //         position: 'left',
//           //         scaleLabel:{
//           //           labelString: "Number of Packets",
//           //           display: true
//           //         }
//           //       }
//           //     ],
//           //     xAxes: [
//           //       {
//           //         display: true,
//           //         position: 'bottom',
//           //         scaleLabel:{
//           //           labelString: "Time in milliseconds",
//           //           display: true
//           //         }
//           //       }
//           //     ]
//           //   }
//           // };
//           //
//
//
//           $scope.individualLatencyResults.push({
//             ts: reversedResponse[i]['ts'],
//             time: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3],
//             date: date[0] + " " + date[1] + " " + date[2],
//             label: labels,
//             data: values,
//             options: {
//               title: {
//                 display: true,
//                 text: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3] + ", " + date[0] + " " + date[1] + " " + date[2]
//               },
//               scales: {
//                 yAxes: [
//                   {
//                     display: true,
//                     position: 'left',
//                     scaleLabel: {
//                       labelString: "Number of Packets",
//                       display: true
//                     }
//                   }
//                 ],
//                 xAxes: [
//                   {
//                     display: true,
//                     position: 'bottom',
//                     scaleLabel: {
//                       labelString: "Time in milliseconds",
//                       display: true
//                     }
//                   }
//                 ]
//               }
//             }
//
//             // type: response.data['event-types'][j]['summaries'][k]['summary-type'],
//             // uri: response.data['event-types'][j]['summaries'][k]['uri'],
//             //
//             // window: response.data['event-types'][j]['summaries'][k]['summary-window'],
//             // url: response.data['url'],
//             // event_type: response.data['event-types'][j]['event-type']
//
//           });
//
//
//           // $scope.IndividualLatencyResultIndex = 0;
//
//         }
//       }
//       else if (summary_type == "statistics") {
//         $scope.resultTypeAggregation = false;
//         $scope.individualLatencyResults = [];
//         // var reversedResponse = response.data.reverse();
//         var reversedResponse = response.data;
//
//         for (var i = 0; i < reversedResponse.length; i++) {
//
//
//           // reversedResponse[i]['val'].s
//
//
//           $log.debug(labels);
//           $log.debug(values);
//
//           var time = UnixTimeConverterService.getTime(reversedResponse[i]['ts']);
//           var date = UnixTimeConverterService.getDate(reversedResponse[i]['ts']);
//
//
//           $scope.individualLatencyResults.push({
//             time: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3],
//             date: date[0] + " " + date[1] + " " + date[2],
//             stddev: reversedResponse[i]['val']['standard-deviation'],
//             median: reversedResponse[i]['val']['median'],
//             maximum: reversedResponse[i]['val']['maximum'],
//             minimum: reversedResponse[i]['val']['minimum'],
//             percentile75: reversedResponse[i]['val']['percentile-75'],
//             percentile95: reversedResponse[i]['val']['percentile-95'],
//             percentile25: reversedResponse[i]['val']['percentile-25'],
//             variance: reversedResponse[i]['val']['variance'],
//             mean: reversedResponse[i]['val']['mean']
//
//           });
//
//
//           // $scope.IndividualLatencyResultIndex = 0;
//
//         }
//
//         $scope.individualLatencyResults.reverse();
//
//         $scope.val.label
//       }
//
//
//     }).catch(function (error) {
//       $log.debug("LatencyInformationCtrl:loadLatencySummaryChart ERROR")
//       $log.error(error);
//       $log.debug("Server Response: " + error.status);
//
//     });
//
//
//     $scope.loadIndividualLatencyChart = function (key) {
//
//       $scope.IndividualLatencyResultIndex = key;
//
//     };
//
//
//     // $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
//     // $scope.series = ['Series A', 'Series B'];
//     //
//     // $scope.data = [
//     //   [65, 59, 80, 81, 56, 55, 40],
//     //   [28, 48, 40, 19, 86, 27, 90]
//     // ];
//   }
//
//
// }]);
//
//
// angular.module('traceroute').controller('LatencyGraphPanelCtrl', ['$scope', '$log', '$cacheFactory', 'LatencyGraphService', 'Latency_To_Traceroute_GraphService', function ($scope, $log, $cacheFactory, LatencyGraphService, Latency_To_Traceroute_GraphService) {
//
//   $scope.mainGraph_layoutBreathFirst = function () {
//
//     var options = {
//       name: 'breadthfirst',
//
//       fit: true, // whether to fit the viewport to the graph
//       directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
//       padding: 30, // padding on fit
//       circle: false, // put depths in concentric circles if true, put depths top down if false
//       spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
//       boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
//       avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
//       roots: undefined, // the roots of the trees
//       maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
//       animate: false, // whether to transition the node positions
//       animationDuration: 500, // duration of animation in ms if enabled
//       animationEasing: undefined, // easing of animation if enabled
//       ready: undefined, // callback on layoutready
//       stop: undefined // callback on layoutstop
//     };
//
//     LatencyGraphService.getGraph().layout(options);
//   }
//
//   $scope.mainGraph_layoutdisplayConcentric = function () {
//
//     var options = {
//       name: 'concentric',
//
//       fit: true, // whether to fit the viewport to the graph
//       padding: 30, // the padding on fit
//       startAngle: 3 / 2 * Math.PI, // where nodes start in radians
//       sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
//       clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
//       equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
//       minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
//       boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
//       avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
//       height: undefined, // height of layout area (overrides container height)
//       width: undefined, // width of layout area (overrides container width)
//       concentric: function (node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
//         return node.degree();
//       },
//       levelWidth: function (nodes) { // the variation of concentric values in each level
//         return nodes.maxDegree() / 4;
//       },
//       animate: false, // whether to transition the node positions
//       animationDuration: 500, // duration of animation in ms if enabled
//       animationEasing: undefined, // easing of animation if enabled
//       ready: undefined, // callback on layoutready
//       stop: undefined // callback on layoutstop
//     };
//
//     LatencyGraphService.getGraph().layout(options);
//
//   }
//
//   $scope.mainGraph_layoutGrid = function () {
//     var options = {
//       name: 'grid',
//
//       fit: true, // whether to fit the viewport to the graph
//       padding: 30, // padding used on fit
//       boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
//       avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
//       avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
//       condense: false, // uses all available space on false, uses minimal space on true
//       rows: undefined, // force num of rows in the grid
//       cols: undefined, // force num of columns in the grid
//       position: function (node) {
//       }, // returns { row, col } for element
//       sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
//       animate: false, // whether to transition the node positions
//       animationDuration: 500, // duration of animation in ms if enabled
//       animationEasing: undefined, // easing of animation if enabled
//       ready: undefined, // callback on layoutready
//       stop: undefined // callback on layoutstop
//     };
//
//     LatencyGraphService.getGraph().layout(options);
//
//   }
//
//   $scope.mainGraph_layoutCose = function () {
//
//     var options = {
//       name: 'cose',
//
//       // Called on `layoutready`
//       ready: function () {
//       },
//
//       // Called on `layoutstop`
//       stop: function () {
//       },
//
//       // Whether to animate while running the layout
//       animate: true,
//
//       // The layout animates only after this many milliseconds
//       // (prevents flashing on fast runs)
//       animationThreshold: 250,
//
//       // Number of iterations between consecutive screen positions update
//       // (0 -> only updated on the end)
//       refresh: 20,
//
//       // Whether to fit the network view after when done
//       fit: true,
//
//       // Padding on fit
//       padding: 30,
//
//       // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
//       boundingBox: undefined,
//
//       // Extra spacing between components in non-compound graphs
//       componentSpacing: 100,
//
//       // Node repulsion (non overlapping) multiplier
//       nodeRepulsion: function (node) {
//         return 400000;
//       },
//
//       // Node repulsion (overlapping) multiplier
//       nodeOverlap: 10,
//
//       // Ideal edge (non nested) length
//       idealEdgeLength: function (edge) {
//         return 10;
//       },
//
//       // Divisor to compute edge forces
//       edgeElasticity: function (edge) {
//         return 100;
//       },
//
//       // Nesting factor (multiplier) to compute ideal edge length for nested edges
//       nestingFactor: 5,
//
//       // Gravity force (constant)
//       gravity: 80,
//
//       // Maximum number of iterations to perform
//       numIter: 1000,
//
//       // Initial temperature (maximum node displacement)
//       initialTemp: 200,
//
//       // Cooling factor (how the temperature is reduced between consecutive iterations
//       coolingFactor: 0.95,
//
//       // Lower temperature threshold (below this point the layout will end)
//       minTemp: 1.0,
//
//       // Whether to use threading to speed up the layout
//       useMultitasking: true
//     };
//
//     LatencyGraphService.getGraph().layout(options);
//
//   }
//
//   $scope.mainGraph_layoutCircle = function () {
//
//     var options = {
//       name: 'circle',
//
//       fit: true, // whether to fit the viewport to the graph
//       padding: 30, // the padding on fit
//       boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
//       avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
//       radius: undefined, // the radius of the circle
//       startAngle: 3 / 2 * Math.PI, // where nodes start in radians
//       sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
//       clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
//       sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
//       animate: false, // whether to transition the node positions
//       animationDuration: 500, // duration of animation in ms if enabled
//       animationEasing: undefined, // easing of animation if enabled
//       ready: undefined, // callback on layoutready
//       stop: undefined // callback on layoutstop
//     };
//
//     LatencyGraphService.getGraph().layout(options);
//
//   }
//
//   $scope.mainGraph_Centred = function () {
//     LatencyGraphService.getGraph().centre();
//     LatencyGraphService.getGraph().fit();
//     // LatencyGraphService.getGraph().zoomingEnabled(true);
//   }
//
//   $scope.mainGraphSearchNode = function (IPAddr) {
//
//     // $log.debug("Node Search: " + IPAddr);
//
//     LatencyGraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');
//
//   }
//
//   $scope.mainGraphSearchNodeKeypress = function () {
//     if (keyEvent.which === 13) {
//       // $log.debug("Node Search: " + IPAddr);
//       LatencyGraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');
//     }
//   }
//
//   $scope.tracerouteGraphCentred = function () {
//     window.dispatchEvent(new Event('resize'));
//     Latency_To_Traceroute_GraphService.getGraph().centre();
//     Latency_To_Traceroute_GraphService.getGraph().fit();
//
//   }
//
//
// }]);
//

angular.module('traceroute').controller('IndividualLatencyGraphCtrl', ['$scope', '$http', '$q', '$log', 'HostService', 'LatencyGraphService', 'UnixTimeConverterService', function ($scope, $http, $q, $log, HostService, LatencyGraphService, UnixTimeConverterService) {


}]);


// Empty Module
angular.module('traceroute').controller('LatencyInformation', ['$scope', '$http', '$q', '$log', 'HostService', 'LatencyGraphService', 'UnixTimeConverterService', function ($scope, $http, $q, $log, HostService, LatencyGraphService, UnixTimeConverterService) {


  $scope.showMe = function () {
    $scope.show = true;
  }


}]);
