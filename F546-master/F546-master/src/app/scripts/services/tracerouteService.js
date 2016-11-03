/**
 * Created by Nazri on 28/2/16.
 */

var tracerouteServices = angular.module('TracerouteServices', ['GeneralServices']);

//var tracerouteListURL = 'http://hpc-perfsonar.usc.edu/esmond/perfsonar/archive/'
//var tracerouteResultURL = tracerouteListURL + ':metadata_key/packet-trace/base'
// var tracerouteResultURL = 'http://ps2.jp.apan.net/esmond/perfsonar/archive/'
// var tracerouteResultIndividualURL = tracerouteResultURL + ':metadata_key/packet-trace/base'


/*
 NOTES
 1. Populating graph in Service does not allow to use $scope.emit/broadcast in clicked events of the graph, which means the graph is unable to fire off another controller such as in the Latency Graph.

 */


/*
 MAIN SERVICE: Used to call Traceroute Results
 Checked on August 12th 2016
 */
tracerouteServices.factory('TracerouteResultsService', ['$http', '$log', 'HostService', function ($http, $log, HostService) {


  return {
    getMainResult: function (params) {
      return $http({
        method: 'GET',
        url: HostService.getHost(),
        params: params,
        // {
        //   'format': 'json',
        //   'event-type': 'packet-trace',
        //   'limit': 10,
        //   // 'time-end': (Math.floor(Date.now() / 1000)),
        //   'time-range': 86400
        // },
        cache: true
      })

    },

    getIndividualResult: function (url, params) {
      //URL is the response[i]['url'] taken from the getMainResult();


      // var toAppend = "?"
      //
      // angular.forEach(params, function (value, key) {
      //   toAppend = toAppend + key + "=" + value + "&"
      //
      // });
      //
      // var x= TracerouteResultsIndexedDBService.addResult(toCheck,"HELLO")
      // console.log(x)


      // console.log(IndividualTracerouteCacheService.getCacheObject().keys())

      // for (var i = 0; i < IndividualTracerouteCacheService.getCacheObject().keys().length; i++) {
      //   var toAppend = "?"
      //
      //   angular.forEach(params, function (value, key) {
      //     toAppend = toAppend + key + "=" + value + "&"
      //
      //   });
      //
      //   var toCheck = url + "packet-trace/base" + toAppend
      //
      //   if (IndividualTracerouteCacheService.getCacheObject().keys()[i] == toCheck.slice(0, -1)) {
      //
      //     // console.log("CACHE IS CALLED")
      //     return $http({
      //       method: 'GET',
      //       url: url + "packet-trace/base",
      //       params: params,
      //       // {
      //       //   'format': 'json',
      //       //   // 'limit': '2',
      //       //   // 'time-end': (Math.floor(Date.now() / 1000)),
      //       //   'time-range': 86400
      //       //   //48 Hours = 172800
      //       //   // 24 hours = 86400
      //       // },
      //       cache: IndividualTracerouteCacheService.getCacheObject()
      //     });
      //   }
      //
      // }
      //
      //
      // var toCache = true
      //
      // if (Math.floor((Math.random() * 100000000) + 10) % 10 == 0) {
      //   toCache = IndividualTracerouteCacheService.getCacheObject();
      // }

      return $http({
        method: 'GET',
        url: url + "packet-trace/base",
        params: params,
        cache: true
      });


    }

  }


}]);

/*
 MAIN CACHE SERVICE:
 Date: August 6th 2016
 */
// tracerouteServices.factory('TracerouteResultsIndexedDBService', ['$http', '$q', '$log', 'HostService', '$indexedDB', function ($http, $q, $log, HostService, $indexedDB) {
//
//
//   return {
//
//     addResult: function (url, result) {
//
//       return $indexedDB.openStore('IndividualTracerouteResult', function (store) {
//
//         store.delete(url).then(function () {
//
//           store.insert({
//               "url": url,
//               "data": result
//             }
//           ).then(function (e) {
//
//             return true;
//
//           });
//
//
//         })
//
//       });
//
//
//     },
//
//     getResult: function (url) {
//
//       return $indexedDB.openStore('IndividualTracerouteResult', function (store) {
//         store.find(url).then(function (e) {
//           return e;
//         });
//       });
//
//     }
//
//   }
//
//
// }]);
//
// tracerouteServices.factory('IndividualTracerouteCacheService', ['$http', '$q', '$log', 'HostService', 'CacheFactory', function ($http, $q, $log, HostService, CacheFactory) {
//   var TracerouteIndividualResult;
//
//   //TODO: probably update on expire.
//   if (!CacheFactory.get("TracerouteIndividualResult")) {
//     TracerouteIndividualResult = CacheFactory('TracerouteIndividualResult', {
//       maxAge: 30 * 60 * 1000, // Items added to this cache expire after X period,
//       // 15 = 15 minutes
//       //10080 minutes = 1 week
//       // 20160  = 2 weeks
//       deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
//       storageMode: 'localStorage' // This cache will use `localStorage`.
//
//     });
//   } else {
//     TracerouteIndividualResult = CacheFactory.get("TracerouteIndividualResult");
//   }
//
//   return {
//
//     storeResult: function (key, result) {
//
//       TracerouteIndividualResult.put(key, res);
//     },
//
//     getResult: function (key) {
//
//       return TracerouteIndividualResult.get(key);
//     },
//
//     getCacheObject: function () {
//       return TracerouteIndividualResult;
//     },
//
//     checkAvailableStorage: function (toBeAdded) {
//
//     }
//
//   }
//
//
// }]);
//

/*
 This services draws the Traceroute graph with DUPLICATED paths.
 div id = traceroute_graph_cytoscape on traceroute.html
 Checked on August 12th 2016
 */
