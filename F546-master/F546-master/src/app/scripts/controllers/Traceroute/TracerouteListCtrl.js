angular.module('traceroute').controller('TracerouteListCtrl', ['$scope', 'TracerouteList','TracerouteResults', function($scope, TracerouteResults, TracerouteResultIndividual){

  console.log("TracerouteListCtrl: START")

  TracerouteList.list(function(dataList) {
    $scope.trList=dataList

    for (i = 0; i < dataList.length; i++) {
     // $scope.metadatakeys=dataList[i]['metadata-key']
    }
  })




  console.log("TracerouteListCtrl: END")
}]);
