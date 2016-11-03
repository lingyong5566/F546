var HWForecast = angular.module('HWForecast', []);

HWForecast.controller('HWForecastCtrl', ['$scope', function ($scope) {

  $scope.HWFunction = function(series, alpha)
  {
    var result = [series[0]];
    var n;
    for (n = 1; n<series.length;n++){
      result.append(alpha * series[n] + (1-alpha)*result[n-1]);
    }
    return result;
  };

}]);