tracerouteServices.factory('TracerouteGraphService', ['$log', function ($log) {

  var cy = cytoscape({
    container: document.getElementById('traceroute_graph_cytoscape'),

    style: [
      {
        selector: 'node',
        style: {
          'height': 20,
          'width': 20,
          'background-color': '#30c9bc',
          'label': 'data(label)'
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 2,
          'opacity': 1,
          'label': 'data(bandwidth)',
          'line-color': 'GreenYellow',
          'target-arrow-color': 'black',
          //Note that this is expensive to load.
          'curve-style': 'bezier',
          // tee, triangle, triangle-tee, triangle-backcurve, square, circle, diamond, or none
          'target-arrow-shape': 'triangle',
          'min-zoomed-font-size': 50
        }
      },
      {
        selector: '.multiline-manual',
        style: {
          'text-wrap': 'wrap'
        }
      },
      {
        selector: 'node[sourceNode = "true"]',
        style: {
          'height': 30,
          'width': 30,
          'background-color': 'DimGray'
        }
      },
      {
        selector: 'edge[tracerouteError = "true"]',
        style: {
          'line-color': 'IndianRed'
        }
      }
    ],
    pixelRatio: 1,
    //Might want to consider to true if graph is taking a long time to load.
    textureOnViewport: false,
    hideEdgesOnViewport: false

    // Layout can only be done in Controller.
  });


  return {

    // getMainTracerouteResult: function (params) {
    //   return $http({
    //     method: 'GET',
    //     url: HostService.getHost(),
    //     params: params,
    //
    //     // {
    //     //   'format': 'json',
    //     //   'event-type': 'packet-trace',
    //     //   'limit': 10,
    //     //   // 'time-end': (Math.floor(Date.now() / 1000)),
    //     //   'time-range': 86400
    //     // },
    //     cache: true
    //   })
    //
    // },
    //
    // getIndividualTracerouteResult: function (url, params) {
    //   return $http({
    //     method: 'GET',
    //     url: url + "packet-trace/base",
    //     params: params,
    //     // {
    //     //   'format': 'json',
    //     //   // 'limit': '2',
    //     //   // 'time-end': (Math.floor(Date.now() / 1000)),
    //     //   'time-range': 86400
    //     //   //48 Hours = 172800
    //     //   // 24 hours = 86400
    //     // },
    //     cache: true
    //   });
    // },

    add_node: function (ID, sourceNode) {
      var mainNode;


      if (sourceNode == true) {
        mainNode = "true";
      } else {
        mainNode = "false";
      }


      var node = {
        group: 'nodes',
        // NB: id fields must be strings or numbers
        data: {
          // element data (put dev data here)

          id: ID, // mandatory for each element, assigned automatically on undefined
          sourceNode: mainNode,
          country: null,
          city: null,
          label: ID


        },
        classes: 'multiline-manual'// a space separated list of class names that the element has


        // scratchpad data (usually temp or nonserialisable data)
        // scratch: {
        //   foo: 'bar'
        // },
        //
        // position: { // the model position of the node (optional on init, mandatory after)
        //   x: 100,
        //   y: 100
        // },
        //
        // selected: false, // whether the element is selected (default false)
        //
        // selectable: true, // whether the selection state is mutable (default true)
        //
        // locked: false, // when locked a node's position is immutable (default false)
        //
        // grabbable: true // whether the node can be grabbed and moved by the user


      };

      // console.log("Node ID: " + ID + " created.");


      cy.add(node);
      return cy;
    },

    add_edge: function (ID, source, target, tracerouteError, tracerouteRTT, timeUpdated, startNode, endNode, metadataKey) {
      var innerTracerouteError = "false";

      if (tracerouteError == true) {
        innerTracerouteError = "true";
      } else if (tracerouteError == false) {
        innerTracerouteError = "false";
      }

      var edge = {
        group: 'edges',
        data: {
          id: ID,
          source: source, // the source node id (edge comes from this node)
          target: target,  // the target node id (edge goes to this node)
          tracerouteError: innerTracerouteError,
          rtt: tracerouteRTT,
          time: timeUpdated,
          startNode: startNode,
          endNode: endNode,
          metadataKey: metadataKey
        }
      };
      // console.log("Edge ID: " + ID + " Source: " + source + " Target: " + target + " created.");
      //return edge;

      cy.add(edge);
      return cy;
    },

    getGraph: function () {
      return cy;
    },


    // loadGraph_TracerouteOverview: function () {
    //
    //   var sourceAndDestinationList;
    //   var nodeList;
    //
    //   $http({
    //     method: 'GET',
    //     url: HostService.getHost(),
    //     params: {
    //       'format': 'json',
    //       'event-type': 'packet-trace',
    //       'limit': 10,
    //       // 'time-end': (Math.floor(Date.now() / 1000)),
    //       'time-range': 86400
    //     },
    //     cache: true
    //   }).then(function (response) {
    //     sourceAndDestinationList = [];
    //     nodeList = [];
    //     var promises = [];
    //
    //     for (var i = 0; i < response.data.length; i++) {
    //
    //       sourceAndDestinationList.push(
    //         {
    //           source: response.data[i]['source'],
    //           destination: response.data[i]['destination'],
    //           metadataKey: response.data[i]['metadata-key']
    //         }
    //       );
    //
    //
    //       //Adding main nodes into graph
    //       if (cy.elements('node[id = "' + response.data[i]['source'] + '"]').size() == 0) {
    //
    //         // True as this is a SOURCE node.
    //         TracerouteGraphService.add_node(response.data[i]['source'], true);
    //         nodeList.push(response.data[i]['source']);
    //
    //         // Event
    //         TracerouteGraphService.getGraph().on('tap', 'node[id = "' + response.data[i]['source'] + '"]', function (event) {
    //           var element = event.cyTarget;
    //           // $log.debug("Clicked on Node ID: " + element.data().id)
    //
    //         });
    //       }
    //
    //       for (var j = 0; j < response.data[i]['event-types'].length; j++) {
    //         if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {
    //
    //           promises.push($http({
    //               method: 'GET',
    //               url: response.data[i]['url'] + "packet-trace/base",
    //               params: {
    //                 'format': 'json',
    //                 // 'limit': '2',
    //                 // 'time-end': (Math.floor(Date.now() / 1000)),
    //                 'time-range': 86400
    //                 // 48 Hours = 172800
    //                 // 24 hours = 86400
    //               },
    //               cache: true
    //             })
    //           );
    //
    //         }
    //       }
    //
    //
    //     }
    //
    //     // $log.debug("sourceAndDestinationList Size: " + sourceAndDestinationList.length)
    //     return $q.all(promises);
    //
    //   }).then(function (response) {
    //
    //
    //   })
    //
    //
    // }


  }

}]);


/*
 Used to ADD/REMOVE/MANIPULATE the Cytoscape Graph for the Traceroute Path on traceroute_path.html
 Date: August 6th 2016
 */

/*
 This services draws the Traceroute !!PATH!! graph with DUPLICATED paths.
 div id = traceroute_path_graph_cytoscape on traceroute_path.html
 Checked on August 13th 2016
 */
