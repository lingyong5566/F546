angular.module('traceroute').controller('TracerouteListCtrl', ['$scope', 'TracerouteList','TracerouteResults', function($scope, TracerouteResults, TracerouteResultIndividual){

  console.log("TracerouteListCtrl: START")

  //$scope.tr_list = TracerouteList.list()

  //dataList = TracerouteList.list()
  //$scope.testing = dataList
  //var retrievedData = {Source1:
  //                {
  //                  ip: 'misko',
  //                  status: 'success'
  //                },
  //              Source2: 'male'
  //              }


  //TracerouteList.list(function(dataList) {
  //for (i = 0; i < dataList.length; i++) {
  //  for (j=0; j< dataList[i]['event-types'].length;j++){
  //    if (dataList[i]['event-types'][j]['event-type']=='packet-trace'){
  //      //console.log("DEBUG, Metadata-key: "dataList[i]['metadata-key'])
  //      TracerouteResults.get({ metadata_key: dataList[i]['metadata-key'] }, function(trResult) {
  //        //$scope.testing=trResult[0].ts
  //        //$scope.testing2=trResult[1].ts
  //        //$scope.testing3=trResult[2].ts
  //        var previousIP = 0
  //        for (k=0; k< trResult[0].val.length; k++){
  //          if (previousIP != trResult[0].val[k].ip){
  //              //data[0].val[i].ip
  //              console.log(trResult[0].val[k].ip)
  //
  //            if (dataList[i].source in retrievedData){
  //              //Source Key Exist. Append new Traceroute Results
  //            } else{
  //
  //              //retrievedData[dataList[i].source] = null
  //            }
  //            previousIP = trResult[0].val[k].ip
  //          }
  //        }
  //
  //
  //
  //      });
  //
  //    }
  //  }
  //}
  //});

  TracerouteList.list(function(dataList) {
    $scope.trList=dataList

    for (i = 0; i < dataList.length; i++) {
     // $scope.metadatakeys=dataList[i]['metadata-key']
    }
  })




  console.log("TracerouteListCtrl: END")
}]);
