/*
 This Controller sets up OW Delay
 */
//var onewaydelay = angular.module('onewaydelay', []);
var app = angular.module('onewaydelay',['GeneralServices','zingchart-angularjs' ]);

app.controller('DelayCtrl', ["$scope", "$q", "$http", "$log",'myService','UnixTimeConverterService', 'HWForecast', function ($scope, $q, $http, $log,myService,UnixTimeConverterService, HWForecast) {

  // Do a loop, retrieve all metakeys involving owdelay and do a retrieve data for each metakey

  time = 3600;
  baseURL = "http://perfsonar-gs.singaren.net.sg/esmond/perfsonar/archive/";
  currentMetakey = [];
  source = [];
  destination = [];
  sdns = [];
  ddns =[];
  rsdns = [];
  rddns =[];
  criticalValue = 0.8;
  warningValue = 0.6;
  minorValue = 0.2;

  var HW = false;
  var host = "http://203.30.39.133/reversednslookup";
  var host2 = "http://geoip.nekudo.com/api/";

  testcode = false;

  var fullDataList = [];
  var HWForecastResult = [];
  var FCindex = 0.5;
  var beta = 0.029;
  var gamma = 0.993;
  var errorInformation1 = [];
  var errorInformation2 = [];
  var errorInformation3 = [];

  reverseCurrentMetakey = [];
  reverseSource = [];
  reverseDestination = [];
  var reverseFullDataList = [];

  var reverseHWForecastResult = [];

  timerange = 86400;
  timerange = 3600*24;
  var mostRecentTime = 3600;

  packetLoss = [];
  reversePacketLoss = [];
  var mainUrl = baseURL+"?event-type=histogram-owdelay&time-range=" + timerange;
  console.log(mainUrl);

  $http.get(mainUrl).then(function (response) {
    var promises = [];
      for (i = 0; i < response.data.length; i++) {
        currentMetakey[i] = response.data[i]['metadata-key'];
        source[i] = response.data[i]['source'];
        destination[i] = response.data[i]['destination'];
        sdns[i] = response.data[i]['input-source'];
        ddns[i] = response.data[i]['input-destination'];
      }
    }
  ).then(function (response) {
    var promises = [];

    for (i = 0; i < currentMetakey.length; i++) {
      var curURL = baseURL + currentMetakey[i] + "/histogram-owdelay/statistics/" + time + "?time-range=" + timerange;

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
      //console.log("Calling HWFunction3");
      if(HW == true)
        HWForecastResult[i] = HWForecast.HWFunction3(resp[i].data, FCindex, "delay",beta,gamma);
      else
        HWForecastResult[i] = HWForecast.HWFunction(resp[i].data, FCindex, "delay");
      //console.log("resp1 " + promiseIndex + "= " + resp.data);
      fullDataList[i] = resp[i].data;
      //console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
      //console.log("fulldataList = " + fullDataList);
      //promiseIndex = promiseIndex + 1;
    }
    for (i = 0; i < currentMetakey.length; i++) {
      var urlReverseTraffic = baseURL+"?event-type=histogram-owdelay&source=" + destination[i] + "&destination=" + source[i] + "&time-range=" + timerange;// Get reverse metakey.
      // + "&format=json"
      console.log("urlReverseTraffic : " + urlReverseTraffic);
      promises.push($http.get(urlReverseTraffic));
    }


    $scope.currentMetakey = currentMetakey;
    $scope.source = source;
    $scope.destination = destination;
    $scope.fullDataList = fullDataList;
    $scope.HWForecastResult = HWForecastResult;
    //console.log("sdns : " + sdns);
    //console.log("ddns : " + ddns);
    $scope.sdns = sdns;
    $scope.ddns = ddns;

    return $q.all(promises);


  }).then(function (response) {
    for (j = 0; j < response.length; j++) {
      for (k = 0; k < response[j].data.length; k++) {
        reverseCurrentMetakey[j] = response[j].data[k]['metadata-key'];
        reverseSource[j] = response[j].data[k]['source'];
        reverseDestination[j] = response[j].data[k]['destination'];
        rsdns[j] = response[j].data[k]['input-source'];
        rddns[j] = response[j].data[k]['input-destination']
      }

    }


    var promises = [];

    for (i = 0; i < reverseCurrentMetakey.length; i++) {
      var curURL = baseURL + reverseCurrentMetakey[i] + "/histogram-owdelay/statistics/" + time + "?time-range=" + timerange;
      console.log("urlReverseTrafficSub = " + curURL);
      promises.push($http.get(curURL));
    }




    $scope.reverseCurrentMetakey = reverseCurrentMetakey;
    $scope.reverseSource = reverseSource;
    $scope.reverseDestination = reverseDestination;
    $scope.rsdns = rsdns;
    $scope.rddns = rddns;
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
      if(HW == true)
        reverseHWForecastResult[i] = HWForecast.HWFunction3(response[i].data, FCindex, "delay",beta,gamma);
      else
        reverseHWForecastResult[i] = HWForecast.HWFunction(response[i].data, FCindex, "delay");
      //console.log("resp1 " + promiseIndex + "= " + resp.data);
      reverseFullDataList[i] = response[i].data;
      //console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
      //console.log("fulldataList = " + fullDataList);
      //promiseIndex = promiseIndex + 1;


      //console.log("scope = " + $scope.fullDataList);
      //console.log("[0] = " + reverseFullDataList[1]);
      //console.log("whole = " + fullDataList);

      $scope.reverseFullDataList = reverseFullDataList;
      $scope.reverseHWForecastResult = reverseHWForecastResult;
    }


  }).then(function(resp){
    var promises = [];
    for (i = 0; i < currentMetakey.length; i++) {
      var packetLossURL = baseURL + currentMetakey[i] + "/packet-loss-rate/aggregations/" + time + "?time-range=" + timerange;
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
      var reversePacketLossURL = baseURL + reverseCurrentMetakey[i] + "/packet-loss-rate/aggregations/" + time + "?time-range=" + timerange;
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
        //console.log(response[i].data[j]);


      }
      reversePacketLoss[i] = response[i].data
    }


    $scope.reversePacketLoss = reversePacketLoss;

  }).then(function(response){
    var promises = [];
    for (i = 0; i < currentMetakey.length; i++) {
      var mostRecentURL = baseURL + currentMetakey[i] + "/packet-loss-rate/aggregations/" + "3600" + "?time-range=" + mostRecentTime;
      //console.log("mostRecentURL = " + mostRecentURL);
      promises.push($http.get(mostRecentURL));
    }
    return $q.all(promises);
  }).then(function(response){
    var promises = [];
    for (i = 0; i < response.length; i++) {
      for (j = 0; j < response[i].data.length; j++) {

        if(testcode == true)
        {
          if(i == 1 && j == 0){
            response[i].data[j]['val'] = 0.2;
          }
          if(i == 2 && j == 0){
            response[i].data[j]['val'] = 0.6;
          }
          if(i == 3 && j == 0){
            response[i].data[j]['val'] = 0.8;
          }
        }

        //console.log("parseFloat(response[i].data[j]['val'])"+parseFloat(response[i].data[j]['val']));
        if(parseFloat(response[i].data[j]['val']) >= criticalValue){
          var pairValue = [currentMetakey[i],math.round((response[i].data[j]['val'] ), 5)];
          errorInformation1.push(pairValue);
        }
        else if(parseFloat(response[i].data[j]['val']) >= warningValue){
          var pairValue = [currentMetakey[i],math.round((response[i].data[j]['val'] ), 5)];
          errorInformation2.push(pairValue);
        }
        else if(parseFloat(response[i].data[j]['val']) >= minorValue){
          var pairValue = [currentMetakey[i],math.round((response[i].data[j]['val'] ), 5)];
          errorInformation3.push(pairValue);
        }

      }
  }
  /*
    for(i = 0 ; i < 1; i++) {

      var sURL = host2 + source[i] +"/";
      var dURL = host2 + destination[i]+"/";
      promises.push(GeoIPNekudoService.getCountry(source[i]));
      //promises.push($http.get(dURL));
    }
*/
    $scope.errorInformation1 = errorInformation1;
    $scope.errorInformation2 = errorInformation2;
    $scope.errorInformation3 = errorInformation3;


    //console.log("errorInformation1 : "+errorInformation1);
    //console.log("errorInformation2 : "+errorInformation2);
    //console.log("errorInformation3 : "+errorInformation3);
    return $q.all(promises);

  });

  /*
   .then(function(response){
   console.log(response.length);
   console.log("XX "+response.data);
   for(i = 0 ; i < response.length; i++)
   {
   console.log("XX "+response.data);
   }
   j = 0;
   k = 0;
   for(i = 0 ; i < source.length; i++)
   {
   var sURL = host2 + source[i];
   var dURL = host2 + destination[i];


   $http.get(sURL).then(function (response)
   {
   try{
   console.log("ZZ "+response.data['country']['name']+" "+console.log(sURL));
   sdns[j] = "Unknown";
   sdns[j] = response.data['country']['name'];
   if(sdns[j] == 'undefined')
   {
   console.log("YY ");
   sdns[j] = "Unknown";
   }
   console.log("XX ");
   console.log("Number "+j+" sDNS = "+ddns[j]);
   j++;
   }
   catch (err){
   console.log("error");
   sdns[j] = "Unknown";
   j++;
   }

   });
   $http.get(dURL).then(function (response)
   {
   try{

   ddns[k] = response.data['country']['name'];
   if(response.data['type'] == "error")
   {
   ddns[k] = "Unknown";
   }
   console.log("Number "+k+" DDNS = "+ddns[k]);
   k++;
   }
   catch (err){
   ddns[k] = "Unknown";
   k++;
   }

   });
   }
   /*
   console.log("source.length = "+source.length);
   for (i = 0; i < response.length; i = i+2) {
   console.log(response.data);
   try{
   sdns[i] = response.data[i]['country']['name'];
   ddns[i] = response.data[i+1]['country']['name'];
   }
   catch (err){
   sdns[i] = "Unknown";
   ddns[i] = "Unknown";
   }

   }
})
   */
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



