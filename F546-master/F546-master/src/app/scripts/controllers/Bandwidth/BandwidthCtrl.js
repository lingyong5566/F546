//var bandwidth = angular.module('bandwidth',[]);
var bandwidth = angular.module('bandwidth', ['GeneralServices','zingchart-angularjs']);
bandwidth.controller('BandwidthCtrl', ['$scope', '$q',  '$location', '$http', 'UnixTimeConverterService', 'HWForecast', function ($scope, $q,$location, $http, UnixTimeConverterService, HWForecast) {




  var smallData = 0;

  var displayResults = 10;
  // var reset.
  currentMetakey = [];
  source = [];
  destination = [];
  var fullDataList = [];
  var HWForecastResult = [];
  var HWForecastResult2 = [];
  var HWForecastResult3 = [];
  var HWForecastResult4 = [];
  sdns = [];
  ddns =[];
  rsdns = [];
  rddns =[];
  // Reverse Traffic variables.
  reverseCurrentMetakey = [];
  reverseSource = [];
  reverseDestination = [];
  var reverseFullDataList = [];
  var ReverseHWForecastResult = [];
  var ReverseHWForecastResult2 = [];
  var ReverseHWForecastResult3 = [];
  var ReverseHWForecastResult4 = [];
  var promiseIndex1 = 0;

  var timerange = 86400;
  timerange = 86400;
  var FCindex = 0.9;
  var FCindex2 = 0.85;

  var FCindex3 = 1.1;
  var FCindex4 = 1.15;
  var main = "http://perfsonar-gs.singaren.net.sg/esmond/perfsonar/archive/";
  var mainUrl = main+"?event-type=throughput&time-range=" + timerange;

  respLength = 0;

  function mainRes() {

    var sourceAndDestinationList;
    var nodeList;

  }
  console.log("mainUrl : " + mainUrl);
  $http.get(mainUrl)
    .then(function (response) {
        respLength = response.data.length;

        // Current metakey, source and destination
        for (i = 0; i < respLength; i++) {
          currentMetakey[i] = response.data[i]['metadata-key'];
          source[i] = response.data[i]['source'];
          destination[i] = response.data[i]['destination'];
          sdns[j] = response.data[i]['input-source'];
          ddns[j] = response.data[k]['input-destination'];
        }
      }
    ).then(function (r2) {
    var promises = [];
    for (l = 0; l < currentMetakey.length; l++) {

      var urlReverseTraffic = main+"?event-type=throughput&source=" + destination[l] + "&destination=" + source[l] + "&time-range=" + timerange;// Get reverse metakey.
      // + "&format=json"
      console.log("urlReverseTraffic : " + urlReverseTraffic);
      promises.push($http.get(urlReverseTraffic));

    }
    return $q.all(promises);


  }).then(function (response) {
    for (j = 0; j < response.length; j++) {
      for (k = 0; k < response[j].data.length; k++) {
        reverseCurrentMetakey[j] = response[j].data[k]['metadata-key'];
        reverseSource[j] = response[j].data[k]['source'];
        reverseDestination[j] = response[j].data[k]['destination'];
        rsdns[j] = response[j].data[k]['input-source'];
        rddns[j] = response[j].data[k]['input-destination'];
      }

    }
  }).then(function (response) {
    var promises = [];
    // Might have empty result sets because it might not have reverse traffic
    // Have more than one result set
    for (i = 0; i < respLength; i++) {
      var promiseIndex = 0;
      var promiseIndex2 = 0
      var curURL = main + currentMetakey[i] + "/throughput/base?time-range=" + timerange;
      //format=json&
      console.log("curURL : " + curURL);

      // Problems: Request does not finish and assigned null values to array.
      // Solution: Index in the response scope so that it get updated AFTER it gets data.
      // Attempts to resolve then function exiting before completion.
      promises.push($http.get(curURL));
      //$http.get(curURL)

    }

    return $q.all(promises);
  }).then(function (resp) {
    //for (j = 0; j < resp.data.length; j++) {
    var promises = [];
    for (i = 0; i < resp.length; i++) {

      for (j = 0; j < resp[i].data.length; j++) {
        var date1 = UnixTimeConverterService.getDate(resp[i].data[j]['ts']);
        var date2 = date1[1] + " " + date1[0] + " " + date1[2];
        var time1 = UnixTimeConverterService.getTime(resp[i].data[j]['ts']);
        var time2 = time1[0] + ":" + time1[1] + ":" + time1[2] + "" + time1[3];

        resp[i].data[j]['ts'] = time2 + " " + date2;
        resp[i].data[j]['val'] = math.round((resp[i].data[j]['val'] / 1000 / 1000), 3);
      }
      HWForecastResult[i] = HWForecast.HWFunction(resp[i].data, FCindex,"bandwidth");
      HWForecastResult2[i] = HWForecast.HWFunction(resp[i].data, FCindex2,"bandwidth");
      HWForecastResult3[i] = HWForecast.HWFunction(resp[i].data, FCindex3,"bandwidth");
      HWForecastResult4[i] = HWForecast.HWFunction(resp[i].data, FCindex4,"bandwidth");
      //console.log("HWForecastResult["+promiseIndex+"] : "+HWForecastResult[promiseIndex]);
      //console.log("resp1 " + promiseIndex + "= " + resp.data);
      fullDataList[i] = resp[i].data;
      //console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
      //console.log("fulldataList = " + fullDataList);
      //$scope.fullDataList = fullDataList;

      console.log("reverseCurrentMetakey : " + reverseCurrentMetakey[i]);

      var urlReverseTrafficSub = main + reverseCurrentMetakey[i] + "/throughput/base?time-range=" + timerange;
      console.log("urlReverseTrafficSub = " + urlReverseTrafficSub);
      //"&time-start="+convertedTimeStartStamp+"&time-end="+convertedTimeEndStamp;
      promises.push($http.get(urlReverseTrafficSub));
      // Enter the json data.
    }
    return $q.all(promises);
  }).then(function (resp2) {
    for (i = 0; i < resp2.length; i++) {

        for (k = 0; k < resp2[i].data.length; k++) {
          var date1 = UnixTimeConverterService.getDate(resp2[i].data[k]['ts']);
          var date2 = date1[1] + " " + date1[0] + " " + date1[2];
          var time1 = UnixTimeConverterService.getTime(resp2[i].data[k]['ts']);
          var time2 = time1[0] + ":" + time1[1] + ":" + time1[2] + "" + time1[3];
          resp2[i].data[k]['ts'] = time2 + " " + date2;
          resp2[i].data[k]['val'] = math.round((resp2[i].data[k]['val'] / 1000 / 1000), 3);

        }

      ReverseHWForecastResult[i] = HWForecast.HWFunction(resp2[i].data, FCindex,"bandwidth");
      ReverseHWForecastResult2[i] = HWForecast.HWFunction(resp2[i].data, FCindex2,"bandwidth");
      ReverseHWForecastResult3[i] = HWForecast.HWFunction(resp2[i].data, FCindex3,"bandwidth");
      ReverseHWForecastResult4[i] = HWForecast.HWFunction(resp2[i].data, FCindex4,"bandwidth");
      //console.log("ReverseHWForecastResult[j] : "+ReverseHWForecastResult[j]);
      //console.log("resp1 " + promiseIndex + "= " + resp.data);
      reverseFullDataList[i] = resp2[i].data;
      //console.log("reverseFullDataList [" + promiseIndex2 + "]= " + reverseFullDataList[promiseIndex2]);
      //console.log("reverseFullDataList = " + reverseFullDataList);
      $scope.reverseFullDataList = reverseFullDataList;

      //promiseIndex2 = promiseIndex2 + 1;

    }

  }).then(function (resp) {
    var promiseIndex = 0; // helps to control the data in the promise
    //resp.data.length
    /*for (i = 0; i < resp.data.length; i++) {
     var curURL = "http://ps2.jp.apan.net/esmond/perfsonar/archive/" + currentMetakey[i] + "/throughput/base?format=json";
     //console.log(curURL);

     // Problems: Request does not finish and assigned null values to array.
     // Solution: Index in the response scope so that it get updated AFTER it gets data.
     // Attempts to resolve then function exiting before completion.
     $http.get(curURL).then(function (resp) {
     //for (j = 0; j < resp.data.length; j++) {
     for (j = 0; j < resp.data.length; j++) {

     var date1 = UnixTimeConverterService.getDate(resp.data[j]['ts']);
     var date2 = date1[1] + " " + date1[0] + " " + date1[2];
     var time1 = UnixTimeConverterService.getTime(resp.data[j]['ts']);
     var time2 = time1[0] + ":" + time1[1] + ":" + time1[2] + "" + time1[3];
     resp.data[j]['ts'] = time2 + " " + date2;
     resp.data[j]['val'] = math.round((resp.data[j]['val'] / 1000 / 1000), 3);

     }
     //console.log("resp1 " + promiseIndex + "= " + resp.data);
     fullDataList[promiseIndex] = resp.data;
     //console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
     //console.log("fulldataList = " + fullDataList);
     $scope.fullDataList = fullDataList;
     promiseIndex = promiseIndex + 1;

     });
     }*/


    // Searching function
    // It causes empty sets thus disabled.
    $scope.displayGraph = function (fullDataList,HWForecastResult,reverseFullDataList,ReverseHWForecastResult,source,destination,HWForecastResult2,HWForecastResult3,HWForecastResult4,ReverseHWForecastResult2,ReverseHWForecastResult3,ReverseHWForecastResult4) {
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
        series[i] = fullDataList[i]["val"];
        series2[i] = HWForecastResult[i];
        rangeSeries1[i] = [HWForecastResult[i],HWForecastResult3[i]];
        rangeSeries2[i] = [HWForecastResult2[i],HWForecastResult4[i]];
      }
      for(i = 0 ; i < reverseFullDataList.length; i++) {
        series3[i] = reverseFullDataList[i]["val"];
        series4[i] = ReverseHWForecastResult[i];
        RrangeSeries1[i] = [ReverseHWForecastResult[i],ReverseHWForecastResult3[i]];
        RrangeSeries2[i] = [ReverseHWForecastResult2[i],ReverseHWForecastResult4[i]];
      }
      //console.log(fullDataList[1]["val"]);
      $scope.myJson = {
        type : 'mixed',
        "legend":{

        },
        series : [
          { values : series,"text":"Current"},
          //{ type : 'line', values : series2,"text":"HWForecastResult"},
          { values : series3,"text":"Reverse"},
          //{ type : 'line', values : series4,"text":"ReverseHWForecastResult"},
          {  "type": "range","plot":{ "marker":{ "size": 0, "borderColor": "transparent","borderWidth": 0 }},"values": rangeSeries1,"color":"transparent","line-color":"transparent", "alpha-area":0.25, "text":"HWForecastResult 10%"},
          {  "type": "range","plot":{ "marker":{ "size": 0, "borderColor": "transparent","borderWidth": 0 }},"values": rangeSeries2,"color":"transparent","line-color":"transparent", "alpha-area":0.25, "text":"HWForecastResult 15%"},
          {  "type": "range","plot":{ "marker":{ "size": 0, "borderColor": "transparent","borderWidth": 0 }},"values": RrangeSeries1,"color":"transparent","line-color":"transparent", "alpha-area":0.25,"text":"ReverseHWForecastResult 10%"},
          {  "type": "range","plot":{ "marker":{ "size": 0, "borderColor": "transparent","borderWidth": 0 }},"values": RrangeSeries2,"color":"transparent","line-color":"transparent", "alpha-area":0.25,"text":"ReverseHWForecastResult 15%"}
        ]
      };
    }
    $scope.searchBW = function (wTimestart, wTimeend) {
      timestart = wTimestart;
      timeend = wTimeend;

      currentMetakey = [];
      source = [];
      destination = [];

      fullDataList = [];
      HWForecastResult = [];
      //reverseCurrentMetakey = [];
      //reverseSource = [];
      //reverseDestination = [];
      //reverseFullDataList = [];
      //ReverseHWForecastResult = [];


      var convertedTimeStart = new Date(wTimestart);
      var convertedTimeStartStamp = convertedTimeStart.getTime() / 1000;
      var convertedTimeEnd = new Date(wTimeend);
      var convertedTimeEndStamp = convertedTimeEnd.getTime() / 1000;

      //console.log(convertedTimeStartStamp);
      //console.log(convertedTimeEndStamp);
      //console.log(timestart);

      var reverseDataCounter = 0;// Keeps track of reverse data via index.
      $http.get(mainUrl)
        .then(function (response) {
            //console.log(response.data.length); // 44 entries
            //for(i = 0;i<response.data.length;i++)
            respLength = response.data.length;
            for (i = 0; i < smallData; i++) {
              currentMetakey[i] = response.data[i]['metadata-key'];
              source[i] = response.data[i]['source'];
              destination[i] = response.data[i]['destination'];
            }

          }
        ).then(function (resp) {
        var promiseIndex = 0;
        var promiseIndex2 = 0;

        //resp.data.length
        for (i = 0; i < resp.data.length; i++) {

          //var deferred = $q.defer();

          //console.log(currentMetakey[i]);

          //var curURL = "http://ps2.jp.apan.net/esmond/perfsonar/archive/" + currentMetakey[i] + "/throughput/base?format=json&time-start="+convertedTimeStartStamp+"&time-end="+convertedTimeEndStamp+"";
          var curURL = main + currentMetakey[i] + "/throughput/base?time-range=" + timerange;
          //?format=json
          //console.log(curURL);
          //console.log(myService.getData(curURL));


          var promise = $http.get(curURL);
          // Problems: Request does not finish and assigned null values to array.
          // Solution: Index in the response scope so that it get updated AFTER it gets data.
          // Attempts to resolve then function exiting before completion.
          promise.then(function (resp) {
            //for (j = 0; j < resp.data.length; j++) {
            for (j = 0; j < resp.data.length; j++) {
              var date1 = UnixTimeConverterService.getDate(resp.data[j]['ts']);
              var date2 = date1[1] + " " + date1[0] + " " + date1[2];
              var time1 = UnixTimeConverterService.getTime(resp.data[j]['ts']);
              var time2 = time1[0] + ":" + time1[1] + ":" + time1[2] + "" + time1[3];

              resp.data[j]['ts'] = time2 + " " + date2;
              resp.data[j]['val'] = math.round((resp.data[j]['val'] / 1000 / 1000), 3);
            }
            HWForecastResult[promiseIndex] = HWForecast.HWFunction(resp.data, FCindex,"bandwidth");
            //console.log("HWForecastResult[" + i + "] : " + HWForecastResult[i]);
            //console.log("resp1 " + promiseIndex + "= " + resp.data);
            fullDataList[promiseIndex] = resp.data;
            //console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
            //console.log("fulldataList = " + fullDataList);
            $scope.fullDataList = fullDataList;
            promiseIndex = promiseIndex + 1;

          });
          //console.log("Reverse IN");


          //var promise2 = $http.get(urlReverseTraffic);

          //promise2.then(function(resp)

          //{
          //console.log("Reverse IN Retrieve Meta");

          //Retrieve reverse metakey here.
          //for (j = 0; j < resp.data.length; j++) {


          //console.log(reverseCurrentMetakey[i]);
          var urlReverseTrafficSub = main + reverseCurrentMetakey[i] + "/throughput/base?timerange=" + timerange;
          console.log("urlReverseTrafficSub = " + urlReverseTrafficSub);
          //"&time-start="+convertedTimeStartStamp+"&time-end="+convertedTimeEndStamp;
          var promise3 = $http.get(urlReverseTrafficSub);
          // Enter the json data.
          promise3.then(function (resp2) {
            //for (k = 0; k < resp2.data.length; k++) {
            for (k = 0; k < resp2.data.length; k++) {
              var date1 = UnixTimeConverterService.getDate(resp2.data[k]['ts']);
              var date2 = date1[1] + " " + date1[0] + " " + date1[2];
              var time1 = UnixTimeConverterService.getTime(resp2.data[k]['ts']);
              var time2 = time1[0] + ":" + time1[1] + ":" + time1[2] + "" + time1[3];

              resp2.data[k]['ts'] = time2 + " " + date2;
              resp2.data[k]['val'] = math.round((resp2.data[k]['val'] / 1000 / 1000), 3);

            }

            ReverseHWForecastResult[promiseIndex2] = HWForecast.HWFunction(resp2.data, FCindex,"bandwidth");
            ReverseHWForecastResult2[promiseIndex2] = HWForecast.HWFunction(resp2.data, FCindex2,"bandwidth");
            //console.log("ReverseHWForecastResult[j] : "+ReverseHWForecastResult[j]);
            //console.log("resp1 " + promiseIndex + "= " + resp.data);
            reverseFullDataList[promiseIndex2] = resp2.data;
            //console.log("reverseFullDataList [" + promiseIndex2 + "]= " + reverseFullDataList[promiseIndex2]);
            //console.log("reverseFullDataList = " + reverseFullDataList);
            $scope.reverseFullDataList = reverseFullDataList;
            promiseIndex2 = promiseIndex2 + 1;
          });

          //console.log("reverseCurrentMetakey = "+reverseCurrentMetakey);
        }


        $scope.reverseCurrentMetakey = reverseCurrentMetakey;
        $scope.reverseSource = reverseSource;
        $scope.reverseDestination = reverseDestination;
        $scope.ReverseHWForecastResult = ReverseHWForecastResult;
        $scope.ReverseHWForecastResult2 = ReverseHWForecastResult2;

        $scope.currentMetakey = currentMetakey;
        $scope.source = source;
        $scope.destination = destination;
        $scope.HWForecastResult = HWForecastResult;
        $scope.HWForecastResult2 = HWForecastResult2;
        //$scope.fullData = response.data;
        //console.log("scope = "+$scope.fullDataList);
        //console.log("[0] = "+fullDataList[0]);
        //console.log("whole = "+fullDataList);

      });
    };
  });
  $scope.currentMetakey = currentMetakey;
  $scope.source = source;
  $scope.destination = destination;
  $scope.HWForecastResult = HWForecastResult;
  $scope.HWForecastResult2 = HWForecastResult2;
  $scope.HWForecastResult3 = HWForecastResult3;
  $scope.HWForecastResult4 = HWForecastResult4;
  $scope.fullDataList = fullDataList;

  $scope.reverseCurrentMetakey = reverseCurrentMetakey;
  $scope.reverseSource = reverseSource;
  $scope.reverseDestination = reverseDestination;
  $scope.ReverseHWForecastResult = ReverseHWForecastResult;
  $scope.ReverseHWForecastResult2 = ReverseHWForecastResult2;
  $scope.ReverseHWForecastResult3 = ReverseHWForecastResult3;
  $scope.ReverseHWForecastResult4 = ReverseHWForecastResult4;
  $scope.reverseFullDataList = reverseFullDataList;

}]);

/*
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
*/
/*
bandwidth.service('UnixTimeConverterService', function () {


  this.getDate = function (timestamp) {
    var fullMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var abbrMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    date = new Date(timestamp * 1000)
    datevalues = [
      date.getDate(),
      fullMonth[date.getMonth()],
      // date.getMonth() + 1,
      date.getFullYear()

      // date.getHours(),
      // date.getMinutes(),
      // date.getSeconds()
    ];

    return datevalues;
  }

  this.getTime = function (timestamp) {
    var date = new Date(timestamp * 1000)

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var seconds = date.getSeconds();
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var timevalues = [

      hours,
      minutes,
      seconds,
      ampm
    ];

    return timevalues;
  }
});
*/
bandwidth.controller('SearchBW', ['$scope', '$http', 'UnixTimeConverterService', function ($scope, $http, UnixTimeConverterService) {

  var mainUrl = "http://ps2.jp.apan.net/esmond/perfsonar/archive/?event-type=throughput";

  timestart = 0;
  timeend = 0;

  currentMetakey = [];
  source = [];
  destination = [];
  var fullDataList = [];

  respLength = 0;


}]);
