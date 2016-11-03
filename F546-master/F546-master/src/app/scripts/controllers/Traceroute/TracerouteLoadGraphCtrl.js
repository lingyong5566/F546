angular.module('traceroute').controller('TracerouteLoadGraphCtrl', ['$scope','TracerouteResults', function($scope, TracerouteResults){
  console.log("TracerouteLoadGraphCtrl: START")

  TracerouteResults.get({ metadata_key: dataList[i]['metadata-key'] }, function(trResult) {


  })

}]);
