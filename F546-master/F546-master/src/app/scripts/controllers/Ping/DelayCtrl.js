/*
 This Controller sets up OW Delay
 */
//var onewaydelay = angular.module('onewaydelay', []);
var app = angular.module('onewaydelay', ['GeneralServices','zingchart-angularjs']);

app.controller('DelayCtrl', ["$scope", "$q", "$http", 'myService','UnixTimeConverterService', 'HWForecast', function ($scope, $q, $http, myService,UnixTimeConverterService, HWForecast) {

  // Do a loop, retrieve all metakeys involving owdelay and do a retrieve data for each metakey

  time = 3600;
  currentMetakey = [];
  source = [];
  destination = [];

  var fullDataList = [];
  var HWForecastResult = [];
  var FCindex = 0.5;

  reverseCurrentMetakey = [];
  reverseSource = [];
  reverseDestination = [];
  var reverseFullDataList = [];

  var reverseHWForecastResult = [];

  timerange = 86400;

  packetLoss = [];
  reversePacketLoss = [];
  var mainUrl = "http://ps2.jp.apan.net/esmond/perfsonar/archive/?event-type=histogram-owdelay&time-range=" + timerange;
  $http.get(mainUrl).then(function (response) {
      for (i = 0; i < response.data.length; i++) {
        currentMetakey[i] = response.data[i]['metadata-key'];
        source[i] = response.data[i]['source'];
        destination[i] = response.data[i]['destination'];
      }
    }
  ).then(function (resp) {
    var promises = [];
    for (i = 0; i < currentMetakey.length; i++) {
      var curURL = "http://ps2.jp.apan.net/esmond/perfsonar/archive/" + currentMetakey[i] + "/histogram-owdelay/statistics/" + time + "?time-range=" + timerange;

      console.log(curURL);

      // Problems: Request does not finish and assigned null values to array.
      // Solution: Index in the response scope so that it get updated AFTER it gets data.
      // Attempts to resolve then function exiting before completion.
      promises.push($http.get(curURL));
    }

    //$scope.fullData = response.data;

    return $q.all(promises);

  }).then(function (resp) {
    var promises = [];
    for (i = 0; i < resp.length; i++) {
      for (j = 0; j < resp[i].data.length; j++) {
        //console.log("hey3");
        //console.log(response1.data[j]['val']['standard-deviation']); OK
        //console.log(math.round(resp[i].data[j]['val']['standard-deviation']),3);
        resp[i].data[j]['val']['standard-deviation'] = math.round(resp[i].data[j]['val']['standard-deviation'], 3);
        resp[i].data[j]['val']['variance'] = math.round(resp[i].data[j]['val']['variance'], 3);
        resp[i].data[j]['val']['mean'] = math.round(resp[i].data[j]['val']['mean'], 3);


      }
      HWForecastResult[i] = HWForecast.HWFunction(resp[i].data, FCindex, "delay");
      //console.log("resp1 " + promiseIndex + "= " + resp.data);
      fullDataList[i] = resp[i].data;
      //console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
      //console.log("fulldataList = " + fullDataList);
      //promiseIndex = promiseIndex + 1;
    }
    for (i = 0; i < currentMetakey.length; i++) {
      var urlReverseTraffic = "http://ps2.jp.apan.net/esmond/perfsonar/archive/?event-type=histogram-owdelay&source=" + destination[i] + "&destination=" + source[i] + "&time-range=" + timerange;// Get reverse metakey.
      // + "&format=json"
      console.log("urlReverseTraffic : " + urlReverseTraffic);
      promises.push($http.get(urlReverseTraffic));
    }


    $scope.currentMetakey = currentMetakey;
    $scope.source = source;
    $scope.destination = destination;
    $scope.fullDataList = fullDataList;
    $scope.HWForecastResult = HWForecastResult;

    return $q.all(promises);


  }).then(function (response) {
    for (j = 0; j < response.length; j++) {
      for (k = 0; k < response[j].data.length; k++) {
        reverseCurrentMetakey[j] = response[j].data[k]['metadata-key'];
        reverseSource[j] = response[j].data[k]['source'];
        reverseDestination[j] = response[j].data[k]['destination'];

      }

    }


    var promises = [];

    for (i = 0; i < reverseCurrentMetakey.length; i++) {
      var curURL = "http://ps2.jp.apan.net/esmond/perfsonar/archive/" + reverseCurrentMetakey[i] + "/histogram-owdelay/statistics/" + time + "?time-range=" + timerange;
      console.log("urlReverseTrafficSub = " + curURL);
      promises.push($http.get(curURL));
    }




    $scope.reverseCurrentMetakey = reverseCurrentMetakey;
    $scope.reverseSource = reverseSource;
    $scope.reverseDestination = reverseDestination;

    return $q.all(promises);


  }).then(function(response){

    var promises = [];

    for (i = 0; i < response.length; i++) {
      for (j = 0; j < response[i].data.length; j++) {
        //console.log("hey3");
        //console.log(response1.data[j]['val']['standard-deviation']); OK
        //console.log(math.round(resp[i].data[j]['val']['standard-deviation']),3);
        response[i].data[j]['val']['standard-deviation'] = math.round(response[i].data[j]['val']['standard-deviation'], 3);
        response[i].data[j]['val']['variance'] = math.round(response[i].data[j]['val']['variance'], 3);
        response[i].data[j]['val']['mean'] = math.round(response[i].data[j]['val']['mean'], 3);


      }
      reverseHWForecastResult[i] = HWForecast.HWFunction(response[i].data, FCindex, "delay");
      //console.log("resp1 " + promiseIndex + "= " + resp.data);
      reverseFullDataList[i] = response[i].data;
      //console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
      //console.log("fulldataList = " + fullDataList);
      //promiseIndex = promiseIndex + 1;


      //console.log("scope = " + $scope.fullDataList);
      console.log("[0] = " + reverseFullDataList[1]);
      //console.log("whole = " + fullDataList);

      $scope.reverseFullDataList = reverseFullDataList;
      $scope.reverseHWForecastResult = reverseHWForecastResult;
    }


  }).then(function(resp){
    var promises = [];
    for (i = 0; i < currentMetakey.length; i++) {
      var packetLossURL = "http://ps2.jp.apan.net/esmond/perfsonar/archive/" + currentMetakey[i] + "/packet-loss-rate/aggregations/" + time + "?time-range=" + timerange;
      console.log("packetLossURL = " + packetLossURL);
      promises.push($http.get(packetLossURL));
    }
    return $q.all(promises);


  }).then(function(response){

    var packetLoss = [];
    for (i = 0; i < response.length; i++) {
      for (j = 0; j < response[i].data.length; j++) {

        var date1 = UnixTimeConverterService.getDate(response[i].data[j]['ts']);
        var date2 = date1[1] + " " + date1[0] + " " + date1[2];
        var time1 = UnixTimeConverterService.getTime(response[i].data[j]['ts']);
        var time2 = time1[0] + ":" + time1[1] + ":" + time1[2] + "" + time1[3];

        response[i].data[j]['ts'] = time2 + " " + date2;

        response[i].data[j]['val'] = math.round((response[i].data[j]['val'] ), 5);
        //console.log(response[i].data[j]);


      }
      packetLoss[i] = response[i].data
    }


    $scope.packetLoss = packetLoss;

    var promises = [];
    for (i = 0; i < reverseCurrentMetakey.length; i++) {
      var reversePacketLossURL = "http://ps2.jp.apan.net/esmond/perfsonar/archive/" + reverseCurrentMetakey[i] + "/packet-loss-rate/aggregations/" + time + "?time-range=" + timerange;
      console.log("reversePacketLossURL = " + reversePacketLossURL);
      promises.push($http.get(reversePacketLossURL));
    }
    return $q.all(promises);



  }).then(function(response){

    var reversePacketLoss = [];
    for (i = 0; i < response.length; i++) {
      for (j = 0; j < response[i].data.length; j++) {

        var date1 = UnixTimeConverterService.getDate(response[i].data[j]['ts']);
        var date2 = date1[1] + " " + date1[0] + " " + date1[2];
        var time1 = UnixTimeConverterService.getTime(response[i].data[j]['ts']);
        var time2 = time1[0] + ":" + time1[1] + ":" + time1[2] + "" + time1[3];

        response[i].data[j]['ts'] = time2 + " " + date2;

        response[i].data[j]['val'] = math.round((response[i].data[j]['val'] ), 5);
        console.log(response[i].data[j]);


      }
      reversePacketLoss[i] = response[i].data
    }


    $scope.reversePacketLoss = reversePacketLoss;

  });

  $scope.displayGraph = function (fullDataList,HWForecastResult,reverseFullDataList,ReverseHWForecastResult,source,destination) {
    //,HWForecastResult2,HWForecastResult3,HWForecastResult4,ReverseHWForecastResult2,ReverseHWForecastResult3,ReverseHWForecastResult4
    //,HWForecastResult2[fIndex],HWForecastResult3[fIndex],HWForecastResult4[fIndex],ReverseHWForecastResult2[fIndex],ReverseHWForecastResult3[fIndex],ReverseHWForecastResult4[fIndex]
    var series = [];
    var series2 = [];
    var series3 = [];
    var series4 = [];
    var rangeSeries1 = [];
    var rangeSeries2 = [];
    var RrangeSeries1 = [];
    var RrangeSeries2 = [];
    for(i = 0 ; i < fullDataList.length; i++){
      series[i] = fullDataList[i]["val"]['minimum'];
      series2[i] = HWForecastResult[i];
      //rangeSeries1[i] = [HWForecastResult[i],HWForecastResult3[i]];
      //rangeSeries2[i] = [HWForecastResult2[i],HWForecastResult4[i]];
    }
    for(i = 0 ; i < reverseFullDataList.length; i++) {
      series3[i] = reverseFullDataList[i]["val"]['minimum'];
      series4[i] = ReverseHWForecastResult[i];
      //RrangeSeries1[i] = [ReverseHWForecastResult[i],ReverseHWForecastResult3[i]];
      //RrangeSeries2[i] = [ReverseHWForecastResult2[i],ReverseHWForecastResult4[i]];
    }
    console.log(fullDataList[1]["val"]);
    $scope.myJson = {
      type : 'mixed',
      "legend":{

      },
      series : [
        { values : series,"text":"Current Minimum"},
        { values : series2,"text":"HWForecastResult"},
        { values : series3,"text":"Reverse Minimum"},
        { values : series4,"text":"ReverseHWForecastResult"},
        //{  "type": "range",plot:{ marker:{ size: 0, borderColor: "black",borderWidth: 0 }},"values": rangeSeries1,"color":"transparent", "alpha-area":0.1, "text":"HWForecastResult 10%"},
        //{  "type": "range",plot:{ marker:{ size: 0, borderColor: "black",borderWidth: 0 }},"values": rangeSeries2,"color":"transparent", "alpha-area":0.1, "text":"HWForecastResult 15%"},

        //{  "type": "range",plot:{ marker:{ size: 0, borderColor: "black",borderWidth: 0 }}, "values": RrangeSeries1, "alpha-area":0.1,"text":"ReverseHWForecastResult 10%"},
        //{  "type": "range",plot:{ marker:{ size: 0, borderColor: "black",borderWidth: 0 }}, "values": RrangeSeries2, "alpha-area":0.1,"text":"ReverseHWForecastResult 15%"}
      ]
    };
  }


  /*.then(function(response){

   })*/


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

app.factory('myService', function ($http) {

  var getData = function (curUrl) {

    // Angular $http() and then() both return promises themselves
    return $http.get(curUrl)
      .then(function (result) {
        console.log("getting data");
        // What we return here is the data that will be accessible
        // to us after the promise resolves
        return result.data;
      });
  };


  return {getData: getData};
});
