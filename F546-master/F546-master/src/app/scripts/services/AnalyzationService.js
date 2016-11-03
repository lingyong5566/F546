/**
 * Created by Nazri on 18/7/16.
 */

// Purpose: Network Analyzation
// Each new change, hard to tell, list the differences.
// Consider: https://github.com/jmdobry/angular-cache

//http://status.sgaf.org.sg/traceSG-US.html

var analyzationService = angular.module('AnalyzationServices', ['GeneralServices', 'TracerouteServices']);

analyzationService.factory('AnalyzeTracerouteRtt', ['$http', '$q', '$log', 'HostService', 'UnixTimeConverterService', 'DNSLookup', function ($http, $q, $log, HostService, UnixTimeConverterService, DNSLookup) {

  var maxDate = Number.MIN_VALUE;
  var minDate = Number.MAX_VALUE;

  // var host = HostService.getHost();
  var sourceAndDestinationList;

  // function uniquePathWebWorker(uniquePaths, trToCompare) {
  //   // returns true if additional paths found/
  //   // False if no additional path.
  //
  //   var toReturn = false;
  //   for (var j = 0; j < uniquePaths.length; j++) {
  //
  //     if ((uniquePaths[j]) !== (trToCompare).toString()) {
  //       toReturn = true;
  //       break;
  //     }
  //
  //   }
  //
  //   return toReturn;
  // }


  return {

    // getAnalyzation: function () {
    //   // For each TR result, calculate last 7 days of average min RTT, mean RTT, std deviation RTT
    //
    //   sourceAndDestinationList = [];
    //
    //   var analyzedTRList = TracerouteResultsService.getMainResult().then(function (response) {
    //
    //     $log.debug("AnalyzationServices:AnalyzeTraceroute:getAnalyzation() -> Main Response: " + response.data.length)
    //
    //     var promises = [];
    //
    //     for (var i = 0; i < response.data.length; i++) {
    //
    //       sourceAndDestinationList.push(
    //         {
    //           source: response.data[i]['source'],
    //           destination: response.data[i]['destination']
    //         }
    //       );
    //
    //
    //       for (var j = 0; j < response.data[i]['event-types'].length; j++) {
    //         if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {
    //
    //           var promise = TracerouteResultsService.getIndividualResult(response.data[i]['url'], 604800);
    //           promises.push(promise);
    //
    //         }
    //       }
    //
    //       // analyzeResults(promises, source, destination);
    //
    //     }
    //
    //
    //     return $q.all(promises);
    //
    //   }).then(function (response) {
    //
    //     $log.debug("AnalyzationServices:AnalyzeTraceroute:getAnalyzation() -> Start of second .then response");
    //
    //     var nodeAndRttList_CalculatedData = [];
    //     var nodeAndRttList_RawData = [];
    //
    //     var startDate;
    //     var endDate;
    //
    //
    //     for (var i = 0; i < response.length; i++) {
    //
    //       $log.debug("Source: " + sourceAndDestinationList[i]['source']);
    //       $log.debug("Destination: " + sourceAndDestinationList[i]['destination']);
    //
    //       // Checking for 'active' servers
    //       if (response[i].data.length > 1) {
    //
    //         for (var k = 0; k < response[i].data.length; k++) {
    //
    //           var ts = response[i].data[k]['ts'];
    //
    //           for (var l = 0; l < response[i].data[k]['val'].length; l++) {
    //
    //             var IPAddr = response[i].data[k]['val'][l]['ip'];
    //             var rtt = response[i].data[k]['val'][l]['rtt'];
    //             var IPExist = false;
    //
    //             // Check if the IP Address already exist in the list.
    //             for (var j = 0; j < nodeAndRttList_RawData.length; j++) {
    //
    //               //IP Address Exist. Append new rtt value.
    //               if (nodeAndRttList_RawData[j]['IP'] == IPAddr) {
    //                 IPExist = true;
    //                 nodeAndRttList_RawData[j]['rtt'].push(rtt);
    //               }
    //             }
    //
    //             if (IPExist == false) {
    //
    //               var newNode = {
    //                 //source: xx,
    //                 //destination: xx
    //                 IP: IPAddr,
    //                 rtt: [rtt],
    //                 date: [ts]
    //               }
    //
    //               nodeAndRttList_RawData.push(newNode);
    //             }
    //           }
    //         }
    //
    //
    //       }
    //     }
    //
    //     //Calculating Mean, Min and Std Deviation.
    //     for (var i = 0; i < nodeAndRttList_RawData.length; i++) {
    //
    //       nodeAndRttList_CalculatedData.push(
    //         {
    //           source: 0,
    //           destination: 0,
    //           nodes: {
    //             ip: nodeAndRttList_RawData[i]['IP'],
    //             rttAvg: math.mean(nodeAndRttList_RawData[i]['rtt']),
    //             rttMin: math.number(math.min(nodeAndRttList_RawData[i]['rtt'])),
    //             rttStd: math.std(nodeAndRttList_RawData[i]['rtt']),
    //             startDate: math.number(math.min(nodeAndRttList_RawData[i]['date'])),
    //             endDate: math.number(math.max(nodeAndRttList_RawData[i]['date']))
    //           }
    //         }
    //       );
    //
    //     }
    //
    //     return nodeAndRttList_CalculatedData;
    //
    //   }).catch(function (error) {
    //     console.log("AnalyzationServices:AnalyzeTraceroute:getAnalyzation() -> Error: " + error);
    //   });
    //
    //   return analyzedTRList;
    //
    //
    // },

    getAnalysis: function (individual_traceroute_results) {
      // Takes an array of individual traceroute results, and process it.
      // $log.debug("AnalyzeTraceroute:analyzeRtt() START");

      var nodeAndRttList_CalculatedData = [];
      var nodeAndRttList_RawData = [];


      for (var k = 0; k < individual_traceroute_results.length; k++) {

        var ts = individual_traceroute_results[k]['ts'];


        if (ts > maxDate) {
          maxDate = ts;
        } else if (ts < minDate) {
          minDate = ts
        }

        for (var l = 0; l < individual_traceroute_results[k]['val'].length; l++) {


          //What about Query 1,2,3?
          if (individual_traceroute_results[k]['val'][l]['success'] == 1) {

            var IPAddr = individual_traceroute_results[k]['val'][l]['ip'];
            var rtt = individual_traceroute_results[k]['val'][l]['rtt'];
            var IPExist = false;

            // Check if the IP Address already exist in the list.
            for (var j = 0; j < nodeAndRttList_RawData.length; j++) {

              //IP Address Exist. Append new rtt value.
              if (nodeAndRttList_RawData[j]['IP'] == IPAddr) {
                IPExist = true;
                nodeAndRttList_RawData[j]['rtt'].push(rtt);
                nodeAndRttList_RawData[j]['date'].push(ts)
              }
            }

            if (IPExist == false) {

              //IP Does not exist.


              var newNode = {
                IP: IPAddr,
                rtt: [rtt],
                date: [ts],
                dns: DNSLookup.getDomain(IPAddr).dns
              }

              nodeAndRttList_RawData.push(newNode);
            }

          }

        }
      }


      //Calculating Mean, Min and Std Deviation.
      for (var i = 0; i < nodeAndRttList_RawData.length; i++) {

        var rrtResult = nodeAndRttList_RawData[i]['rtt'][0];
        var rttMean = math.mean(nodeAndRttList_RawData[i]['rtt']);
        var rttStdDev = math.std(nodeAndRttList_RawData[i]['rtt']);
        var rrtStatus = false;


        if (rrtResult >= (rttMean + rttStdDev) || rrtResult <= (rttMean - rttStdDev)) {
          rrtStatus = true;
        }


        nodeAndRttList_CalculatedData.push(
          {
            ip: nodeAndRttList_RawData[i]['IP'],
            dns: nodeAndRttList_RawData[i]['dns'],
            // dns: "",
            rtt: rrtResult,
            rttAvg: math.round(rttMean, 4),
            rttMin: math.number(math.min(nodeAndRttList_RawData[i]['rtt'])),
            rttStd: math.round(rttStdDev, 4),
            // startDate: math.number(math.min(nodeAndRttList_RawData[i]['date'])),
            // endDate: math.number(math.max(nodeAndRttList_RawData[i]['date']))
            //DATE MIGHT BE POSSIBLY WRONG
            startDate: UnixTimeConverterService.getDate(math.number(math.min(nodeAndRttList_RawData[i]['date']))),
            endDate: UnixTimeConverterService.getDate(math.number(math.max(nodeAndRttList_RawData[i]['date']))),
            startTime: UnixTimeConverterService.getTime(math.number(math.min(nodeAndRttList_RawData[i]['date']))),
            endTime: UnixTimeConverterService.getTime(math.number(math.max(nodeAndRttList_RawData[i]['date']))),
            status: rrtStatus

          }
        );

      }

      // return nodeAndRttList_CalculatedData;
      return [nodeAndRttList_CalculatedData, minDate, maxDate];

    }

    // getMinMaxDate: function (individual_traceroute_results) {
    //
    //   //TODO: Due to the sheer amount of data, double for loops increases the processing time exponentially.
    //
    //
    //   for (var i = 0; i < individual_traceroute_results.length; i++) {
    //
    //     var ts = individual_traceroute_results[i]['ts'];
    //     console.log("TS: " + ts)
    //
    //     if (ts > maxDate) {
    //       maxDate = ts;
    //     } else if (ts < minDate) {
    //       minDate = ts
    //     }
    //
    //   }
    //
    //   return [minDate, maxDate]
    // }
  };


}]);