tracerouteServices.factory('TraceroutePath_GraphService', ['$log', function ($log) {

  var cy = cytoscape({
    container: document.getElementById('traceroute_path_graph_cytoscape'),

    style: [
      {
        selector: 'node',
        style: {
          'height': 20,
          'width': 20,
          'background-color': '#30c9bc',
          'label': 'data(label)'
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 2,
          'opacity': 1,
          'label': 'data(bandwidth)',
          'line-color': 'GreenYellow',
          'target-arrow-color': 'black',
          // tee, triangle, triangle-tee, triangle-backcurve, square, circle, diamond, or none
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: '.multiline-manual',
        style: {
          'text-wrap': 'wrap'
        }
      },
      {
        selector: 'node[sourceNode = "true"]',
        style: {
          'height': 30,
          'width': 30,
          'background-color': 'DimGray'
        }
      },
      {
        selector: 'edge[pathAnomaly = "true"]',
        style: {
          'line-color': 'IndianRed'
        }
      }
    ],
    pixelRatio: 1,
    //Might want to consider to true if graph is taking a long time to load.
    textureOnViewport: false,
    hideEdgesOnViewport: false

    // Layout can only be done in Controller.
  });


  return {

    add_node: function (ID, sourceNode) {
      var mainNode;

      if (sourceNode == true) {
        mainNode = "true";
      } else {
        mainNode = "false";
      }


      var node = {
        group: 'nodes',
        // NB: id fields must be strings or numbers
        data: {
          // element data (put dev data here)

          id: ID, // mandatory for each element, assigned automatically on undefined
          sourceNode: mainNode,
          country: null,
          city: null,
          label: ID


        },
        classes: 'multiline-manual'// a space separated list of class names that the element has


        // scratchpad data (usually temp or nonserialisable data)
        // scratch: {
        //   foo: 'bar'
        // },
        //
        // position: { // the model position of the node (optional on init, mandatory after)
        //   x: 100,
        //   y: 100
        // },
        //
        // selected: false, // whether the element is selected (default false)
        //
        // selectable: true, // whether the selection state is mutable (default true)
        //
        // locked: false, // when locked a node's position is immutable (default false)
        //
        // grabbable: true // whether the node can be grabbed and moved by the user


      };

      // console.log("Node ID: " + ID + " created.");


      cy.add(node);
      return cy;
    },

    add_edge: function (ID, source, target, pathAnomaly, timeUpdated, startNode, endNode, metadataKey) {
      var innerTracerouteError = "false";

      if (pathAnomaly == true) {
        innerTracerouteError = "true";
      } else {
        innerTracerouteError = "false";
      }

      var edge = {
        group: 'edges',
        data: {
          id: ID,
          source: source, // the source node id (edge comes from this node)
          target: target,  // the target node id (edge goes to this node)
          pathAnomaly: innerTracerouteError,
          time: timeUpdated,
          startNode: startNode,
          endNode: endNode,
          metadataKey: metadataKey
        }
      };
      // console.log("Edge ID: " + ID + " Source: " + source + " Target: " + target + " created.");
      //return edge;

      cy.add(edge);
      return cy;
    },

    getGraph: function () {
      return cy;
    },

  }


}]);


/*
 Used to PULL information, SORT the information, and utilises TracerouteGraphService to MANIPULATE(ADD/REMOVE) the graph
 on traceroute_path.html
 Date: August 6th 2016
 */
tracerouteServices.factory('TraceroutePath_PopulateGraphService', ['$http', '$q', '$cacheFactory', '$log', 'HostService', 'TraceroutePath_GraphService', 'GeoIPNekudoService', 'UnixTimeConverterService', 'TracerouteResultsService', 'AnalyzeTraceroutePath', 'UniqueArrayService', function ($http, $q, $cacheFactory, $log, HostService, TraceroutePath_GraphService, GeoIPNekudoService, UnixTimeConverterService, TracerouteResultsService, AnalyzeTraceroutePath, UniqueArrayService) {

  // $log.debug("TraceroutePath_PopulateGraphService: START");

  return {


    loadGraph_TracerouteOverview: function () {

      var sourceAndDestinationList;
      var nodeList;
      var toReturnList = [];

      TraceroutePath_GraphService.getGraph().remove('node');
      TraceroutePath_GraphService.getGraph().remove('edge');


      return TracerouteResultsService.getMainResult(
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
          if (TraceroutePath_GraphService.getGraph().elements('node[id = "' + response.data[i]['source'] + '"]').size() == 0) {
            // True as this is a SOURCE node.
            TraceroutePath_GraphService.add_node(response.data[i]['source'], true);
            nodeList.push(response.data[i]['source']);

          }

          for (var j = 0; j < response.data[i]['event-types'].length; j++) {
            if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {

              promises.push(TracerouteResultsService.getIndividualResult(response.data[i]['url'],
                {
                  'format': 'json',
                  // 'limit': '2',
                  // 'time-end': (Math.floor(Date.now() / 1000)),
                  // 'time-range': 604800
                  // 48 Hours = 172800
                  // 24 hours = 86400
                  // 7 days = 604800
                  'time-start': response.data[i]['event-types'][j]['time-updated'] - 900
                }
              ));

            }
          }


        }

        // $log.debug("sourceAndDestinationList Size: " + sourceAndDestinationList.length)
        //Index 0 holds number of paths
        toReturnList.push(sourceAndDestinationList.length);

        return $q.all(promises);

      }).then(function (response) {


        for (var i = 0; i < response.length; i++) {

          // var pathAnomaly = false;
          //
          // //Analyzation of Path begins:
          // if (response[i].data.length > 1) {
          //
          //   pathAnomaly = AnalyzeTraceroute.analyzePath(response[i].data);
          //
          // } else {
          //   // only 1 result available.
          //   //This also means that traceroute path with only 1 results will never have an anomaly.
          //
          // }
          // Path is reversed to get the latest Traceroute data.
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
                  });
                }
              } else {
                errorInTraceroute = true;
              }

            }

            // Adding Nodes
            for (var m = 0; m < tempResultList.length; m++) {

              if (TraceroutePath_GraphService.getGraph().elements('node[id = "' + tempResultList[m].ip + '"]').size() == 0) {

                TraceroutePath_GraphService.add_node(tempResultList[m].ip, false);
                nodeList.push(tempResultList[m].ip);

              }

            }


            // Adding edges
            for (var m = 0; m < tempResultList.length; m++) {

              if (m != (tempResultList.length - 1 )) {
                // var edgeID = temp_ip[m] + "to" + temp_ip[m + 1];
                var edgeID = Math.random();

                if (TraceroutePath_GraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {

                  TraceroutePath_GraphService.add_edge(edgeID, tempResultList[m].ip, tempResultList[m + 1].ip, false, reversedResponse[j]['ts'], startNode, destinationNode, metadataKey);

                }
              }
            }

            // Add Edge for main node
            // var edgeID = startNode + "to" + reversedResponse[j]['val'][0]['ip'];
            var edgeID = Math.random();

            if (TraceroutePath_GraphService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {

              TraceroutePath_GraphService.add_edge(edgeID, startNode, reversedResponse[j]['val'][0]['ip'], false, reversedResponse[j]['ts'], startNode, destinationNode, metadataKey);

            }

            // Break so that we grab only the latest traceroute path
            break;
          }

        }


        var nodeToIP_promises = [];
        var uniqueNodes = UniqueArrayService.getUnique(nodeList);
        for (var i = 0; i < uniqueNodes.length; i++) {
          nodeToIP_promises.push(GeoIPNekudoService.getCountry(uniqueNodes[i]));
        }
        //Index 0 holds number of paths
        toReturnList.push(uniqueNodes.length);

        return $q.all(nodeToIP_promises);

      }).then(function (response) {

        for (var i = 0; i < response.length; i++) {

          var node = TraceroutePath_GraphService.getGraph().elements('[id = "' + response[i].ip + '"]');
          node.data({
            label: response[i].ip + "\n" + response[i].city + ", " + response[i].countrycode
          });

        }


        TraceroutePath_GraphService.getGraph().layout({
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

        //return if needed to path information to controller.

        return toReturnList;


      }).catch(function (error) {
        $log.error(error)
        $log.debug("Server Response: " + error.status);

      });


    },

    loadErroneousTraceroutePath: function () {

      var sourceAndDestinationList;
      var nodeList;

      return TracerouteResultsService.getMainResult(
        {
          'format': 'json',
          'event-type': 'packet-trace',
          // 'limit': 10,
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


          for (var j = 0; j < response.data[i]['event-types'].length; j++) {
            if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {

              promises.push(TracerouteResultsService.getIndividualResult(response.data[i]['url'],
                {
                  'format': 'json',
                  // 'limit': '2',
                  'time-range': 604800
                  // 48 Hours = 172800
                  // 24 hours = 86400
                  // 7 days = 604800
                }
              ));

            }
          }


        }


        return $q.all(promises);

      }).then(function (response) {

        var noOfAnomalies = 0;
        var minDate = 0;
        var maxDate = 0

        for (var i = 0; i < response.length; i++) {

          var pathAnomaly = false;
          // Path is reversed to get the latest Traceroute data.
          var reversedResponse = response[i].data.reverse();

          //Analyzation of Path begins:
          if (response[i].data.length > 1) {

            var tempResults = AnalyzeTraceroutePath.getAnalysis(reversedResponse)
            pathAnomaly = tempResults[0];
            minDate = tempResults[2]
            maxDate = tempResults[3]

            // minMaxDateTime = AnalyzeTraceroute.getMinMaxDate(reversedResponse);

          } else {
            // only 1 result available.
            //This also means that traceroute path with only 1 results will never have an anomaly.
            //TODO: Inform Path with only one result.

          }


          // var startNode = sourceAndDestinationList[i].source;
          // var destinationNode = sourceAndDestinationList[i].destination;
          var metadataKey = sourceAndDestinationList[i].metadataKey;
          var errorInTraceroute = null;


          if (pathAnomaly == true) {
            noOfAnomalies++;

            var edges = TraceroutePath_GraphService.getGraph().edges('[metadataKey = "' + metadataKey + '"]');
            // console.log("edges SIZE: " + edges.size())
            for (var k = 0; k < edges.size(); k++) {

              edges[k].data({
                pathAnomaly: "true"
              });
            }

          }

        }


        TraceroutePath_GraphService.getGraph().style()
          .selector('edge[pathAnomaly = "true"]')
          .style({
            'line-color': 'IndianRed'
          }).update();


        return [noOfAnomalies, minDate, maxDate];


      }).catch(function (error) {
        $log.error(error)
        $log.debug("Server Response: " + error.status);

      });


    },


    loadGraph_NonErroneousTraceroutePath: function () {

    }


  }


}]);


/*
 For INDIVIDUAL anomalies path
 Date: August 6th 2016
 */
