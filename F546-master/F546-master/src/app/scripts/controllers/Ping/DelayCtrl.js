/*
 This Controller sets up OW Delay
 */
var onewaydelay = angular.module('onewaydelay', []);
var app = angular.module('onewaydelay', []);

app.controller('DelayCtrl', ["$scope", "$q", "$http", 'myService', function ($scope, $q, $http, myService) {

  // Do a loop, retrieve all metakeys involving owdelay and do a retrieve data for each metakey
  time = 3600;
  currentMetakey = [];
  source = [];
  destination = [];
  var fullDataList = [];
  $scope.fullDataList = [];
  timerange = 86400;
  var mainUrl = "http://ps2.jp.apan.net/esmond/perfsonar/archive/?event-type=histogram-owdelay&time-range=" + timerange;
  $http.get(mainUrl)
    .then(function (response) {
        //console.log(response.data.length); // 44 entries
        //for(i = 0;i<response.data.length;i++)

        for (i = 0; i < response.data.length; i++) {
          currentMetakey[i] = response.data[i]['metadata-key'];
          source[i] = response.data[i]['input-source'];
          destination[i] = response.data[i]['input-destination'];
        }
      }
    ).then(function (resp) {
    var promises = [];
    for (i = 0; i < currentMetakey.length; i++) {

      //var deferred = $q.defer();

      //console.log(currentMetakey[i]);
      var curURL = "http://ps2.jp.apan.net/esmond/perfsonar/archive/" + currentMetakey[i] + "/histogram-owdelay/statistics/3600";
      console.log(curURL);
      //console.log(myService.getData(curURL));

      promises.push($http.get(curURL));
      // Problems: Request does not finish and assigned null values to array.
      // Solution: Index in the response scope so that it get updated AFTER it gets data.
      // Attempts to resolve then function exiting before completion.

      /*myService.getData(curURL).then(
       function (resp) {

       )*/
    }

    //$scope.fullData = response.data;

    return $q.all(promises);

  }).then(function (resp) {
    console.log("resp.length = "+resp.length);
    for (i = 0; i < resp.length; i++) {
      for (j = 0; j < resp[i].data.length; j++) {
        //console.log("hey3");
        //console.log(response1.data[j]['val']['standard-deviation']); OK
        //console.log(math.round(resp[i].data[j]['val']['standard-deviation']),3);
        resp[i].data[j]['val']['standard-deviation'] = math.round(resp[i].data[j]['val']['standard-deviation'], 3);
        resp[i].data[j]['val']['variance'] = math.round(resp[i].data[j]['val']['variance'], 3);
        resp[i].data[j]['val']['mean'] = math.round(resp[i].data[j]['val']['mean'], 3);

      }
      //console.log("resp1 " + promiseIndex + "= " + resp.data);
      fullDataList[i] = resp[i].data;
      //console.log("fulldataList " + promiseIndex + "= " + fullDataList[promiseIndex]);
      //console.log("fulldataList = " + fullDataList);
      //promiseIndex = promiseIndex + 1;


      //console.log("scope = " + $scope.fullDataList);
      console.log("[0] = " + fullDataList[1]);
      //console.log("whole = " + fullDataList);
    }
    $scope.currentMetakey = currentMetakey;
    $scope.source = source;
    $scope.destination = destination;
    $scope.fullDataList = fullDataList;


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