analyzationService.factory('AnalyzeTraceroutePath', ['$http', '$q', '$log', 'HostService', 'UnixTimeConverterService', function ($http, $q, $log, HostService, UnixTimeConverterService) {

  var maxDate = Number.MIN_VALUE;
  var minDate = Number.MAX_VALUE;

  // var host = HostService.getHost();
  var sourceAndDestinationList;

  // function uniquePathWebWorker(uniquePaths, trToCompare) {
  //   // returns true if additional paths found/
  //   // False if no additional path.
  //
  //   var toReturn = false;
  //   for (var j = 0; j < uniquePaths.length; j++) {
  //
  //     if ((uniquePaths[j]) !== (trToCompare).toString()) {
  //       toReturn = true;
  //       break;
  //     }
  //
  //   }
  //
  //   return toReturn;
  // }

  // function uniquePathWebWorker(traceroutePaths) {
  //   console.log("WEB WORKER STARTS");
  //   var indexesOfError = [];
  //   var uniquePaths = [];
  //
  //   for (var i = 0; i < traceroutePaths.length; i++) {
  //
  //
  //     if (uniquePaths.length == 0) {
  //       // uniquePaths.push(JSON.stringify(traceroutePaths[i]));
  //
  //       uniquePaths.push(traceroutePaths[i]);
  //     }
  //
  //     if (uniquePaths.length > 0) {
  //       for (var j = 0; j < uniquePaths.length; j++) {
  //
  //
  //         for (var k = 0; k < uniquePaths[j].length; k++) {
  //
  //           if (uniquePaths[j][k] != traceroutePaths[i][k]) {
  //             uniquePaths.push(traceroutePaths[i]);
  //             indexesOfError.push(i);
  //           }
  //
  //         }
  //
  //         // var trString = JSON.stringify(traceroutePaths[i]);
  //         // if (uniquePaths !== trString) {
  //         //   uniquePaths.push(trString);
  //         //   indexesOfError.push(i);
  //         // }
  //
  //
  //       }
  //
  //     }
  //
  //
  //   }
  //
  //   return [uniquePaths, indexesOfError];
  // }
  //
  // var myWorker = Webworker.create(uniquePathWebWorker);

  return {

    // getAnalyzation: function () {
    //   // For each TR result, calculate last 7 days of average min RTT, mean RTT, std deviation RTT
    //
    //   sourceAndDestinationList = [];
    //
    //   var analyzedTRList = TracerouteResultsService.getMainResult().then(function (response) {
    //
    //     $log.debug("AnalyzationServices:AnalyzeTraceroute:getAnalyzation() -> Main Response: " + response.data.length)
    //
    //     var promises = [];
    //
    //     for (var i = 0; i < response.data.length; i++) {
    //
    //       sourceAndDestinationList.push(
    //         {
    //           source: response.data[i]['source'],
    //           destination: response.data[i]['destination']
    //         }
    //       );
    //
    //
    //       for (var j = 0; j < response.data[i]['event-types'].length; j++) {
    //         if (response.data[i]['event-types'][j]['event-type'] == 'packet-trace') {
    //
    //           var promise = TracerouteResultsService.getIndividualResult(response.data[i]['url'], 604800);
    //           promises.push(promise);
    //
    //         }
    //       }
    //
    //       // analyzeResults(promises, source, destination);
    //
    //     }
    //
    //
    //     return $q.all(promises);
    //
    //   }).then(function (response) {
    //
    //     $log.debug("AnalyzationServices:AnalyzeTraceroute:getAnalyzation() -> Start of second .then response");
    //
    //     var nodeAndRttList_CalculatedData = [];
    //     var nodeAndRttList_RawData = [];
    //
    //     var startDate;
    //     var endDate;
    //
    //
    //     for (var i = 0; i < response.length; i++) {
    //
    //       $log.debug("Source: " + sourceAndDestinationList[i]['source']);
    //       $log.debug("Destination: " + sourceAndDestinationList[i]['destination']);
    //
    //       // Checking for 'active' servers
    //       if (response[i].data.length > 1) {
    //
    //         for (var k = 0; k < response[i].data.length; k++) {
    //
    //           var ts = response[i].data[k]['ts'];
    //
    //           for (var l = 0; l < response[i].data[k]['val'].length; l++) {
    //
    //             var IPAddr = response[i].data[k]['val'][l]['ip'];
    //             var rtt = response[i].data[k]['val'][l]['rtt'];
    //             var IPExist = false;
    //
    //             // Check if the IP Address already exist in the list.
    //             for (var j = 0; j < nodeAndRttList_RawData.length; j++) {
    //
    //               //IP Address Exist. Append new rtt value.
    //               if (nodeAndRttList_RawData[j]['IP'] == IPAddr) {
    //                 IPExist = true;
    //                 nodeAndRttList_RawData[j]['rtt'].push(rtt);
    //               }
    //             }
    //
    //             if (IPExist == false) {
    //
    //               var newNode = {
    //                 //source: xx,
    //                 //destination: xx
    //                 IP: IPAddr,
    //                 rtt: [rtt],
    //                 date: [ts]
    //               }
    //
    //               nodeAndRttList_RawData.push(newNode);
    //             }
    //           }
    //         }
    //
    //
    //       }
    //     }
    //
    //     //Calculating Mean, Min and Std Deviation.
    //     for (var i = 0; i < nodeAndRttList_RawData.length; i++) {
    //
    //       nodeAndRttList_CalculatedData.push(
    //         {
    //           source: 0,
    //           destination: 0,
    //           nodes: {
    //             ip: nodeAndRttList_RawData[i]['IP'],
    //             rttAvg: math.mean(nodeAndRttList_RawData[i]['rtt']),
    //             rttMin: math.number(math.min(nodeAndRttList_RawData[i]['rtt'])),
    //             rttStd: math.std(nodeAndRttList_RawData[i]['rtt']),
    //             startDate: math.number(math.min(nodeAndRttList_RawData[i]['date'])),
    //             endDate: math.number(math.max(nodeAndRttList_RawData[i]['date']))
    //           }
    //         }
    //       );
    //
    //     }
    //
    //     return nodeAndRttList_CalculatedData;
    //
    //   }).catch(function (error) {
    //     console.log("AnalyzationServices:AnalyzeTraceroute:getAnalyzation() -> Error: " + error);
    //   });
    //
    //   return analyzedTRList;
    //
    //
    // },
    //
    // analyzeRtt: function (individual_traceroute_results) {
    //   // Takes an array of individual traceroute results, and process it.
    //   // $log.debug("AnalyzeTraceroute:analyzeRtt() START");
    //
    //   var nodeAndRttList_CalculatedData = [];
    //   var nodeAndRttList_RawData = [];
    //
    //
    //   for (var k = 0; k < individual_traceroute_results.length; k++) {
    //
    //     var ts = individual_traceroute_results[k]['ts'];
    //
    //
    //     if (ts > maxDate) {
    //       maxDate = ts;
    //     } else if (ts < minDate) {
    //       minDate = ts
    //     }
    //
    //     for (var l = 0; l < individual_traceroute_results[k]['val'].length; l++) {
    //
    //
    //       //What about Query 1,2,3?
    //       if (individual_traceroute_results[k]['val'][l]['success'] == 1) {
    //
    //         var IPAddr = individual_traceroute_results[k]['val'][l]['ip'];
    //         var rtt = individual_traceroute_results[k]['val'][l]['rtt'];
    //         var IPExist = false;
    //
    //         // Check if the IP Address already exist in the list.
    //         for (var j = 0; j < nodeAndRttList_RawData.length; j++) {
    //
    //           //IP Address Exist. Append new rtt value.
    //           if (nodeAndRttList_RawData[j]['IP'] == IPAddr) {
    //             IPExist = true;
    //             nodeAndRttList_RawData[j]['rtt'].push(rtt);
    //             nodeAndRttList_RawData[j]['date'].push(ts)
    //           }
    //         }
    //
    //         if (IPExist == false) {
    //
    //           var newNode = {
    //             IP: IPAddr,
    //             rtt: [rtt],
    //             date: [ts]
    //           }
    //
    //           nodeAndRttList_RawData.push(newNode);
    //         }
    //
    //       }
    //
    //     }
    //   }
    //
    //
    //   //Calculating Mean, Min and Std Deviation.
    //   for (var i = 0; i < nodeAndRttList_RawData.length; i++) {
    //
    //     var rrtResult = nodeAndRttList_RawData[i]['rtt'][0];
    //     var rttMean = math.mean(nodeAndRttList_RawData[i]['rtt']);
    //     var rttStdDev = math.std(nodeAndRttList_RawData[i]['rtt']);
    //     var rrtStatus = false;
    //
    //
    //     if (rrtResult >= (rttMean + rttStdDev) || rrtResult <= (rttMean - rttStdDev)) {
    //       rrtStatus = true;
    //     }
    //
    //
    //     nodeAndRttList_CalculatedData.push(
    //       {
    //         ip: nodeAndRttList_RawData[i]['IP'],
    //         rtt: rrtResult,
    //         rttAvg: math.round(rttMean, 4),
    //         rttMin: math.number(math.min(nodeAndRttList_RawData[i]['rtt'])),
    //         rttStd: math.round(rttStdDev, 4),
    //         // startDate: math.number(math.min(nodeAndRttList_RawData[i]['date'])),
    //         // endDate: math.number(math.max(nodeAndRttList_RawData[i]['date']))
    //         //DATE MIGHT BE POSSIBLY WRONG
    //         startDate: UnixTimeConverterService.getDate(math.number(math.min(nodeAndRttList_RawData[i]['date']))),
    //         endDate: UnixTimeConverterService.getDate(math.number(math.max(nodeAndRttList_RawData[i]['date']))),
    //         startTime: UnixTimeConverterService.getTime(math.number(math.min(nodeAndRttList_RawData[i]['date']))),
    //         endTime: UnixTimeConverterService.getTime(math.number(math.max(nodeAndRttList_RawData[i]['date']))),
    //         status: rrtStatus
    //
    //       }
    //     );
    //
    //   }
    //
    //   // return nodeAndRttList_CalculatedData;
    //   return [nodeAndRttList_CalculatedData,minDate,maxDate];
    //
    // },

    getAnalysis: function (individual_traceroute_results) {

      //TODO: Due to the sheer amount of data, double for loops increases the processing time exponentially.

      // Takes an array of individual traceroute results, and process it.
      // Array newest to oldest.
      // Take last X days result, find unique paths, compare it.
      // FIXME:What if the existing path also has an error?

      // $log.debug("AnalyzeTraceroute:analyzePath() START");


      var anomaliesExist = false;
      var pathExist = false;
      var traceroutePaths = [];

      for (var i = 0; i < individual_traceroute_results.length; i++) {

        var ts = individual_traceroute_results[i]['ts'];

        // console.log("TS: " + ts)

        if (ts > maxDate) {
          maxDate = ts;
        } else if (ts < minDate) {
          minDate = ts
        }
        // $log.debug(ts)

        var singleExistingPath = [];

        for (var j = 0; j < individual_traceroute_results[i]['val'].length; j++) {

          //FIXME: Do we ignore query 1,2, 3?
          //FIXME: What about path with traceroute errors?


          if (individual_traceroute_results[i]['val'][j]['query'] == 1) {
            // $log.debug("Adding: " + individual_traceroute_results[i]['val'][j]['ip']);
            singleExistingPath.push(individual_traceroute_results[i]['val'][j]['ip']);


          }

          //Error in traceroute result, most likely request timed out.
          if (individual_traceroute_results[i]['val'][j]['success'] == 0) {

            // return true;
          }

        }

        // traceroutePaths.push(singleExistingPath);
        traceroutePaths.push(JSON.stringify(singleExistingPath));

      }


      // $log.debug("traceroutePath.length: "+ traceroutePaths.length);
      //pastPath[0] -> Latest traceroute path to compare with.

      // myWorker.run(traceroutePaths).then(function (result) {
      //
      //   console.log("RETURNED UNIQUE PATH LENGTH: " + result[0].length);
      //   console.log("RETURNED INDEX LENGTH: " + result[1].length);
      // });

      var indexesOfError = [0];
      var uniquePaths = [];
      //
      // for (var i = 0; i < traceroutePaths.length; i++) {
      //   // console.log("FIRST: "+traceroutePaths[i]);
      //
      //
      //   if (uniquePaths.length == 0) {
      //     // uniquePaths.push(JSON.stringify(traceroutePaths[i]));
      //     console.log("Initial Results Added");
      //     uniquePaths.push(traceroutePaths[i]);
      //   } else if (uniquePaths.length > 0) {
      //     for (var j = 0; j < uniquePaths.length; j++) {
      //
      //       console.log("Unique:"+uniquePaths[j]);
      //       console.log("!nique:"+traceroutePaths[i]);
      //       for (var k = 0; k < uniquePaths[j].length; k++) {
      //
      //         if(uniquePaths[j][k]!=traceroutePaths[i][k]){
      //           console.log("Unique Results Added");
      //           uniquePaths.push(traceroutePaths[i]);
      //           indexesOfError.push(i);
      //           break;
      //         }
      //
      //       }
      //
      //       // var trString = JSON.stringify(traceroutePaths[i]);
      //       // if (uniquePaths !== trString) {
      //       //   uniquePaths.push(trString);
      //       //   indexesOfError.push(i);
      //       // }
      //
      //
      //     }
      //   }
      //
      //
      //
      //
      // }

      //FIXME: Still requires fixing as subsequent traceroute inside index are still in it.
      //Temporary fixed done.

      // firstTRResultString = JSON.stringify(traceroutePaths[0]);
      firstTRResultString = traceroutePaths[0];

      for (var i = 1; i < traceroutePaths.length; i++) {

        // observedTR = JSON.stringify(traceroutePaths[i]);
        observedTR = (traceroutePaths[i]);

        if (firstTRResultString !== observedTR) {
          anomaliesExist = true;
          indexesOfError.push(i);

          // if(JSON.stringify(traceroutePaths[indexesOfError[indexesOfError.length-2]]) ===observedTR){
          //   indexesOfError.pop();
          // }

          if ((traceroutePaths[indexesOfError[indexesOfError.length - 2]]) === observedTR) {
            indexesOfError.pop();
          }


          // break;
        }

      }


      // if (uniquePaths.length == 1) {
      //   //NO Anomalies as only one path was found.
      //   return [false, null];
      // } else if (uniquePaths.length > 1) {
      //   return [true, indexesOfError]
      // }
      // return [false, null]

      return [anomaliesExist, indexesOfError, minDate, maxDate];
    }

    // getMinMaxDate: function (individual_traceroute_results) {
    //
    //   //TODO: Due to the sheer amount of data, double for loops increases the processing time exponentially.
    //
    //
    //   for (var i = 0; i < individual_traceroute_results.length; i++) {
    //
    //     var ts = individual_traceroute_results[i]['ts'];
    //     console.log("TS: " + ts)
    //
    //     if (ts > maxDate) {
    //       maxDate = ts;
    //     } else if (ts < minDate) {
    //       minDate = ts
    //     }
    //
    //   }
    //
    //   return [minDate, maxDate]
    // }
  };

  function analyzeResults(promises, source, destination) {
    // if 0 or only 1 result, skip.
    //else do the calculation here.

    $q.all(promises).then(function (response) {

      // Either return or push the array here.
      var results = {
        source: source,
        destination: destination,
        threshold: []
      };

      var toCalculate = [];


      for (var i = 0; i < response.length; i++) {
        // Checking for 'active' servers
        if (response[i].data.length > 1) {

          for (var k = 0; k < response[i].data.length; k++) {

            for (var l = 0; l < response[i].data[k]['val'].length; l++) {

              var IPAddr = response[i].data[k]['val'][l]['ip']
              var rtt = response[i].data[k]['val'][l]['rtt']
              var IPExist = false;

              for (var j = 0; j < toCalculate.length; j++) {
                if (toCalculate[j]['IP'] == IPAddr) {
                  IPExist = true;
                  toCalculate[j]['rtt'].push(rtt);
                }
              }

              if (IPExist == false) {

                var tempResult = {
                  IP: IPAddr,
                  rtt: [rtt]
                }

                toCalculate.push(tempResult);
              }
            }
          }


        }
      }

      //Calculating Mean, Min and Std Deviation.
      for (var i = 0; i < toCalculate.length; i++) {
        results['threshold']['ip'] = toCalculate[i]['IP']
        results['threshold']['rttAvg'] = math.mean(toCalculate[i]['rtt']);
        results['threshold']['rttMin'] = math.min(toCalculate[i]['rtt']);
        results['threshold']['rttStd'] = math.std(toCalculate[i]['rtt']);

        analyzedTRList.push(results);
      }


    });

  }


}]);