tracerouteServices.factory('IndividualTraceroutePath_GraphService', ['$http', '$q', '$cacheFactory', '$log', 'HostService', function ($http, $q, $cacheFactory, $log, HostService) {

  var cy = cytoscape({
    container: document.getElementById('individual_traceroute_path_graph'),

    style: [
      {
        selector: 'node',
        style: {
          'height': 20,
          'width': 20,
          'background-color': '#30c9bc',
          'label': 'data(label)'
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 2,
          'opacity': 1,
          'label': 'data(bandwidth)',
          'line-color': 'GreenYellow',
          'target-arrow-color': 'black',
          // tee, triangle, triangle-tee, triangle-backcurve, square, circle, diamond, or none
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: '.multiline-manual',
        style: {
          'text-wrap': 'wrap'
        }
      },
      {
        selector: 'node[sourceNode = "true"]',
        style: {
          'height': 30,
          'width': 30,
          'background-color': 'DimGray'
        }
      }
    ], pixelRatio: 1,
    //Might want to consider to true if graph is taking a long time to load.
    textureOnViewport: false,
    hideEdgesOnViewport: false

    // Layout can only be done in Controller.
  });


  return {

    add_node: function (ID, sourceNode) {
      var mainNode;


      if (sourceNode == true) {
        mainNode = "true";
      } else {
        mainNode = "false";
      }


      var node = {
        group: 'nodes',
        // NB: id fields must be strings or numbers
        data: {
          // element data (put dev data here)

          id: ID, // mandatory for each element, assigned automatically on undefined
          sourceNode: mainNode,
          country: null,
          city: null,
          label: ID
        },
        classes: 'multiline-manual'// a space separated list of class names that the element has


        // scratchpad data (usually temp or nonserialisable data)
        // scratch: {
        //   foo: 'bar'
        // },
        //
        // position: { // the model position of the node (optional on init, mandatory after)
        //   x: 100,
        //   y: 100
        // },
        //
        // selected: false, // whether the element is selected (default false)
        //
        // selectable: true, // whether the selection state is mutable (default true)
        //
        // locked: false, // when locked a node's position is immutable (default false)
        //
        // grabbable: true // whether the node can be grabbed and moved by the user


      };

      // console.log("Node ID: " + ID + " created.");


      cy.add(node);
      return cy;
    },

    add_edge: function (ID, source, target, startNode, endNode, metadataKey) {
      // var innerTracerouteError = "false";
      //
      // if (pathAnomaly == true) {
      //   innerTracerouteError = "true";
      // } else {
      //   innerTracerouteError = "false";
      // }

      var edge = {
        group: 'edges',
        data: {
          id: ID,
          // inferred as an edge because `source` and `target` are specified:
          source: source, // the source node id (edge comes from this node)
          target: target,  // the target node id (edge goes to this node)
          // pathAnomaly: innerTracerouteError,
          // bandwidth: bandwidth,
          startNode: startNode,
          endNode: endNode,
          metadataKey: metadataKey
        }
      };
      // console.log("Edge ID: " + ID + " Source: " + source + " Target: " + target + " created.");
      //return edge;

      cy.add(edge);
      return cy;
    },

    getGraph: function () {
      return cy;
    },


  }


}]);

tracerouteServices.factory('IndividualTraceroutePath_PopulateGraphService', ['$http', '$q', '$cacheFactory', '$log', 'HostService', 'IndividualTraceroutePath_GraphService', 'GeoIPNekudoService', 'UnixTimeConverterService', 'TracerouteResultsService', 'AnalyzeTraceroutePath', 'UniqueArrayService', function ($http, $q, $cacheFactory, $log, HostService, IndividualTraceroutePath_GraphService, GeoIPNekudoService, UnixTimeConverterService, TracerouteResultsService, AnalyzeTraceroutePath, UniqueArrayService) {

  // $log.debug("IndividualTraceroutePath_PopulateGraphService: START");

  return {

    getErroneousTraceroutePath: function () {

      // $log.debug("TraceroutePath_PopulateGraphService:getErroneousTraceroutePath() START");

      var sourceAndDestinationList;
      var nodeList;
      var errorPathList = [];

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


      return TracerouteResultsService.getMainResult(
        {
          'format': 'json',
          'event-type': 'packet-trace',
          'limit': 10,
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

          nodeList.push(response.data[i]['source']);
          nodeList.push(response.data[i]['destination']);


          for (var j = 0; j < response.data[i]['event-types'].length; j++) {
            if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {

              promises.push(TracerouteResultsService.getIndividualResult(response.data[i]['url'],
                {
                  'format': 'json',
                  // 'limit': '2',
                  // 'time-end': (Math.floor(Date.now() / 1000)),
                  'time-range': 86400
                  // 48 Hours = 172800
                  // 24 hours = 86400
                  // 7 days = 604800
                }
              ));

            }
          }


        }

        // $log.debug("sourceAndDestinationList Size: " + sourceAndDestinationList.length)
        // $log.debug("Promise Size: " + promises.length);
        return $q.all(promises);

      }).then(function (response) {

        // $log.debug("getErroneousTraceroutePath().response.length: " + response.length);

        for (var i = 0; i < response.length; i++) {
          // Path is reversed to get the latest Traceroute data.
          var reversedResponse = response[i].data.reverse();

          var pathAnomaly = false;

          //Analyzation of Path begins:
          if (response[i].data.length > 1) {
            pathAnomaly = AnalyzeTraceroute.analyzePath(reversedResponse);


          } else {
            // only 1 result available.
            //This also means that traceroute path with only 1 results will never have an anomaly.
          }


          var errorInTraceroute = null;


          if (pathAnomaly == true) {

            // $log.debug("Metadata: " + sourceAndDestinationList[i].metadataKey)

            var newErrorPath = {
              source: {
                ip: sourceAndDestinationList[i].source,
                city: null,
                country: null
              },
              sourceIP: sourceAndDestinationList[i].source,
              destination: {
                ip: sourceAndDestinationList[i].destination,
                city: null,
                country: null
              },
              destinationIP: sourceAndDestinationList[i].destination,
              result: [],
              metadata: sourceAndDestinationList[i].metadataKey
            }

            for (var j = 0; j < reversedResponse.length; j++) {

              // console.log("FIRST DA?TE: " + reversedResponse[0]['ts'])

              // if (reversedResponse[0]['ts'] > reversedResponse[j]['ts']) {
              //   // console.log("TRUE LATEST")
              // } else if (reversedResponse[0]['ts'] < reversedResponse[j]['ts']) {
              //   // console.log("FALSE FIRST DATE IS EARLIER")
              // }

              var trResult = {
                ts: reversedResponse[j]['ts'],
                nodes: []
              }


              for (var k = 0; k < reversedResponse[j]['val'].length; k++) {

                // if (reversedResponse[j]['val'][k]['success'] == 1)

                if (reversedResponse[j]['val'][k]['query'] == 1) {

                  nodeList.push(reversedResponse[j]['val'][k]['ip']);

                  trResult.nodes.push({
                    ip: reversedResponse[j]['val'][k]['ip'],
                    city: null,
                    country: null
                  });
                }
              }

              newErrorPath.result.push(trResult);
            }

            errorPathList.push(newErrorPath);
          }

        }


        var nodeToIP_promises = [];
        var uniqueNodes = UniqueArrayService.getUnique(nodeList);
        for (var i = 0; i < uniqueNodes.length; i++) {
          nodeToIP_promises.push(GeoIPNekudoService.getCountry(uniqueNodes[i]));
        }

        return $q.all(nodeToIP_promises);

      }).then(function (response) {

        for (var i = 0; i < response.length; i++) {

          var ip = response[i].ip;
          var city = response[i].city;
          var country = response[i].countrycode;


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


          for (var j = 0; j < errorPathList.length; j++) {

            if (errorPathList[j].source.ip == ip) {
              errorPathList[j].source.city = city;
              errorPathList[j].source.country = country;
            }

            if (errorPathList[j].destination.ip == ip) {
              errorPathList[j].destination.city = city;
              errorPathList[j].destination.country = country;
            }
            for (var k = 0; k < errorPathList[j].result.length; k++) {
              for (var m = 0; m < errorPathList[j].result[k].nodes.length; m++) {
                if (errorPathList[j].result[k].nodes[m].ip == ip) {
                  errorPathList[j].result[k].nodes[m].city = city;
                  errorPathList[j].result[k].nodes[m].country = country;
                }
              }

            }

          }


        }

        // console.log("errorPathList.length:" + errorPathList.length);
        return errorPathList;
      }).catch(function (error) {
        $log.debug("getErroneousTraceroutePath")
        console.log(error);
        $log.debug("Server Response: " + error.status);

      });


    },

    getHistorialPath: function () {

      var sourceAndDestinationList;
      var nodeList;
      var errorPathList = [];

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


      return TracerouteResultsService.getMainResult(
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
                  // 7 days = 604800
                }
              ));

            }
          }


        }


        return $q.all(promises);

      }).then(function (response) {


        for (var i = 0; i < response.length; i++) {
          // console.log(response[i].data)

          // Path is reversed to get the latest Traceroute data.
          var reversedResponse = response[i].data.reverse();

          //TODO: THIS IS A KNOWN BUG WHERE THE RESULTS ARE NOT THE LATEST.
          // for (var x = 0; x < reversedResponse.length; x++) {
          //   if ("bce34b84177d42e09b213dd0faf06b94" == sourceAndDestinationList[i].metadataKey) {
          //     console.log(" ORIGINAL TIME OF RESULTS: " + reversedResponse[x]['ts'])
          //     console.log("TIME FORMATTED: " + UnixTimeConverterService.getTime(reversedResponse[x]['ts']))
          //     console.log("DATE FORMATTED: " + UnixTimeConverterService.getDate(reversedResponse[x]['ts']))
          //   }
          //
          // }

          var pathAnomaly = false;
          var anomalyIndex = null;

          //Analyzation of Path begins:
          if (response[i].data.length > 1) {
            pathAnomaly = AnalyzeTraceroutePath.getAnalysis(reversedResponse)[0];
            anomalyIndex = AnalyzeTraceroutePath.getAnalysis(reversedResponse)[1]
            //  console.log("MORE THAN 1 RESULTS")

          } else {
            // only 1 result available.
            //This also means that traceroute path with only 1 results will never have an anomaly.
          }


          if (pathAnomaly == true) {
            //FIXME: CONSIDER REMOVING THIS IF STATEMENT
            // if (true) {


            var newErrorPath = {
              source: {
                ip: sourceAndDestinationList[i].source,
                city: null,
                country: null
              },
              sourceIP: sourceAndDestinationList[i].source,
              destination: {
                ip: sourceAndDestinationList[i].destination,
                city: null,
                country: null
              },
              destinationIP: sourceAndDestinationList[i].destination,
              result: [],
              metadata: sourceAndDestinationList[i].metadataKey,
              anomalyIndex: anomalyIndex
            }

            for (var j = 0; j < reversedResponse.length; j++) {

              var trResult = {
                ts: reversedResponse[j]['ts'],
                nodes: []
              }


              for (var k = 0; k < reversedResponse[j]['val'].length; k++) {


                if (reversedResponse[j]['val'][k]['query'] == 1) {

                  nodeList.push(reversedResponse[j]['val'][k]['ip']);

                  trResult.nodes.push({
                    ip: reversedResponse[j]['val'][k]['ip'],
                    city: null,
                    country: null
                  });
                }
              }

              newErrorPath.result.push(trResult);
            }

            errorPathList.push(newErrorPath);
          }

        }


        var nodeToIP_promises = [];
        var uniqueNodes = UniqueArrayService.getUnique(nodeList);
        for (var i = 0; i < uniqueNodes.length; i++) {
          nodeToIP_promises.push(GeoIPNekudoService.getCountry(uniqueNodes[i]));
        }

        return $q.all(nodeToIP_promises);

      }).then(function (response) {

        for (var i = 0; i < response.length; i++) {

          var ip = response[i].ip;
          var city = response[i].city;
          var country = response[i].countrycode;


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


          for (var j = 0; j < errorPathList.length; j++) {

            if (errorPathList[j].source.ip == ip) {
              errorPathList[j].source.city = city;
              errorPathList[j].source.country = country;
            }

            if (errorPathList[j].destination.ip == ip) {
              errorPathList[j].destination.city = city;
              errorPathList[j].destination.country = country;
            }
            for (var k = 0; k < errorPathList[j].result.length; k++) {
              for (var m = 0; m < errorPathList[j].result[k].nodes.length; m++) {
                if (errorPathList[j].result[k].nodes[m].ip == ip) {
                  errorPathList[j].result[k].nodes[m].city = city;
                  errorPathList[j].result[k].nodes[m].country = country;
                }
              }

            }

          }


        }

        // console.log("errorPathList.length:" + errorPathList.length);

        return errorPathList;

      }).catch(function (error) {
        $log.debug("getHistorialPath()")
        console.log(error);
        $log.error(error)
        $log.debug("Server Response: " + error.status);

      });


    }

  }


}]);


