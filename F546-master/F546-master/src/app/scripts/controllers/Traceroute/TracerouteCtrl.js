/**
 * Created by Nazri on 4/8/16.
 */

/*
 This traceroute path shows duplicated paths.
 This Controller is used to load the Main traceroute path on traceroute.html
 */
angular.module('traceroute').controller('TracerouteGraphCtrl', ['$scope', '$http', '$q', '$log', '$interval', 'toastr', 'HostService', 'TracerouteGraphService', 'UnixTimeConverterService', 'GeoIPNekudoService', 'UniqueArrayService', 'TracerouteResultsService', 'AnalyzeTracerouteRtt', 'CurrentTimeUnixService', 'DNSLookup', function ($scope, $http, $q, $log, $interval, toastr, HostService, TracerouteGraphService, UnixTimeConverterService, GeoIPNekudoService, UniqueArrayService, TracerouteResultsService, AnalyzeTracerouteRtt, CurrentTimeUnixService, DNSLookup) {

  //Call once to load it.
  loadTRGraph();

  // Set up interval to auto load every 30 minutes
  //1800000 == 30 minutes
  $interval(function () {

    //Call this again every 30 minutes
    loadTRGraph()

  }, 30 * 60 * 1000);


  function loadTRGraph() {

    TracerouteGraphService.getGraph().remove('node');
    TracerouteGraphService.getGraph().remove('edge');

    var sourceAndDestinationList;
    var nodeList;

    TracerouteResultsService.getMainResult(
      {
        'format': 'json',
        'event-type': 'packet-trace',
        // 'limit': 10,
        // 'time-end': (Math.floor(Date.now() / 1000)),
        'time-range': 86400
        // 48 Hours = 172800
        // 24 hours = 86400
        // 7 days = 604800
      }
    ).then(function (response) {

      sourceAndDestinationList = [];
      nodeList = [];
      var promises = [];

      for (var i = 0; i < response.data.length; i++) {

        sourceAndDestinationList.push(
          {
            source: response.data[i]['source'],
            destination: response.data[i]['destination'],
            metadataKey: response.data[i]['metadata-key']
          }
        );

        //Adding main nodes into graph
        if (TracerouteGraphService.getGraph().elements('node[id = "' + response.data[i]['source'] + '"]').size() == 0) {
          // True as this is a SOURCE node.
          TracerouteGraphService.add_node(response.data[i]['source'], true);
          nodeList.push(response.data[i]['source']);
        }

        for (var j = 0; j < response.data[i]['event-types'].length; j++) {
          if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {

            promises.push(TracerouteResultsService.getIndividualResult(response.data[i]['url'],
              {
                'format': 'json',
                // 'limit': '1',
                // 'time-range': 604800
                // 48 Hours = 172800
                // 24 hours = 86400
                // 1 hour = 3600
                'time-start': response.data[i]['event-types'][j]['time-updated'] - 900
              }
            ));

          }
        }

      }

      // $log.debug("sourceAndDestinationList Size: " + sourceAndDestinationList.length)
      return $q.all(promises);

    }).then(function (response) {

      for (var i = 0; i < response.length; i++) {

        var reversedResponse = response[i].data.reverse();

        var startNode = sourceAndDestinationList[i].source;
        var destinationNode = sourceAndDestinationList[i].destination;
        var metadataKey = sourceAndDestinationList[i].metadataKey;
        var errorInTraceroute = null;


        for (var j = 0; j < reversedResponse.length; j++) {


          // $log.debug("reversedResponse Length: " + reversedResponse.length)
          // $log.debug("ts : " + reversedResponse[j]['ts'])

          // IP keeps appending and adding inside, without checking if it's unique. Unique at per iteration.
          var tempResultList = [];

          for (var k = 0; k < reversedResponse[j]['val'].length; k++) {

            if (reversedResponse[j]['val'][k]['success'] == 1) {

              if (reversedResponse[j]['val'][k]['query'] == 1) {

                tempResultList.push({
                  ip: reversedResponse[j]['val'][k]['ip'],
                  rtt: reversedResponse[j]['val'][k]['rtt']
                })

              }
            } else {
              errorInTraceroute = true;
            }

          }

          // Adding Nodes/ CHECK FOR ERROR too.
          for (var m = 0; m < tempResultList.length; m++) {

            if (TracerouteGraphService.getGraph().elements('node[id = "' + tempResultList[m].ip + '"]').size() == 0) {

              TracerouteGraphService.add_node(tempResultList[m].ip, false);
              nodeList.push(tempResultList[m].ip);
              // Event
              // TracerouteGraphService.getGraph().on('tap', 'node[id = "' + tempResultList[m].ip + '"]', function (event) {
              //
              //
              // })
            }

          }

          // Adding edges, highlight error in traceroute if needed
          for (var m = 0; m < tempResultList.length; m++) {
            if (m != (tempResultList.length - 1 )) {

              // var edgeID = temp_ip[m] + "to" + temp_ip[m + 1];
              var edgeID = Math.random();

              if (TracerouteGraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {
                //ID, source, target, tracerouteError, tracerouteRTT, timeUpdated, startNode, endNode, metadataKey
                TracerouteGraphService.add_edge(edgeID, tempResultList[m].ip, tempResultList[m + 1].ip, false, tempResultList[m].rtt, reversedResponse[j]['ts'], startNode, destinationNode, metadataKey);

                // TracerouteGraphService.getGraph().on('tap', 'edge[id = "' + edgeID + '"]', function (event) {
                //   var element = event.cyTarget;
                //   //ID: element.id()
                //   //metadataKey: element.data().metadataKey
                //
                //
                //   // search for ALL edges with same metadata, make it red, make everything else the same.
                //
                //
                //   // TracerouteGraphService.getGraph().style()
                //   //   .selector('edge[tracerouteError = "true"]')
                //   //   .style({
                //   //     'line-color': 'IndianRed',
                //   //     'width': 2
                //   //   }).update();
                //   //
                //   // TracerouteGraphService.getGraph().style()
                //   //   .selector('edge[tracerouteError = "false"]')
                //   //   .style({
                //   //     'line-color': '#a8ea00',
                //   //     'width': 2
                //   //   }).update();
                //   //
                //   // if (element.data().tracerouteError == "true") {
                //   //   //Make this Dark Red
                //   //   TracerouteGraphService.getGraph().style()
                //   //     .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
                //   //     .style({
                //   //       'line-color': 'DarkRed',
                //   //       'width': 4
                //   //     }).update();
                //   // }
                //
                //   // if (element.data().tracerouteError == "false") {
                //   //   TracerouteGraphService.getGraph().style()
                //   //     .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
                //   //     .style({
                //   //       'line-color': 'green',
                //   //       'width': 4
                //   //     }).update();
                //   // }
                //
                //
                // });

              }
            }
          }


          // Add Edge for main node
          var edgeID = Math.random();

          if (TracerouteGraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {

            ////ID, source, target, tracerouteError, tracerouteRTT, timeUpdated, startNode, endNode, metadataKey
            TracerouteGraphService.add_edge(edgeID, startNode, reversedResponse[j]['val'][0]['ip'], false, null, reversedResponse[j]['ts'], startNode, destinationNode, metadataKey);

            // TracerouteGraphService.getGraph().on('tap', 'edge[id = "' + edgeID + '"]', function (event) {
            //   var element = event.cyTarget;
            //   // $log.debug("Element METADATA: " + element.data().metadataKey)
            //
            // });
          }

          // Break so that we grab only the latest traceroute path
          break;
        }

      }


      var nodeToIP_promises = [];
      var tempUniqueIP = UniqueArrayService.getUnique(nodeList);
      for (var i = 0; i < tempUniqueIP.length; i++) {
        nodeToIP_promises.push(GeoIPNekudoService.getCountry(tempUniqueIP[i]));
      }

      $scope.noOfNodes = tempUniqueIP.length;

      return $q.all(nodeToIP_promises);

    }).then(function (response) {

      for (var i = 0; i < response.length; i++) {
        var node = TracerouteGraphService.getGraph().elements('[id = "' + response[i].ip + '"]');
        node.data({
          label: response[i].ip + "\n" + response[i].city + ", " + response[i].countrycode
        });

      }

      TracerouteGraphService.getGraph().layout({
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
      });


      TracerouteGraphService.getGraph().on('tap', 'edge,:selected', function (event) {
        var element = event.cyTarget;
        $log.debug("Element METADATA: " + element.data().metadataKey)
        console.log("STATUS: " + element.data().tracerouteError)

        window.dispatchEvent(new Event('resize'));

        $scope.$apply(function (response) {

          var time = UnixTimeConverterService.getTime(element.data().time);
          var date = UnixTimeConverterService.getDate(element.data().time);

          var errorStatus = null;

          if (element.data().tracerouteError == "true") {
            errorStatus = true;
          } else if (element.data().tracerouteError == "false") {
            errorStatus = false;
          }

          $scope.selectedPath = {
            metadata: element.data().metadataKey,
            source: element.data().startNode,
            destination: element.data().endNode,
            errorStatus: errorStatus,
            time: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3],
            date: date[1] + " " + date[0] + " " + date[2],
            sourceDNS: DNSLookup.getDomain(element.data().startNode)['dns'],
            destinationDNS: DNSLookup.getDomain(element.data().endNode)['dns']
          }

        });


        TracerouteGraphService.getGraph().style()
          .selector('edge[tracerouteError = "true"]')
          .style({
            'line-color': 'IndianRed',
            'width': 2
          }).update();

        TracerouteGraphService.getGraph().style()
          .selector('edge[tracerouteError = "false"]')
          .style({
            'line-color': '#a8ea00',
            'width': 2
          }).update();


        if (element.data().tracerouteError == "true") {
          //Make this Dark Red
          TracerouteGraphService.getGraph().style()
            .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
            .style({
              'line-color': 'DarkRed',
              'width': 4
            }).update();
        } else if (element.data().tracerouteError == "false") {
          TracerouteGraphService.getGraph().style()
            .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
            .style({
              'line-color': 'green',
              'width': 4
            }).update();
        }

      });


    }).catch(function (error) {
      $log.debug("TracerouteGraphCtrl");
      $log.error(error);
      $log.debug("Server Response: " + error.status);

      if (error.status == 500) {
        //500 on server.
        toastr.error('Unable to reach host. Server Status Code: 500');
      } else {
        toastr.error('Unable to reach host. Status Code: ' + error.status);
      }

    });


    // This will load the erroneous RTT after the graph has loaded with initial nodes/edges

    TracerouteGraphService.getGraph().one('layoutstop', function () {
      // Other possible options: layoutstart, layoutready, layoutstop, ready
      var sourceAndDestinationList;
      var nodeList;
      var tracerouteResults = [];
      var minDate = 0;
      var maxDate = 0;

      TracerouteResultsService.getMainResult(
        {
          'format': 'json',
          'event-type': 'packet-trace',
          // 'limit': 15,
          'time-range': 604800
          // 48 Hours = 172800
          // 24 hours = 86400
          // 7 days = 604800
        }
      ).then(function (response) {

        sourceAndDestinationList = [];
        nodeList = [];
        var promises = [];

        for (var i = 0; i < response.data.length; i++) {

          sourceAndDestinationList.push(
            {
              source: response.data[i]['source'],
              destination: response.data[i]['destination'],
              metadataKey: response.data[i]['metadata-key']
            }
          );

          nodeList.push(response.data[i]['source']);
          nodeList.push(response.data[i]['destination']);

          for (var j = 0; j < response.data[i]['event-types'].length; j++) {
            if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {

              promises.push(TracerouteResultsService.getIndividualResult(response.data[i]['url'],
                {
                  'format': 'json',
                  // 'limit': '2',
                  // 'time-end': (Math.floor(Date.now() / 1000)),
                  'time-range': 604800
                  // 48 Hours = 172800
                  // 24 hours = 86400
                  //7 days = 604800
                }
              ));

            }
          }

        }


        $scope.noOfSourceNodes = UniqueArrayService.getUnique(nodeList).length;
        // $log.debug("sourceAndDestinationList Size: " + sourceAndDestinationList.length)
        // console.log("PULLED AGAIN")

        return $q.all(promises);

      }).then(function (response) {

        for (var i = 0; i < response.length; i++) {

          //Array is an object reference
          var reversedResponse = response[i].data.reverse()

          var startNode = sourceAndDestinationList[i].source;
          var destinationNode = sourceAndDestinationList[i].destination;
          var metadataKey = sourceAndDestinationList[i].metadataKey;
          var aggregatedResults;

          // SOURCE
          // Array of results of the same source/destination.
          // Checking for 'active' servers

          if (reversedResponse.length > 1) {
            var tempResults = AnalyzeTracerouteRtt.getAnalysis(reversedResponse);
            aggregatedResults = tempResults[0];
            minDate = tempResults[1];
            maxDate = tempResults[2];

            tracerouteResults.push({
              source: startNode,
              sourceCity: null,
              sourceCountry: null,
              destination: destinationNode,
              destinationCity: null,
              destinationCountry: null,
              nodes: aggregatedResults,
              metadata: metadataKey,
              anomaliesExist: false
            });


          } else {
            // only 1 result available.
            // No analysis is done.
          }


        }

        var minDateToDisplay = UnixTimeConverterService.getDate(minDate)
        var maxDateToDisplay = UnixTimeConverterService.getDate(maxDate)

        $scope.minDate = minDateToDisplay[1] + " " + minDateToDisplay[0] + " " + minDateToDisplay[2];
        $scope.maxDate = maxDateToDisplay[1] + " " + maxDateToDisplay[0] + " " + maxDateToDisplay[2];

        var uniqueIP = UniqueArrayService.getUnique(nodeList);
        var nodeToIP_promises = [];
        for (var i = 0; i < uniqueIP.length; i++) {
          nodeToIP_promises.push(GeoIPNekudoService.getCountry(uniqueIP[i]));
        }

        return $q.all(nodeToIP_promises);

      }).then(function (response) {

        for (var i = 0; i < response.length; i++) {

          for (var j = 0; j < tracerouteResults.length; j++) {

            if (tracerouteResults[j].source == response[i].ip) {
              tracerouteResults[j].sourceCity = response[i].city;
              tracerouteResults[j].sourceCountry = response[i].countrycode;
            }

            if (tracerouteResults[j].destination == response[i].ip) {
              tracerouteResults[j].destinationCity = response[i].city;
              tracerouteResults[j].destinationCountry = response[i].countrycode;
            }
          }
        }


        var noOfAnomalies = 0;
        $scope.anomalyResults = [];

        for (var i = 0; i < tracerouteResults.length; i++) {
          var anomaliesExist = false;

          for (var j = 0; j < tracerouteResults[i].nodes.length; j++) {

            // console.log(tracerouteResults[i].nodes[j].ip)

            // var tempPromise = DNSLookup.getDomain_Promise(tracerouteResults[i].nodes[j].ip);
            // if (tempPromise instanceof Promise) {
            //   tempPromise.then(function (response) {
            //     console.log("INCOMING")
            //     console.log(response)
            //   });
            // } else {
            //   console.log("NON PROMISE INCOMING")
            //   console.log(tempPromise['dns'])
            //   tracerouteResults[i].nodes[j].dns = tempPromise['dns']
            // }

            if (tracerouteResults[i].nodes[j].status == true) {
              noOfAnomalies++;
              anomaliesExist = true;

            }
          }


          if (anomaliesExist == true) {

            tracerouteResults[i].anomaliesExist = true;
            $scope.anomalyResults.push(tracerouteResults[i]);


            TracerouteGraphService.getGraph().style().selector('edge[metadataKey = "' + tracerouteResults[i].metadata + '"]').style({
              'line-color': 'IndianRed',
              'width': 2
            }).update();

            var edges = TracerouteGraphService.getGraph().edges('[metadataKey = "' + tracerouteResults[i].metadata + '"]');
            // console.log("edges SIZE: " + edges.size())
            for (var k = 0; k < edges.size(); k++) {

              // Need to check whether bw is double or string
              edges[k].data({
                tracerouteError: "true"
              });
            }

          }
        }

        $scope.noOfAnomalies = noOfAnomalies;
        $scope.tracerouteResults = tracerouteResults;

        var tempTime = CurrentTimeUnixService.time()
        $scope.lastUpdated = tempTime[0] + ":" + tempTime[1] + ":" + tempTime[2] + " " + tempTime[3];

      }).catch(function (error) {
        $log.debug("TracerouteTableCtrl: Error")
        $log.error(error)
        $log.debug("Server Response: " + error.status);

        if (error.status == 500) {
          //500 on server.
          toastr.error('Unable to reach host. Server Status Code: 500');
        } else {
          toastr.error('Unable to reach host. Status Code: ' + error.status);
        }


      });
    });


  }

}]);


// angular.module('traceroute').controller('TracerouteTableCtrl', ['$scope', '$http', '$q', '$log', '$interval', 'HostService', 'TracerouteGraphService', 'UnixTimeConverterService', 'GeoIPNekudoService', 'AnalyzeTracerouteRtt', 'UniqueArrayService', 'TracerouteResultsService', 'CurrentTimeUnixService', function ($scope, $http, $q, $log, $interval, HostService, TracerouteGraphService, UnixTimeConverterService, GeoIPNekudoService, AnalyzeTracerouteRtt, UniqueArrayService, TracerouteResultsService, CurrentTimeUnixService) {
//
//   loadErroneousRtt()
//   //1800000
//
//   // $interval(function () {
//   //
//   //   loadErroneousRtt()
//   //   $scope.lastRefreshed = CurrentTimeUnixService.time();
//   //
//   // }, 1000);
//
//
//   function loadErroneousRtt() {
//
//
//   }
// }]);


angular.module('traceroute').controller('TracerouteGraphPanelCtrl', ['$scope', '$log', '$cacheFactory', '$uibModal', '$q', 'TracerouteGraphService', 'DNSLookup', function ($scope, $log, $cacheFactory, $uibModal, $q, TracerouteGraphService, DNSLookup) {

  $scope.mainGraphLayout_BreathFirst = function () {

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

    TracerouteGraphService.getGraph().layout(options);
  }

  $scope.mainGraphLayout_Concentric = function () {

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

    TracerouteGraphService.getGraph().layout(options);

  }

  $scope.mainGraphLayout_Grid = function () {
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

    TracerouteGraphService.getGraph().layout(options);

  }

  $scope.mainGraphLayout_Cose = function () {

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

    TracerouteGraphService.getGraph().layout(options);

  }

  $scope.mainGraphLayout_Circle = function () {

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

    TracerouteGraphService.getGraph().layout(options);

  }

  $scope.mainGraphLayout_Centred = function () {
    TracerouteGraphService.getGraph().centre();
    TracerouteGraphService.getGraph().fit();
    // TracerouteGraphService.getGraph().zoomingEnabled(true);
  }


  $scope.mainGraphSearchNodeClick = function (IPAddr) {

    $log.debug("Node Search: " + IPAddr);
    TracerouteGraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');

  }

  $scope.mainGraphSearchNodeKeypress = function (keyEvent, IPAddr) {

    if (keyEvent.which === 13) {
      $log.debug("Node Search: " + IPAddr);
      TracerouteGraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');
    }


  }

  //The following is for ng-click to show past history RTT

  $scope.historyRTT_modalDialog = function (metadata, ipaddr) {
    // console.log(metadata)

    $scope.individualRTT_metadata = metadata;
    $scope.individualRTT_IP = ipaddr;


    var modalInstance = $uibModal.open({
      animation: true,
      // ariaLabelledBy: 'modal-title',
      // ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'Modal_IndividualRTT_HistoryCtrl',
      // size: 'lg',
      windowClass: 'app-modal-window',
      resolve: {
        metadata: function () {

          return metadata;
        },
        ipaddr: function () {
          return ipaddr;
        }
      }
    });

    // modalInstance.result.then(function (selectedItem) {
    //   $scope.selected = selectedItem;
    // }, function () {
    //   $log.info('Modal dismissed at: ' + new Date());
    // });
    //
  };


  //The following is a mouseover to getDNS

  $scope.getDNS = function (ipaddr) {
    $scope.dnsName = DNSLookup.getDomain(ipaddr)["dns"];

  }


}]);

angular.module('traceroute').controller('Modal_IndividualRTT_HistoryCtrl', ['$scope', '$log', '$q', '$uibModalInstance', 'TracerouteResultsService', 'metadata', 'ipaddr', 'UnixTimeConverterService', function ($scope, $log, $q, $uibModalInstance, TracerouteResultsService, metadata, ipaddr, UnixTimeConverterService) {
  // $scope.individualRTT_IP = [];
  // $scope.individualRTT_metadata = [];
  // console.log(metadata);
  // var metadata = "0a468985ca8b41029a22ae4e4645f869";
  // var ipaddr = "203.181.248.138";


  // $scope.gotThroughmeh = "YES"

  TracerouteResultsService.getMainResult(
    {
      'format': 'json',
      'event-type': 'packet-trace',
      'time-range': 86400
    }
  ).then(function (response) {

    var promises = [];

    for (var i = 0; i < response.data.length; i++) {
      for (var j = 0; j < response.data[i]['event-types'].length; j++) {
        if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {

          if (response.data[i]['metadata-key'] == metadata) {
            promises.push(TracerouteResultsService.getIndividualResult(response.data[i]['url'],
              {
                'format': 'json',
                'time-range': 86400
                //86400
                //604800

              }
            ));
          }

        }
      }

    }

    return $q.all(promises);

  }).then(function (response) {

    for (var i = 0; i < response.length; i++) {
      $scope.individualRTT_data = [];
      $scope.individualRTT_labels = []

      $scope.individualRTT_option = {
        title: {
          display: true,
          text: "24 Hours View"
        },
        scales: {
          yAxes: [
            {
              display: true,
              position: 'left',
              scaleLabel: {
                labelString: "Round Trip Time",
                display: true
              }
            }
          ],
          xAxes: [
            {
              display: true,
              position: 'bottom',
              scaleLabel: {
                labelString: "Date/Time",
                display: false
              }
            }
          ]
        }
      }

      var reversedResponse = response[i].data;

      for (var j = 0; j < reversedResponse.length; j++) {

        for (var k = 0; k < reversedResponse[j]['val'].length; k++) {

          if (reversedResponse[j]['val'][k]['ip'] == ipaddr) {

            $scope.individualRTT_data.push(reversedResponse[j]['val'][k]['rtt']);
            // $scope.individualRTT_data.push(math.round(reversedResponse[j]['val'][k]['rtt'], 0));
            var time = UnixTimeConverterService.getTime(reversedResponse[j]['ts']);
            var date = UnixTimeConverterService.getDate(reversedResponse[j]['ts']);
            $scope.individualRTT_labels.push(date[1] + " " + date[0] + " " + date[2] + " " + time[0] + ":" + time[1] + ":" + time[2] + " " + time[3]);
          }

        }

      }

    }

  }).catch(function (error) {
    $log.error(error);
    $log.debug("Server Response: " + error.status);

    if (error.status == 500) {
      //500 on server.
      toastr.error('Unable to reach host. Server Status Code: 500');
    } else {
      toastr.error('Unable to reach host. Status Code: ' + error.status);
    }

  });

  $scope.ok = function () {
    // alert("OKAY")
    $uibModalInstance.close(1);
  };

  // $scope.cancel = function () {
  //   // $uibModalInstance.dismiss('cancel');
  // };

}
])
;


/*


 The following controllers are for Traceroute Path Analysis.


 */


angular.module('traceroute').controller('TraceroutePathGraphCtrl', ['$scope', '$log', '$interval', 'TraceroutePath_GraphService', 'UnixTimeConverterService', 'TraceroutePath_PopulateGraphService', 'CurrentTimeUnixService', 'DNSLookup', function ($scope, $log, $interval, TraceroutePath_GraphService, UnixTimeConverterService, TraceroutePath_PopulateGraphService, CurrentTimeUnixService, DNSLookup) {
  // Benefits of populating graph into service
  // Able to call and reload as needed without refreshing the page.

  // $scope.noOfNodes = tempUniqueIP.length;


  loadTraceroutepath();

  // Set up interval to auto load every 30 minutes
  $interval(function () {

    //Call this again every 30 minutes
    loadTraceroutepath()

  }, 30 * 60 * 1000);

  function loadTraceroutepath() {

    TraceroutePath_PopulateGraphService.loadGraph_TracerouteOverview().then(function (response) {
      //Returns number of nodes.
      $scope.noOfPaths = response[0];
      $scope.noOfNodes = response[1];
    })

    // When the MAIN Traceroute Path graph is ready and loaded, analysis is conducted.
    TraceroutePath_GraphService.getGraph().one('layoutstop', function () {

      //This service gets result, conduct analysis and update the graph.
      TraceroutePath_PopulateGraphService.loadErroneousTraceroutePath().then(function (response) {

        $scope.noOfAnomalies = response[0];
        var minDate = UnixTimeConverterService.getDate(response[1])
        var maxDate = UnixTimeConverterService.getDate(response[2])
        $scope.minDate = minDate[1] + " " + minDate[0] + " " + minDate[2];
        $scope.maxDate = maxDate[1] + " " + maxDate[0] + " " + maxDate[2];

      })


      //Event
      TraceroutePath_GraphService.getGraph().on('tap', 'edge,:selected', function (event) {
        var element = event.cyTarget;
        // $log.debug("Element METADATA: " + element.data().metadataKey)
        // $log.debug("Element METADATA: " + element.data().time)
        // console.log("STATUS: " + element.data().pathAnomaly)

        // window.dispatchEvent(new Event('resize'));
        $scope.$apply(function (response) {

          var time = UnixTimeConverterService.getTime(element.data().time);
          var date = UnixTimeConverterService.getDate(element.data().time);

          var errorStatus = null;
          if (element.data().pathAnomaly == "true") {
            errorStatus = true;
          } else if (element.data().pathAnomaly == "false") {
            errorStatus = false;
          }

          $scope.selectedPath = {
            metadata: element.data().metadataKey,
            source: element.data().startNode,
            destination: element.data().endNode,
            errorStatus: errorStatus,
            time: time[0] + ":" + time[1] + ":" + time[2] + " " + time[3],
            date: date[1] + " " + date[0] + " " + date[2],
            sourceDNS: DNSLookup.getDomain(element.data().startNode)['dns'],
            destinationDNS: DNSLookup.getDomain(element.data().endNode)['dns']
          }

          $scope.$broadcast('LoadIndividualTraceroute', element.data().metadataKey);


        });


        TraceroutePath_GraphService.getGraph().style()
          .selector('edge[pathAnomaly = "true"]')
          .style({
            'line-color': 'IndianRed',
            'width': 2
          }).update();

        TraceroutePath_GraphService.getGraph().style()
          .selector('edge[pathAnomaly = "false"]')
          .style({
            'line-color': '#a8ea00',
            'width': 2
          }).update();


        if (element.data().pathAnomaly == "true") {
          //Make this Dark Red
          TraceroutePath_GraphService.getGraph().style()
            .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
            .style({
              'line-color': 'DarkRed',
              'width': 4
            }).update();
        } else if (element.data().pathAnomaly == "false") {
          TraceroutePath_GraphService.getGraph().style()
            .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
            .style({
              'line-color': 'green',
              'width': 4
            }).update();
        }

      });

      var tempTime = CurrentTimeUnixService.time()
      $scope.lastUpdated = tempTime[0] + ":" + tempTime[1] + ":" + tempTime[2] + " " + tempTime[3];

    });
  }

}]);


angular.module('traceroute').controller('TraceroutePathGraphPanelCtrl', ['$scope', '$log', '$cacheFactory', 'TraceroutePath_GraphService', 'IndividualTraceroutePath_PopulateGraphService', 'IndividualTraceroutePath_GraphService', 'UnixTimeConverterService', function ($scope, $log, $cacheFactory, TraceroutePath_GraphService, IndividualTraceroutePath_PopulateGraphService, IndividualTraceroutePath_GraphService, UnixTimeConverterService) {

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

    TraceroutePath_GraphService.getGraph().layout(options);
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

    TraceroutePath_GraphService.getGraph().layout(options);

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

    TraceroutePath_GraphService.getGraph().layout(options);

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

    TraceroutePath_GraphService.getGraph().layout(options);

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

    TraceroutePath_GraphService.getGraph().layout(options);

  }

  $scope.mainGraph_graphCentred = function () {
    TraceroutePath_GraphService.getGraph().centre();
    TraceroutePath_GraphService.getGraph().fit();
    // TracerouteGraphService.getGraph().zoomingEnabled(true);
  }

  $scope.mainGraph_searchNodeClick = function (IPAddr) {

    // $log.debug("Node Search: " + IPAddr);
    TraceroutePath_GraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');

  }

  $scope.mainGraph_searchNodeKeypress = function (keyEvent, IPAddr) {
    if (keyEvent.which === 13) {
      // $log.debug("Node Search: " + IPAddr);
      TraceroutePath_GraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');
    }
  }

  $scope.loadHistorialTraceroutePath = function (metadataKey) {


    IndividualTraceroutePath_PopulateGraphService.getHistorialPath().then(function (response) {

      window.dispatchEvent(new Event('resize'));
      IndividualTraceroutePath_GraphService.getGraph().remove('node');
      IndividualTraceroutePath_GraphService.getGraph().remove('edge');


      // var errorPath = {
      //   source: {
      //     ip:1,
      //     city:1,
      //     country:1
      //   },
      //   destination: {
      //     ip:1,
      //     city:1,
      //     country:1
      //   },
      //   result: [
      //     {
      //       ts: 1,
      //       nodes: [
      //         {ip:1,city:1,country:1},
      //         {ip:1,city:1,country:1}
      //         ]
      //     }
      //   ],
      //   metadata: metadataKey
      // }

      for (var i = 0; i < response.length; i++) {

        if (metadataKey == response[i].metadata) {

          if (IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + response[i].source.ip + '"]').size() == 0) {
            // True as this is a SOURCE node.
            IndividualTraceroutePath_GraphService.add_node(response[i].source.ip, true);
            //Update City and Country
            IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + response[i].source.ip + '"]').data({
              label: response[i].source.ip + "\n" + response[i].source.city + ", " + response[i].source.country
            });
          }


          var pastResultsList = [];

          //Scope used for display purposes.
          //FIXME: CONSIDER REMOVING.
          var time = UnixTimeConverterService.getTime(response[i].result[0].ts);
          var date = UnixTimeConverterService.getDate(response[i].result[0].ts);
          $scope.individualPath_time = time[0] + ":" + time[1] + ":" + time[2] + " " + time[3]
          $scope.individualPath_date = date[0] + " " + date[1] + " " + date[2]
          $scope.anomalyIndex = response[i].anomalyIndex;


          //Adding Nodes
          for (var j = 0; j < response[i].result[0].nodes.length; j++) {

            var ip = response[i].result[0].nodes[j].ip

            if (IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + response[i].result[0].nodes[j].ip + '"]').size() == 0) {

              // NOT a sourceNode
              IndividualTraceroutePath_GraphService.add_node(response[i].result[0].nodes[j].ip, false);
              //
              //Update City and Country
              IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + response[i].result[0].nodes[j].ip + '"]').data({
                label: response[i].result[0].nodes[j].ip + "\n" + response[i].result[0].nodes[j].city + ", " + response[i].result[0].nodes[j].country
              });

            }
          }

          //Adding Edges
          for (var j = 0; j < response[i].result[0].nodes.length; j++) {
            if (j != (response[i].result[0].nodes.length - 1 )) {

              var edgeID = Math.random();

              if (IndividualTraceroutePath_GraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {
                IndividualTraceroutePath_GraphService.add_edge(edgeID, response[i].result[0].nodes[j].ip, response[i].result[0].nodes[j + 1].ip, true, null, null, null, null);
              }

            }
          }


          // Adding edge for main node.
          var edgeID = Math.random();
          if (IndividualTraceroutePath_GraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {
            IndividualTraceroutePath_GraphService.add_edge(edgeID, response[i].source.ip, response[i].result[0].nodes[0].ip, true, null, null, null, null);
          }


          // for (var l = 0; l < response[i].anomalyIndex.length; l++) {
          //
          //   var newNodeList = [];
          //
          //   newNodeList.push({
          //     ip: response[response[i].anomalyIndex[l]].source.ip,
          //     city: response[response[i].anomalyIndex[l]].source.city,
          //     country: response[response[i].anomalyIndex[l]].source.country
          //   })
          //
          //
          //   pastResultsList.push({
          //
          //     time: UnixTimeConverterService.getTime(response[response[i].anomalyIndex[l]].result[k].ts),
          //     date: UnixTimeConverterService.getDate(response[response[i].anomalyIndex[l]].result[k].ts),
          //     nodes: newNodeList.concat(response[i].result[response[i].anomalyIndex[l]].nodes)
          //   });
          //
          // }


          for (var k = 0; k < response[i].result.length; k++) {
            for (var l = 0; l < response[i].anomalyIndex.length; l++) {

              if (k == response[i].anomalyIndex[l]) {

                //Adding SOURCE IP into a singular ARRAY to be pushed for visualisation, for simplification purposes.
                var newNodeList = [];

                newNodeList.push({
                  ip: response[i].source.ip,
                  city: response[i].source.city,
                  country: response[i].source.country
                })


                pastResultsList.push({

                  time: UnixTimeConverterService.getTime(response[i].result[k].ts),
                  date: UnixTimeConverterService.getDate(response[i].result[k].ts),
                  nodes: newNodeList.concat(response[i].result[k].nodes)
                });

              }

            }


          }

          // This scope is used to populate the Individual Path Graph Panel.
          $scope.individualPath_PastResults = pastResultsList;
          // alert($scope.individualPastResultscurrentPage)

          // $scope.individualPastResultscurrentPage = 1;

          // $scope.$apply(function (response) {
          //   $scope.individualPastResultscurrentPage = 1;
          // })

          // $scope.individualPath_PastResultsCount = pastResultsList.length;


        } else {


          //TODO
          // NO Errorneous path found.
        }
      }


      IndividualTraceroutePath_GraphService.getGraph().layout({
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
      });


    });


  }

  $scope.$on('LoadIndividualTraceroute', function (event, metadata) {

    $scope.loadHistorialTraceroutePath(metadata);
  })

}]);


