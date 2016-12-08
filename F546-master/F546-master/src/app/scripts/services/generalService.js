var generalServices = angular.module('GeneralServices', []);

generalServices.factory('IPAddressIdentifierService', function () {
  return {
    ipv4: function (ipAddr) {
      if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(ipAddr)) {
        //Valid IPV4 Address
        return true
      } else {
        //Invalid IPV4 Address
        return false
      }
    },
    ipv6: function (ipAddr) {
      if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(ipAddr)) {
        //Valid IPV6 Address
        return true
      } else {
        //Invalid IPV6 Address
        return false
      }
    }
  }
});

generalServices.service('HWForecast', function() {

  this.HWFunction = function(respObj, alpha, action)
  {
    //console.log("HWForecasting");

    var series = [];
    if(action == "delay")
    {
      console.log("In delay");
      for (j = 0; j < respObj.length; j++) {
        //series[j] = respObj[j]['val'];
        series[j] = respObj[j]['val']['minimum'];
      }
    }
    if(action == "bandwidth")
    {
      console.log("In bandwidth");
      for (j = 0; j < respObj.length; j++) {
        series[j] = respObj[j]['val'];
        //series[j] = respObj[j]['val']['minimum'];
      }
    }

    //console.log("series = "+series);
    //console.log("series[0] = "+series[0]);
    //console.log("alpha = "+alpha);
    var result = [series[0]];
    var n;
    for (n = 1; n<series.length;n++){
      result.push(alpha * series[n] + (1-alpha)*result[n-1]);
    }
    return result;
  };
})

// NOTE THAT THIS IS A SERVICE
generalServices.service('UnixTimeConverterService', function () {

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
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var seconds = date.getSeconds();
      if(seconds<10){
        seconds = "0"+seconds;
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

generalServices.factory('CurrentTimeUnixService', function () {
  return {

    // time: function () {
    //
    //   date = new Date(Date.now() * 1000),
    //     timevalues = [
    //
    //       date.getHours(),
    //       date.getMinutes(),
    //       date.getSeconds(),
    //     ];
    //
    //   return timevalues;
    // },

    time: function () {

    // var date = new Date(Date.now() * 1000)
    var date = new Date()

    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var seconds = date.getSeconds();
    if(seconds<10){
      seconds = "0"+seconds;
    }
    var timevalues = [

      hours,
      minutes,
      seconds,
      ampm
    ];

    return timevalues;
  }
  }
});

generalServices.factory('HostService', [function () {

  var host = "http://ps2.jp.apan.net/esmond/perfsonar/archive/";

  // var host = "http://hpc-perfsonar.usc.edu/esmond/perfsonar/archive/";


  return {
    getHost: function () {
      return host;
    },

    setHost: function(hostName){
      host = hostName;
      return host;
    }
  }

}]);

generalServices.factory('UniqueArrayService', [function () {

  return {
    getUnique: function (arr) {
        var i,
          len=arr.length,
          out=[],
          obj={};

        for (i=0;i<len;i++) {
          obj[arr[i]]=0;
        }
        for (i in obj) {
          out.push(i);
        }
        return out;
    }



  }

}]);