// // This service draws the main Latency cytoscape graph
// tracerouteServices.factory('LatencyCytoscapeService', [function () {
//
// // cache http://stackoverflow.com/questions/21660647/angular-js-http-cache-time
//
//   var cy = cytoscape({
//     container: document.getElementById('latency_cytoscape'),
//
//     style: [
//       {
//         selector: 'node',
//         style: {
//           'height': 20,
//           'width': 20,
//           'background-color': 'LightSeaGreen',
//           'label': 'data(label)'
//         }
//       },
//
//       {
//         selector: 'edge',
//         style: {
//           'width': 2,
//           'opacity': 0.8,
//           'label': 'data(latency)',
//           'line-color': 'GreenYellow',
//           'target-arrow-color': 'black',
//           // tee, triangle, triangle-tee, triangle-backcurve, square, circle, diamond, or none
//           'target-arrow-shape': 'triangle'
//         }
//       },
//       {
//         selector: '.multiline-manual',
//         style: {
//           'text-wrap': 'wrap'
//         }
//       }
//     ],
//     ready: function () {
//       // window.cy = this;
//
//
//     }
//
//     // Layout can only be done in Controller.
//   });
//
//
//   return {
//     add_node: function (ID, main, startNode, endNode) {
//       var mainNode;
//
//
//       if (main == true) {
//         mainNode = "true";
//       } else {
//         mainNode = "false";
//       }
//
//       var node = {
//         group: 'nodes',
//         // 'nodes' for a node, 'edges' for an edge
//         // NB the group field can be automatically inferred for you but specifying it
//         // gives you nice debug messages if you mis-init elements
//
//         // NB: id fields must be strings or numbers
//         data: {
//           // element data (put dev data here)
//           // mandatory for each element, assigned automatically on undefined
//           id: ID,
//           mainNode: mainNode,
//           startNode: 0,
//           endNode: 0,
//           country: null,
//           city: null,
//           label: ID
//
//           // parent: 'nparent', // indicates the compound node parent id; not defined => no parent
//         },
//         classes: 'multiline-manual'// a space separated list of class names that the element has
//
//
//         // scratchpad data (usually temp or nonserialisable data)
//         // scratch: {
//         //   foo: 'bar'
//         // },
//         //
//         // position: { // the model position of the node (optional on init, mandatory after)
//         //   x: 100,
//         //   y: 100
//         // },
//         //
//         // selected: false, // whether the element is selected (default false)
//         //
//         // selectable: true, // whether the selection state is mutable (default true)
//         //
//         // locked: false, // when locked a node's position is immutable (default false)
//         //
//         // grabbable: true // whether the node can be grabbed and moved by the user
//
//
//       };
//
//       // console.log("Node ID: " + ID + " created.");
//
//
//       cy.add(node);
//       return cy;
//     },
//
//     add_edge: function (ID, source, target, tracerouteRTT, bandwidth, latency, startNode, endNode, metadataKey, latencyTime) {
//
//
//       var edge = {
//         group: 'edges',
//         data: {
//           id: ID,
//           // inferred as an edge because `source` and `target` are specified:
//           source: source, // the source node id (edge comes from this node)
//           target: target,  // the target node id (edge goes to this node)
//           rtt: tracerouteRTT,
//           bandwidth: bandwidth,
//           latency: latency,
//           startNode: startNode,
//           endNode: endNode,
//           metadataKey: metadataKey,
//           latencyTime: latencyTime
//         }
//
//       };
//       // console.log("Edge ID: " + ID + " Source: " + source + " Target: " + target + " created.");
//       //return edge;
//
//       cy.add(edge);
//       return cy;
//     },
//
//     update_node: function (ID, data) {
//       // cy.elements('node[id = "' + ID + '"]')
//       var element = cy.getElementById(ID);
//       element.data(data);
//       return cy;
//     },
//
//     update_edge: function (ID, data) {
//
//       // cy.elements('edge[id = "' + ID + '"]')
//       var element = cy.getElementById(ID);
//       element.data(data);
//       return cy;
//     },
//
//     setLayout: function (selector) {
//
//       cy.style()
//       // .selector('#203.30.39.127')
//       // .selector(':selected')
//       // .selector('[id = "203.30.39.127"]')
//         .selector(selector)
//         .style({
//           'line-color': 'blue',
//         }).update();
//
//       return cy;
//     },
//
//     getGraph: function () {
//       return cy;
//     }
//   }
//
//
// }]);
//
// // This service draws the main a traceroute graph for each MAIN results of Latency
// tracerouteServices.factory('LatencyToTracerouteCytoscapeService', [function () {
//
//   var cy = cytoscape({
//     container: document.getElementById('latency_graph_cytoscape_traceroute'),
//
//     style: [
//       {
//         selector: 'node',
//         style: {
//           'height': 20,
//           'width': 20,
//           'background-color': 'LightSeaGreen',
//           'label': 'data(label)'
//         }
//       },
//
//       {
//         selector: 'edge',
//         style: {
//           'width': 2,
//           'opacity': 0.8,
//           'label': 'data(latency)',
//           'line-color': 'GreenYellow',
//           'target-arrow-color': 'black',
//           // tee, triangle, triangle-tee, triangle-backcurve, square, circle, diamond, or none
//           'target-arrow-shape': 'triangle'
//         }
//       },
//       {
//         selector: '.multiline-manual',
//         style: {
//           'text-wrap': 'wrap'
//         }
//       }
//     ],
//     ready: function () {
//
//       // window.cy = this;
//
//     }
//
//     // Layout can only be done in Controller.
//   });
//
//
//   return {
//
//     add_node: function (ID, main, startNode, endNode) {
//       var mainNode;
//
//
//       if (main == true) {
//         mainNode = "true";
//       } else {
//         mainNode = "false";
//       }
//
//       var node = {
//         group: 'nodes',
//         // 'nodes' for a node, 'edges' for an edge
//         // NB the group field can be automatically inferred for you but specifying it
//         // gives you nice debug messages if you mis-init elements
//
//         // NB: id fields must be strings or numbers
//         data: {
//           id: ID,
//           mainNode: mainNode,
//           startNode: startNode,
//           endNode: endNode,
//           country: null,
//           city: null,
//           label: ID
//
//           // parent: 'nparent', // indicates the compound node parent id; not defined => no parent
//         },
//         classes: 'multiline-manual'// a space separated list of class names that the element has
//
//
//         // scratchpad data (usually temp or nonserialisable data)
//         // scratch: {
//         //   foo: 'bar'
//         // },
//         //
//         // position: { // the model position of the node (optional on init, mandatory after)
//         //   x: 100,
//         //   y: 100
//         // },
//         //
//         // selected: false, // whether the element is selected (default false)
//         //
//         // selectable: true, // whether the selection state is mutable (default true)
//         //
//         // locked: false, // when locked a node's position is immutable (default false)
//         //
//         // grabbable: true // whether the node can be grabbed and moved by the user
//
//
//       };
//
//       // console.log("Node ID: " + ID + " created.");
//
//
//       cy.add(node);
//       return cy;
//     },
//
//     add_edge: function (ID, source, target, tracerouteRTT, bandwidth, latency, startNode, endNode, metadataKey, latencyTime) {
//
//
//       var edge = {
//         group: 'edges',
//         data: {
//           id: ID,
//           source: source, // the source node id (edge comes from this node)
//           target: target,  // the target node id (edge goes to this node)
//           rtt: tracerouteRTT,
//           bandwidth: bandwidth,
//           latency: latency,
//           startNode: startNode,
//           endNode: endNode,
//           metadataKey: metadataKey,
//           latencyTime: latencyTime
//         }
//
//       };
//
//       // console.log("Edge ID: " + ID + " Source: " + source + " Target: " + target + " created.");
//
//       cy.add(edge);
//       return cy;
//     },
//
//     getGraph: function () {
//       return cy;
//     }
//   }
//
//
// }]);
//
//
// // This service is to loads the Traceroute graph from the Latency Graph.
// tracerouteServices.factory('LatencyMetadataService', ['$http', '$q', '$cacheFactory', '$log', 'HostService', 'LatencyToTracerouteCytoscapeService', 'GeoIPNekudoService', function ($http, $q, $cacheFactory, $log, HostService, LatencyToTracerouteCytoscapeService, GeoIPNekudoService) {
//
//   $log.debug("LatencyMetadataService:START");
//
//   var host = HostService.getHost();
//   var metadataList = [];
//   var metadata = "";
//
//
//   return {
//
//     setTracerouteGraph: function (source, destination) {
//       var sourceAndDestinationList = [];
//       var nodeList = [];
//       var errorInTraceroute = null;
//
//       LatencyToTracerouteCytoscapeService.getGraph().remove('node');
//       LatencyToTracerouteCytoscapeService.getGraph().remove('edge');
//
//
//       $http({
//         method: 'GET',
//         url: host,
//         params: {
//           'format': 'json',
//           'event-type': 'packet-trace',
//           // 'limit': 10,
//           // 'time-end': (Math.floor(Date.now() / 1000)),
//           'time-range': 604800,
//           'source': source,
//           'destination': destination
//         },
//         cache: true
//
//       }).then(function (response) {
//
//         var promises = [];
//
//         for (var i = 0; i < response.data.length; i++) {
//           var reversedResponse = response.data.reverse();
//           sourceAndDestinationList.push(
//             {
//               source: reversedResponse[i]['source'],
//               destination: reversedResponse[i]['destination'],
//               metadataKey: reversedResponse[i]['metadata-key']
//             }
//           );
//
//
//           if (LatencyToTracerouteCytoscapeService.getGraph().elements('node[id = "' + reversedResponse[i]['source'] + '"]').size() == 0) {
//
//             LatencyToTracerouteCytoscapeService.add_node(reversedResponse[i]['source'], true, reversedResponse[i]['source'], reversedResponse[i]['destination']);
//             nodeList.push(reversedResponse[i]['source']);
//
//             // Event
//             LatencyToTracerouteCytoscapeService.getGraph().on('tap', 'node[id = "' + reversedResponse[i]['source'] + '"]', function (event) {
//               var element = event.cyTarget;
//
//             });
//           }
//
//
//           for (var j = 0; j < reversedResponse[i]['event-types'].length; j++) {
//
//             if (reversedResponse[i]['event-types'][j]['event-type'] == 'packet-trace') {
//
//               var promise = $http({
//                 method: 'GET',
//                 url: reversedResponse[i]['url'] + "packet-trace/base",
//                 params: {
//                   'format': 'json',
//                   // 'limit': '2',
//                   // 'time-end': (Math.floor(Date.now() / 1000)),
//                   'time-range': 86400
//                   //48 Hours = 172800
//                   // 24 hours = 86400
//                 },
//                 cache: true
//               });
//
//               promises.push(promise);
//             }
//           }
//
//           //Retrieves the latest traceroute result
//           break;
//         }
//
//         return $q.all(promises);
//
//       }).then(function (response) {
//
//         // $log.debug("$q response length: " + response.length);
//         // $log.debug("sourceAndDestinationList length: " + response.length);
//
//
//         for (var i = 0; i < response.length; i++) {
//
//           var startNode = sourceAndDestinationList[i].source;
//           var destinationNode = sourceAndDestinationList[i].destination;
//           var metadataKey = sourceAndDestinationList[i].metadataKey;
//
//           // NOTE RESULTS MAY COME IN THIS FORM:
//           // {
//           //   "success": 0,
//           //   "ip": null,
//           //   "error_message": "requestTimedOut",
//           //   "mtu": null,
//           //   "rtt": null,
//           //   "ttl": "1",
//           //   "query": "1"
//           // },
//
//           var reversedResponse = response[i].data.reverse();
//
//           for (var j = 0; j < reversedResponse.length; j++) {
//             // $log.debug("reversedResponse Length: " + reversedResponse.length)
//             // $log.debug("ts : " + reversedResponse[j]['ts'])
//
//
//             // IP keeps appending and adding inside, without checking if it's unique. Unique at per iteration.
//             var temp_ip = [];
//             var temp_rtt = [];
//
//             for (var k = 0; k < reversedResponse[j]['val'].length; k++) {
//
//               if (reversedResponse[j]['val'][k]['success'] == 1) {
//
//
//                 if (reversedResponse[j]['val'][k]['query'] == 1) {
//                   temp_ip.push(reversedResponse[j]['val'][k]['ip']);
//                   temp_rtt.push(reversedResponse[j]['val'][k]['rtt']);
//                 }
//               } else {
//                 errorInTraceroute = true;
//               }
//
//             }
//
//
//             // Adding Nodes
//             for (var m = 0; m < temp_ip.length; m++) {
//               if (LatencyToTracerouteCytoscapeService.getGraph().elements('node[id = "' + temp_ip[m] + '"]').size() == 0) {
//
//                 // $log.debug("Node To Add: "+temp_ip[m] )
//                 LatencyToTracerouteCytoscapeService.add_node(temp_ip[m], false);
//                 nodeList.push(temp_ip[m]);
//
//                 //event
//                 LatencyToTracerouteCytoscapeService.getGraph().on('tap', 'node[id = "' + temp_ip[m] + '"]', function (event) {
//
//                 })
//
//               }
//             }
//
//             // Adding edges
//             for (var m = 0; m < temp_ip.length; m++) {
//               if (m != (temp_ip.length - 1 )) {
//
//                 // var edgeID = temp_ip[m] + "to" + temp_ip[m + 1];
//                 var edgeID = Math.random();
//
//                 if (LatencyToTracerouteCytoscapeService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {
//
//                   LatencyToTracerouteCytoscapeService.add_edge(edgeID, temp_ip[m], temp_ip[m + 1], temp_rtt[m], null, null, startNode, destinationNode, metadataKey);
//
//                   //event
//                   LatencyToTracerouteCytoscapeService.getGraph().on('tap', 'edge[id = "' + edgeID + '"]', function (event) {
//                     var element = event.cyTarget;
//                     //ID: element.id()
//                     //metadataKey: element.data().metadataKey
//
//                   });
//
//                 }
//               }
//
//
//             }
//
//
//             // Add Edge for main node
//             // var edgeID = startNode + "to" + reversedResponse[j]['val'][0]['ip'];
//             var edgeID = Math.random();
//
//             if (LatencyToTracerouteCytoscapeService.getGraph().elements('edge[id = "' + edgeID + '"]').size() == 0) {
//
//               LatencyToTracerouteCytoscapeService.add_edge(edgeID, startNode, reversedResponse[j]['val'][0]['ip'], temp_rtt[m], null, null, startNode, destinationNode, metadataKey);
//
//               LatencyToTracerouteCytoscapeService.getGraph().on('tap', 'edge[id = "' + edgeID + '"]', function (event) {
//                 var element = event.cyTarget;
//
//               });
//
//
//             }
//
//             // Break so that we grab only the latest traceroute path
//             break;
//           }
//
//         }
//
//
//         var nodeToIP_promises = [];
//         for (var i = 0; i < nodeList.length; i++) {
//           nodeToIP_promises.push(GeoIPNekudoService.getCountry(nodeList[i]));
//         }
//
//         return $q.all(nodeToIP_promises);
//
//       }).then(function (response) {
//         for (var i = 0; i < response.length; i++) {
//
//
//           var node = LatencyToTracerouteCytoscapeService.getGraph().elements('[id = "' + response[i].ip + '"]');
//           node.data({
//             label: response[i].ip + "\n" + response[i].city + ", " + response[i].countrycode
//           });
//
//           LatencyToTracerouteCytoscapeService.getGraph().layout({
//             name: 'breadthfirst',
//             fit: true, // whether to fit the viewport to the graph
//             directed: false, // whether the tree is directed downwards (or edges can point in any direction if false)
//             padding: 30, // padding on fit
//             circle: true, // put depths in concentric circles if true, put depths top down if false
//             spacingFactor: 1.0, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
//             boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
//             avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
//             roots: undefined, // the roots of the trees
//             maximalAdjustments: 0, // how many times to try to position the nodes in a maximal way (i.e. no backtracking)
//             animate: false, // whether to transition the node positions
//             animationDuration: 500, // duration of animation in ms if enabled
//             animationEasing: undefined, // easing of animation if enabled
//             ready: undefined, // callback on layoutready
//             stop: undefined // callback on layoutstop
//           });
//
//           if (errorInTraceroute == true) {
//             LatencyToTracerouteCytoscapeService.getGraph().elements('node[id = "' + sourceAndDestinationList[0].source + '"]').qtip
//             ({
//               content: {
//                 title: 'Error in Traceroute Results',
//                 text: 'Traceroute may be incomplete or inaccurate.',
//                 button: 'Close'
//
//               },
//               position: {my: 'bottom center', at: 'bottom top'},
//               show: {
//                 ready: true,
//
//                 cyBgOnly: false
//
//
//               },
//               hide: {},
//               style: {classes: 'qtip-bootstrap', tip: {width: 16, height: 8}}
//             });
//           }
//
//
//         }
//       }).catch(function (error) {
//         $log.debug("LatencyMetadataService:setTracerouteGraph()")
//         $log.debug("Server Response: " + error.status);
//
//       })
//
//     },
//
//
//     getSummaries: function () {
//
//       //$http
//
//     },
//     addMetadataList: function (metadata_key) {
//       metadataList.push(metadata_key);
//       return metadataList;
//     },
//     getMetadataList: function () {
//       return metadataList
//     },
//     setMetadata: function (metadata_key) {
//       metadata = metadata_key;
//       return metadata;
//     },
//     getMetadata: function () {
//       return metadata;
//     },
//
//     getGraph: function () {
//       return LatencyToTracerouteCytoscapeService.getGraph();
//     }
//
//     // getMainResult: function () {
//     //
//     //   return $http({
//     //     method: 'GET',
//     //     url: host,
//     //     params: {
//     //       'format': 'json',
//     //       'event-type': 'histogram-rtt'
//     //       // 'limit': 10,
//     //       // 'time-end': (Math.floor(Date.now() / 1000)),
//     //       // 'time-range': timeRange
//     //     },
//     //     cache: true
//     //   })
//     // },
//     //
//     // getIndividualResult: function (metadataURL, timeRange) {
//     //
//     //   return $http({
//     //     method: 'GET',
//     //     url: metadataURL + "packet-trace/base",
//     //     params: {
//     //       'format': 'json',
//     //       // 'limit': '2',
//     //       // 'time-end': (Math.floor(Date.now() / 1000)),
//     //       'time-range': timeRange
//     //       //48 Hours = 172800
//     //       // 24 hours = 86400
//     //       //604800 (7days).
//     //     },
//     //     cache: true
//     //   });
//     // },
//     //
//     // clearCache: function () {
//     //   $cacheFactory.get('$http').removeAll();
//     //   $log.debug("TracerouteResultsService:clearCache() Cache Cleared");
//     // },
//     //
//     // setMainResult_JSON: function (mainResult) {
//     //   retrievedMainResult = mainResult;
//     // },
//     // getMainResult_JSON: function () {
//     //   return retrievedMainResult;
//     // }
//
//
//   };
//
//
// }]);