// Individual paths with anomalies
//TODO: Better Name for this controller
angular.module('traceroute').controller('IndividualTraceroutePathGraphCtrl', ['$scope', '$http', '$q', '$log', 'HostService', 'IndividualTraceroutePath_GraphService', 'UnixTimeConverterService', 'GeoIPNekudoService', 'IndividualTraceroutePath_PopulateGraphService', function ($scope, $http, $q, $log, HostService, IndividualTraceroutePath_GraphService, UnixTimeConverterService, GeoIPNekudoService, IndividualTraceroutePath_PopulateGraphService) {

  // $log.debug("IndividualTraceroutePathGraphCtrl: START");


  // IndividualTraceroutePath_PopulateGraphService.getErroneousTraceroutePath().then(function (response) {
  //
  //   $scope.errorTracerouteResults = response;
  //
  //
  //   $scope.errorTracerouteResultsLength = response.length;
  //
  // })


}]);


angular.module('traceroute').controller('IndividualTracerouteGraphPanelCtrl', ['$scope', '$rootScope', '$log', '$cacheFactory', 'IndividualTraceroutePath_GraphService', 'IndividualTraceroutePath_PopulateGraphService', 'UnixTimeConverterService', function ($scope, $rootScope, $log, $cacheFactory, IndividualTraceroutePath_GraphService, IndividualTraceroutePath_PopulateGraphService, UnixTimeConverterService) {

  $scope.individualGraph_layoutBreathFirst = function () {

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

    IndividualTraceroutePath_GraphService.getGraph().layout(options);
  }

  $scope.individualGraph_layoutdisplayConcentric = function () {

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

    IndividualTraceroutePath_GraphService.getGraph().layout(options);

  }

  $scope.individualGraph_layoutGrid = function () {
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

    IndividualTraceroutePath_GraphService.getGraph().layout(options);

  }

  $scope.individualGraph_layoutCose = function () {

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

    IndividualTraceroutePath_GraphService.getGraph().layout(options);

  }

  $scope.individualGraph_layoutCircle = function () {

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

    IndividualTraceroutePath_GraphService.getGraph().layout(options);

  }

  $scope.individualGraph_graphCentred = function () {
    IndividualTraceroutePath_GraphService.getGraph().centre();
    IndividualTraceroutePath_GraphService.getGraph().fit();
    // TracerouteGraphService.getGraph().zoomingEnabled(true);
  }

  $scope.individualGraph_searchNode = function (IPAddr) {


    $log.debug("Node Search: " + IPAddr);

    // elements('node[id = "' + response.data[i]['source'] + '"]')

    // TracerouteGraphService.getGraph().center('node[id = "' + IPAddr.trim() + '"]');
    IndividualTraceroutePath_GraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');


  }

  $scope.individualGraph_loadTraceroutePath = function (metadataKey) {

    IndividualTraceroutePath_PopulateGraphService.getErroneousTraceroutePath().then(function (response) {
      IndividualTraceroutePath_GraphService.getGraph().remove('node');
      IndividualTraceroutePath_GraphService.getGraph().remove('edge');


      // var errorPath = {
      //   source: {
      //     ip:1,
      //     city:1,
      //     country:1
      //   },
      //   destination: {
      //     ip:1,
      //     city:1,
      //     country:1
      //   },
      //   result: [
      //     {
      //       ts: 1,
      //       nodes: [
      //         {ip:1,city:1,country:1},
      //         {ip:1,city:1,country:1}
      //         ]
      //     }
      //   ],
      //   metadata: metadataKey
      // }

      for (var i = 0; i < response.length; i++) {

        if (metadataKey == response[i].metadata) {


          if (IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + response[i].source.ip + '"]').size() == 0) {

            // True as this is a SOURCE node.

            IndividualTraceroutePath_GraphService.add_node(response[i].source.ip, true);

            //Update City and Country
            IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + response[i].source.ip + '"]').data({
              label: response[i].source.ip + "\n" + response[i].source.city + ", " + response[i].source.country
            });

          }


          var pastResultsList = [];

          //Only load the first result.

          var time = UnixTimeConverterService.getTime(response[i].result[0].ts);
          var date = UnixTimeConverterService.getDate(response[i].result[0].ts);

          $scope.individualPath_time = time[0] + ":" + time[1] + ":" + time[2] + " " + time[3]
          $scope.individualPath_date = date[0] + " " + date[1] + " " + date[2]


          for (var j = 0; j < response[i].result[0].nodes.length; j++) {


            var ip = response[i].result[0].nodes[j].ip

            if (IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + response[i].result[0].nodes[j].ip + '"]').size() == 0) {

              // NOT a sourceNode
              IndividualTraceroutePath_GraphService.add_node(response[i].result[0].nodes[j].ip, false);
              //
              //Update City and Country
              IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + response[i].result[0].nodes[j].ip + '"]').data({
                label: response[i].result[0].nodes[j].ip + "\n" + response[i].result[0].nodes[j].city + ", " + response[i].result[0].nodes[j].country
              });

              // Event
              IndividualTraceroutePath_GraphService.getGraph().on('tap', 'node[id = "' + response[i].source.ip + '"]', function (event) {
                var element = event.cyTarget;
                // $log.debug("Clicked on Node ID: " + element.data().id)
              });
            }
          }

          for (var j = 0; j < response[i].result[0].nodes.length; j++) {

            if (j != (response[i].result[0].nodes.length - 1 )) {

              var edgeID = Math.random();

              if (IndividualTraceroutePath_GraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {


                IndividualTraceroutePath_GraphService.add_edge(edgeID, response[i].result[0].nodes[j].ip, response[i].result[0].nodes[j + 1].ip, true, null, null, null, null);

              }

            }
          }


          // Adding edge for main node.
          var edgeID = Math.random();
          if (IndividualTraceroutePath_GraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {


            IndividualTraceroutePath_GraphService.add_edge(edgeID, response[i].source.ip, response[i].result[0].nodes[0].ip, true, null, null, null, null);

          }
          for (var k = 0; k < response[i].result.length; k++) {

            //Adding SOURCE IP into a singular ARRAY to be pushed for visualisation, for simplification purposes.
            var newNodeList = [];

            newNodeList.push({
              ip: response[i].source.ip, city: response[i].source.city, country: response[i].source.country
            })


            pastResultsList.push({

              time: UnixTimeConverterService.getTime(response[i].result[k].ts),
              date: UnixTimeConverterService.getDate(response[i].result[k].ts),
              nodes: newNodeList.concat(response[i].result[k].nodes)
            });

          }

          $scope.individualPath_PastResults = pastResultsList;
          // $scope.individualPath_PastResultsCount = pastResultsList.length;


        }
      }

      //Style Options
      IndividualTraceroutePath_GraphService.getGraph().style()
        .selector('node[sourceNode = "true"]')
        .style({
          'background-color': 'black'
        }).update();


      var layoutOptions = {
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

      IndividualTraceroutePath_GraphService.getGraph().layout(layoutOptions);

    });


  }


  $scope.individualGraph_loadNextTraceroutePath = function (index, resultsArray) {


    $scope.individualPath_time = resultsArray[index].time[0] + ":" + resultsArray[index].time[1] + ":" + resultsArray[index].time[2] + " " + resultsArray[index].time[3]
    $scope.individualPath_date = resultsArray[index].date[0] + " " + resultsArray[index].date[1] + " " + resultsArray[index].date[2]

    IndividualTraceroutePath_GraphService.getGraph().remove('node');
    IndividualTraceroutePath_GraphService.getGraph().remove('edge');


    //       nodes: [
    //         {ip:1,city:1,country:1},
    //         {ip:1,city:1,country:1}
    //         ]


    for (var i = 0; i < resultsArray[index].nodes.length; i++) {

      // console.log(i)
      // console.log("XXXX: " + resultsArray[index].nodes.length)
      console.log(resultsArray[index].nodes[i].ip)
      var sourceNode = false;

      //Adding SOURCE/MAIN node
      if (IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + resultsArray[index].nodes[i].ip + '"]').size() == 0) {

        // True as this is a SOURCE node.

        if (i == 0) {
          sourceNode = true;
        }

        IndividualTraceroutePath_GraphService.add_node(resultsArray[index].nodes[i].ip, sourceNode);
        //
        // // //Update City and Country
        IndividualTraceroutePath_GraphService.getGraph().elements('node[id = "' + resultsArray[index].nodes[i].ip + '"]').data({
          label: resultsArray[index].nodes[i].ip + "\n" + resultsArray[index].nodes[i].city + ", " + resultsArray[index].nodes[i].country
        });


        //   .getElementById(resultsArray[index].nodes[i].ip).data({
        //   label: resultsArray[index].nodes[i].ip + "\n" + resultsArray[index].nodes[i].city + ", " + resultsArray[index].nodes[i].country
        // });

        // // Event
        IndividualTraceroutePath_GraphService.getGraph().on('tap', 'node[id = "' + resultsArray[index].nodes[i].ip + '"]', function (event) {
          var element = event.cyTarget;
          // $log.debug("Clicked on Node ID: " + element.data().id)

        });
      }

    }

    for (var m = 0; m < resultsArray[index].nodes.length; m++) {

      if (m != (resultsArray[index].nodes.length - 1 )) {

        var edgeID = Math.random();

        if (IndividualTraceroutePath_GraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {


          IndividualTraceroutePath_GraphService.add_edge(edgeID, resultsArray[index].nodes[m].ip, resultsArray[index].nodes[m + 1].ip, true, null, null, null, null);

          // TraceroutePath_GraphService.getGraph().on('tap', 'edge[id = "' + edgeID + '"]', function (event) {
          //   var element = event.cyTarget;
          //   //ID: element.id()
          //   //metadataKey: element.data().metadataKey
          //
          //   // search for ALL edges with same metadata, make it red, make everything else the same.
          //   TraceroutePath_GraphService.getGraph().style()
          //     .selector('edge[pathAnomaly = "true"]')
          //     .style({
          //       'line-color': 'IndianRed',
          //       'width': 2
          //     }).update();
          //
          //   TraceroutePath_GraphService.getGraph().style()
          //     .selector('edge[pathAnomaly = "false"]')
          //     .style({
          //       'line-color': '#a8ea00',
          //       'width': 2
          //     }).update();
          //
          //
          //   if (element.data().pathAnomaly == "true") {
          //     //Make this Dark Red
          //     TraceroutePath_GraphService.getGraph().style()
          //       .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
          //       .style({
          //         'line-color': 'DarkRed',
          //         'width': 4
          //       }).update();
          //   }
          //
          //   if (element.data().pathAnomaly == "false") {
          //     TraceroutePath_GraphService.getGraph().style()
          //       .selector('edge[metadataKey = "' + element.data().metadataKey + '"]')
          //       .style({
          //         'line-color': 'green',
          //         'width': 4
          //       }).update();
          //   }
          //
          //
          // });

        }

      }

    }


    IndividualTraceroutePath_GraphService.getGraph().layout({
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
    });

  }


}]);


//Empty Module

angular.module('traceroute').controller('XXX', ['$scope', '$http', '$q', '$log', 'HostService', 'TracerouteGraphService', 'UnixTimeConverterService', 'GeoIPNekudoService', 'AnalyzeTraceroute', function ($scope, $http, $q, $log, HostService, TracerouteGraphService, UnixTimeConverterService, GeoIPNekudoService, AnalyzeTraceroute, toastr) {


  $scope.Hello = function () {

    $log.debug("HELLO")
    toastr.success('Hello world!', '');
  }
}]);



