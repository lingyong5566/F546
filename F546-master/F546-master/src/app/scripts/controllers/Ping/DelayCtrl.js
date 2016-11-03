/*
 This Controller sets up OW Delay
 */
var onewaydelay = angular.module('onewaydelay',[]);
var app = angular.module('onewaydelay', []);

app.controller('DelayCtrl',["$scope","$http",'myService', function($scope, $http, myService) {

  // Do a loop, retrieve all metakeys involving owdelay and do a retrieve data for each metakey
  time = 3600;
  currentMetakey = [];
  source = [];
  destination = [];
  var fullDataList = [];
  $scope.fullDataList = []
  respLength = 0;
  var mainUrl = "http://ps2.jp.apan.net/esmond/perfsonar/archive/?event-type=histogram-owdelay";
  $http.get(mainUrl)
    .then(function(response){
      //console.log(response.data.length); // 44 entries
      //for(i = 0;i<response.data.length;i++)
      respLength = response.data.length;
      for(i = 0;i<response.data.length;i++){
        //console.log("hey1");
        //console.log(response.data[i]['val']['standard-deviation']);


        currentMetakey[i] = response.data[i]['metadata-key'];
        source[i] = response.data[i]['input-source'];
        destination[i] = response.data[i]['input-destination'];


        /*$http.get("http://ps2.jp.apan.net/esmond/perfsonar/archive/"+currentMetakey[i]+"/histogram-owdelay/statistics/3600?format=json")
          .then(function(response1) {
            //$scope.myWelcome = response.data;
            $scope.num1 = response1.data.length;
            //console.log("hey2");
            console.log(response1.data);
            //var sdList = new Array();
            //for(j = 0;j<response1.data.length;j++)


            //$scope.sdList = sdList;

          });
*/

      }


      }
    ).then(function(resp) {
    var promiseIndex = 0;
    for(i = 0;i<respLength;i++){

      //var deferred = $q.defer();

      console.log(currentMetakey[i]);
      var curURL = "http://ps2.jp.apan.net/esmond/perfsonar/archive/" + currentMetakey[i] + "/histogram-owdelay/statistics/3600?format=json";
      //console.log(curURL);
      //console.log(myService.getData(curURL));

      var promise = $http.get(curURL);
      // Problems: Request does not finish and assigned null values to array.
      // Solution: Index in the response scope so that it get updated AFTER it gets data.
      // Attempts to resolve then function exiting before completion.
      promise.then(function(resp) {
        for (j = 0; j < resp.data.length; j++) {
          //console.log("hey3");
          //console.log(response1.data[j]['val']['standard-deviation']); OK
          resp.data[j]['val']['standard-deviation'] = math.round(resp.data[j]['val']['standard-deviation'], 3);
          resp.data[j]['val']['variance'] = math.round(resp.data[j]['val']['variance'], 3);
          resp.data[j]['val']['mean'] = math.round(resp.data[j]['val']['mean'], 3);

        }
        console.log("resp1 " + promiseIndex + "= " + resp.data);
        fullDataList[promiseIndex] = resp.data;
        console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
        console.log("fulldataList = " + fullDataList);
        $scope.fullDataList = fullDataList;
        promiseIndex = promiseIndex + 1;

      });
      /*myService.getData(curURL).then(
        function (resp) {

      )*/
    }
    $scope.currentMetakey = currentMetakey;
    $scope.source = source;
    $scope.destination = destination;
    //$scope.fullData = response.data;
    console.log("scope = "+$scope.fullDataList);
    console.log("[0] = "+fullDataList[0]);
    console.log("whole = "+fullDataList);

  });





  // Custom metakey for data
  /*$http.get("http://ps2.jp.apan.net/esmond/perfsonar/archive/6c57058235314ddaa9fe49ba898c1ce5/histogram-owdelay/statistics/3600")
    .then(function(response) {
      //$scope.myWelcome = response.data;
      $scope.num1 = response.data.length;

      //var sdList = new Array();
      for(i = 0;i<response.data.length;i++) {
        //console.log("hey")
        //console.log(response.data[i]['val']['standard-deviation']);
        response.data[i]['val']['standard-deviation'] = math.round(response.data[i]['val']['standard-deviation'],3);
        response.data[i]['val']['variance'] = math.round(response.data[i]['val']['variance'],3);
        response.data[i]['val']['mean'] = math.round(response.data[i]['val']['mean'],3);

      }
      $scope.fullData = response.data;
      //$scope.sdList = sdList;
    });*/
}]);

app.factory('myService', function($http) {

  var getData = function(curUrl) {

    // Angular $http() and then() both return promises themselves
    return $http.get(curUrl)
      .then(function(result){
      console.log("getting data");
      // What we return here is the data that will be accessible
      // to us after the promise resolves
      return result.data;
    });
  };


  return { getData: getData };
});
  /*angular.module('ping').controller('DelayCtrl', ['$scope', '$http', '$q', '$log', '$interval', 'HostService','LatencyResultsService', 'UnixTimeConverterService', 'GeoIPNekudoService', 'UniqueArrayService',  'AnalyzeLatency', 'CurrentTimeUnixService', 'DNSLookup', 'toastr', function ($scope, $http, $q, $log, $interval, HostService, LatencyResultsService, UnixTimeConverterService, GeoIPNekudoService, UniqueArrayService, AnalyzeLatency, CurrentTimeUnixService, DNSLookup, toastr) {

  //loadLatencyGraph();
  loadTable();
  // Set up interval to auto load every 30 minutes
  //$interval(function () {

    //Call this again every 30 minutes
    //loadLatencyGraph();

  //}, 30 * 60 * 1000);

  function loadTable() {

    LatencyResultsService.getMainResult({
      'format': 'json',
      'event-type': 'histogram-rtt',
      // 'limit': 10,
      // 'time-end': (Math.floor(Date.now() / 1000)),
      'time-range': 86400
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
      }})

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
      })}
  }

  function loadLatencyGraph() {

    var sourceAndDestinationList;
    var nodeToIPList;

    LatencyResultsService.getMainResult({
      'format': 'json',
      'event-type': 'histogram-rtt',
      // 'limit': 10,
      // 'time-end': (Math.floor(Date.now() / 1000)),
      'time-range': 86400
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
                 $log.debug("LATENCY URL: "+ latencyURL)

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




  $scope.mainGraphSearchNodeKeypress = function () {
    if (keyEvent.which === 13) {
      // $log.debug("Node Search: " + IPAddr);
      LatencyGraphService.getGraph().fit('node[id = "' + IPAddr.trim() + '"]');
    }
  }

}]);
angular.module('traceroute').controller('IndividualLatencyGraphCtrl', ['$scope', '$http', '$q', '$log', 'HostService', 'LatencyGraphService', 'UnixTimeConverterService', function ($scope, $http, $q, $log, HostService, LatencyGraphService, UnixTimeConverterService) {


}]);


// Empty Module
angular.module('traceroute').controller('LatencyInformation', ['$scope', '$http', '$q', '$log', 'HostService', 'LatencyGraphService', 'UnixTimeConverterService', function ($scope, $http, $q, $log, HostService, LatencyGraphService, UnixTimeConverterService) {


  $scope.showMe = function () {
    $scope.show = true;
  }


}]);*/