// tracerouteServices.factory('TracerouteResultsService', ['$http', '$q', '$cacheFactory', '$log', 'HostService', function ($http, $q, $log, $cacheFactory, HostService) {
//
//
//   // cache http://stackoverflow.com/questions/21660647/angular-js-http-cache-time
//   var host = HostService.getHost();
//
//   return {
//
//     getMainResult: function () {
//
//       return $http({
//         method: 'GET',
//         url: host,
//         params: {
//           'format': 'json',
//           'event-type': 'packet-trace'
//           // 'limit': 10,
//           // 'time-end': (Math.floor(Date.now() / 1000)),
//           // 'time-range': timeRange
//         },
//         cache: true
//       })
//     },
//
//     getIndividualResult: function (metadataURL, timeRange) {
//
//       return $http({
//         method: 'GET',
//         url: metadataURL + "packet-trace/base",
//         params: {
//           'format': 'json',
//           // 'limit': '2',
//           // 'time-end': (Math.floor(Date.now() / 1000)),
//           'time-range': timeRange
//           //48 Hours = 172800
//           // 24 hours = 86400
//           //604800 (7days).
//         },
//         cache: true
//       });
//     },
//
//     clearCache: function () {
//       $cacheFactory.get('$http').removeAll();
//       $log.debug("TracerouteResultsService:clearCache() Cache Cleared");
//     }
//
//
//   };
//
//
// }]);
//