analyzationService.factory('Analyze_Bandwidth', [function () {
  //Conditions of an anomaly
  // 1. Values are different in a certain threshold.


  var comparison = [];

  var threshold = 100;

  return {
    compare: function (bandwidth_1, bandwidth_2) {

      var diff = bandwidth_1 - bandwidth_2;

      if (diff > Math.abs(diff)) {
        // Threshold met, anomaly detected.
        return true;

      } else {

        return false;

      }

      // Do something
    },
    add: {
      //Do Something
    }
  }

}]);

analyzationService.factory('AnalyzeLatency', ['$log', 'UnixTimeConverterService', function ($log, UnixTimeConverterService) {

  var maxDate = Number.MIN_VALUE;
  var minDate = Number.MAX_VALUE;


  var comparison = [];

  var threshold = 100;

  return {

    getMinMaxDate: function (individual_traceroute_results) {

      //TODO: Due to the sheer amount of data, double for loops increases the processing time exponentially.


      for (var i = 0; i < individual_traceroute_results.length; i++) {

        var ts = individual_traceroute_results[i]['ts'];
        // console.log("TS: " + ts)

        if (ts > maxDate) {
          maxDate = ts;
        } else if (ts < minDate) {
          minDate = ts
        }

      }

      return [minDate, maxDate]
    },

    compare: function (bandwidth_1, bandwidth_2) {

      var diff = bandwidth_1 - bandwidth_2;

      if (diff > Math.abs(diff)) {
        // Threshold met, anomaly detected.
        return true;

      } else {

        return false;

      }

      // Do something
    },

    add: {
      //Do Something
    },

    getAnalysis: function () {

      return true;
    }
  }

}]);