// NOT USING ANYTHING BELOW HERE


tracerouteServices.factory('CytoscapeService', [function () {

  var cy = cytoscape({
    container: document.getElementById('traceroute_noduplicate'),

    style: [
      {
        selector: 'node',
        style: {
          'height': 20,
          'width': 20,
          'background-color': '#30c9bc',
          'label': 'data(id)'
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 3,
          'opacity': 0.8,
          // 'label': 'data(id)',
          'line-color': '#a8ea00',
          'target-arrow-color': 'black',
          'target-arrow-shape': 'triangle'
        }
      }
    ]

    // Layout can only be done in Controller.


  });


  return {
    add_node: function (ID, main, startNode, endNode) {
      var mainNode;


      if (main == true) {
        mainNode = "true";
      } else {
        mainNode = "false";
      }

      var node = {
        group: 'nodes',
        // 'nodes' for a node, 'edges' for an edge
        // NB the group field can be automatically inferred for you but specifying it
        // gives you nice debug messages if you mis-init elements

        // NB: id fields must be strings or numbers
        data: {
          // element data (put dev data here)
          // mandatory for each element, assigned automatically on undefined
          id: ID,
          mainNode: mainNode,
          startNode: 0,
          endNode: 0

          // parent: 'nparent', // indicates the compound node parent id; not defined => no parent
        }


        // scratchpad data (usually temp or nonserialisable data)
        // scratch: {
        //   foo: 'bar'
        // },
        //
        // position: { // the model position of the node (optional on init, mandatory after)
        //   x: 100,
        //   y: 100
        // },
        //
        // selected: false, // whether the element is selected (default false)
        //
        // selectable: true, // whether the selection state is mutable (default true)
        //
        // locked: false, // when locked a node's position is immutable (default false)
        //
        // grabbable: true // whether the node can be grabbed and moved by the user

        // class: 'mainNode'// a space separated list of class names that the element has
      };

      // console.log("Node ID: " + ID + " created.");


      cy.add(node);
      return cy;
    },

    add_edge: function (ID, source, target, bandwidth, latency) {

      var edge = {
        group: 'edges',
        data: {
          id: ID,
          // inferred as an edge because `source` and `target` are specified:
          source: source, // the source node id (edge comes from this node)
          target: target,  // the target node id (edge goes to this node)
          bandwidth: bandwidth,
          latency: latency
        }
      };
      // console.log("Edge ID: " + ID + " Source: " + source + " Target: " + target + " created.");
      //return edge;

      cy.add(edge);
      return cy;
    },

    update_node: function (ID, data) {
      // cy.elements('node[id = "' + ID + '"]')
      var element = cy.getElementById(ID);
      element.data(data);
      return cy;
    },

    update_edge: function (ID, data) {

      // cy.elements('edge[id = "' + ID + '"]')
      var element = cy.getElementById(ID);
      element.data(data);
      return cy;
    },

    setLayout: function (selector) {

      cy.style()
      // .selector('#203.30.39.127')
      // .selector(':selected')
      // .selector('[id = "203.30.39.127"]')
        .selector('node[mainNode = "true"]')
        .style({
          'background-color': 'black'
        }).update();

      return cy;
    },

    getGraph: function () {
      return cy;
    }
  }


}]);


tracerouteServices.factory('CytoscapeService_Bandwidth', [function () {

  // Key Differences
  // 1. Edge ID is unique, Math.random()

  var cy = cytoscape({
    container: document.getElementById('cytoscape_bandwidth'),

    style: [
      {
        selector: 'node',
        style: {
          'height': 20,
          'width': 20,
          'background-color': '#30c9bc',
          'label': 'data(label)'
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 2,
          'opacity': 0.8,
          'label': 'data(bandwidth)',
          'line-color': 'GreenYellow',
          'target-arrow-color': 'black',
          // tee, triangle, triangle-tee, triangle-backcurve, square, circle, diamond, or none
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: '.multiline-manual',
        style: {
          'text-wrap': 'wrap'
        }
      }
    ]

    // Layout can only be done in Controller.
  });


  return {
    add_node: function (ID, main, startNode, endNode) {
      var mainNode;


      if (main == true) {
        mainNode = "true";
      } else {
        mainNode = "false";
      }

      var node = {
        group: 'nodes',
        // 'nodes' for a node, 'edges' for an edge
        // NB the group field can be automatically inferred for you but specifying it
        // gives you nice debug messages if you mis-init elements

        // NB: id fields must be strings or numbers
        data: {
          // element data (put dev data here)
          // mandatory for each element, assigned automatically on undefined
          id: ID,
          mainNode: mainNode,
          startNode: 0,
          endNode: 0,
          country: null,
          city: null,
          label: ID

          // parent: 'nparent', // indicates the compound node parent id; not defined => no parent
        },
        classes: 'multiline-manual'// a space separated list of class names that the element has


        // scratchpad data (usually temp or nonserialisable data)
        // scratch: {
        //   foo: 'bar'
        // },
        //
        // position: { // the model position of the node (optional on init, mandatory after)
        //   x: 100,
        //   y: 100
        // },
        //
        // selected: false, // whether the element is selected (default false)
        //
        // selectable: true, // whether the selection state is mutable (default true)
        //
        // locked: false, // when locked a node's position is immutable (default false)
        //
        // grabbable: true // whether the node can be grabbed and moved by the user


      };

      // console.log("Node ID: " + ID + " created.");


      cy.add(node);
      return cy;
    },

    add_edge: function (ID, source, target, tracerouteRTT, bandwidth, latency, startNode, endNode, metadataKey) {


      var edge = {
        group: 'edges',
        data: {
          id: ID,
          // inferred as an edge because `source` and `target` are specified:
          source: source, // the source node id (edge comes from this node)
          target: target,  // the target node id (edge goes to this node)
          rtt: tracerouteRTT,
          bandwidth: bandwidth,
          latency: latency,
          startNode: startNode,
          endNode: endNode,
          metadataKey: metadataKey
        }
      };
      // console.log("Edge ID: " + ID + " Source: " + source + " Target: " + target + " created.");
      //return edge;

      cy.add(edge);
      return cy;
    },

    update_node: function (ID, data) {
      // cy.elements('node[id = "' + ID + '"]')
      var element = cy.getElementById(ID);
      element.data(data);
      return cy;
    },

    update_edge: function (ID, data) {

      // cy.elements('edge[id = "' + ID + '"]')
      var element = cy.getElementById(ID);
      element.data(data);
      return cy;
    },

    setLayout: function (selector) {

      cy.style()
      // .selector('#203.30.39.127')
      // .selector(':selected')
      // .selector('[id = "203.30.39.127"]')
        .selector(selector)
        .style({
          'line-color': 'blue',
        }).update();

      return cy;
    },

    getGraph: function () {
      return cy;
    }
  }


}]);

//
// tracerouteServices.factory('TracerouteMainResult_URL', ['$resource', function ($resource) {
//
//   // Calls the main result page.
//   // url : "http://ps2.jp.apan.net/esmond/perfsonar/archive/0a468985ca8b41029a22ae4e4645f869/"
//   // metadata-key : "0a468985ca8b41029a22ae4e4645f869"
//   // subject-type : "point-to-point"
//   // event-types
//   // source : "203.30.39.127"
//   // destination : "137.189.192.25"
//   // measurement-agent : "203.30.39.127"
//   // tool-name : "bwctl/tracepath"
//   // input-source : "203.30.39.127"
//   // input-destination : "ps1.itsc.cuhk.edu.hk"
//   // time-interval : "600"
//   // ip-transport-protocol : "icmp"
//   // ip-packet-size : "40"
//   // uri : "/esmond/perfsonar/archive/0a468985ca8b41029a22ae4e4645f869/"
//   // metadata-count-total : 23
//   // metadata-previous-page : null
//   // metadata-next-page : null
//
//
//   // https://docs.angularjs.org/api/ngResource/service/$resource
//   return $resource(tracerouteResultURL, {}, {
//
//     list: {
//       method: 'GET',
//       params: {'format': 'json', 'event-type': 'packet-trace'},
//       isArray: true
//     }
//
//   });
//
// }]);
// tracerouteServices.factory('TracerouteMainResults', ['$resource', function ($resource) {
//
//   // Calls the main result page.
//   // url : "http://ps2.jp.apan.net/esmond/perfsonar/archive/0a468985ca8b41029a22ae4e4645f869/"
//   // metadata-key : "0a468985ca8b41029a22ae4e4645f869"
//   // subject-type : "point-to-point"
//   // event-types
//   // source : "203.30.39.127"
//   // destination : "137.189.192.25"
//   // measurement-agent : "203.30.39.127"
//   // tool-name : "bwctl/tracepath"
//   // input-source : "203.30.39.127"
//   // input-destination : "ps1.itsc.cuhk.edu.hk"
//   // time-interval : "600"
//   // ip-transport-protocol : "icmp"
//   // ip-packet-size : "40"
//   // uri : "/esmond/perfsonar/archive/0a468985ca8b41029a22ae4e4645f869/"
//   // metadata-count-total : 23
//   // metadata-previous-page : null
//   // metadata-next-page : null
//
//
//   // https://docs.angularjs.org/api/ngResource/service/$resource
//   return $resource(tracerouteResultURL, {}, {
//
//     list: {
//       method: 'GET',
//       params: {'format': 'json', 'event-type': 'packet-trace'},
//       isArray: true
//     }
//
//   });
//
// }]);
//
//
// tracerouteServices.factory('TracerouteIndividualResults', ['$resource', function ($resource) {
//
//   // Calls the individual test containing various hops.
//
//   //URL Format
//   // 'http://hpc-perfsonar.usc.edu/esmond/perfsonar/archive/123AAAAAAA/packet-trace/base'
//   // substitute 123AAAA with :metadata_key, similar to parameters
//
//   return $resource(tracerouteResultIndividualURL, {}, {
//     get: {
//       method: 'GET',
//       params: {'format': 'json'},
//       isArray: true
//     }
//
//
//   });
//
// }]);
//
