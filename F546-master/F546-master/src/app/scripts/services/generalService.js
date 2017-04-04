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
      //console.log("In delay");
      for (j = 0; j < respObj.length; j++) {
        //series[j] = respObj[j]['val'];
        series[j] = respObj[j]['val']['minimum'];
      }
    }
    if(action == "bandwidth")
    {
      //console.log("In bandwidth");
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
      result.push(math.round(alpha * series[n] + (1-alpha)*result[n-1],3));
    }
    return result;
  }


  this.HWFunction3 = function(respObj, alpha, action,beta,gamma)
  {
    //console.log("HWForecasting");

    var series = [];
    if(action == "delay")
    {
      //console.log("In delay");
      for (j = 0; j < respObj.length; j++) {
        //series[j] = respObj[j]['val'];
        series[j] = respObj[j]['val']['minimum'];
      }
    }
    if(action == "bandwidth")
    {
      //console.log("In bandwidth");
      for (j = 0; j < respObj.length; j++) {
        series[j] = respObj[j]['val'];
        //series[j] = respObj[j]['val']['minimum'];
      }
    }

    seasonals = {};
    seasonaverages = [];
    var slen = series.length;
    //console.log(series.length);
    var n_preds = 0;
    var trend = 0;
    var smooth = 0;
    var sum = 0;
    result = [];
    var last_smooth = 0;
    nseasons = series.length/slen;
    //console.log(n_seasons);
    result = [];

    function initial_trend(series, slen)
    {
      sum = 0.0
      for (o = 0 ; o < slen ; o++){
        sum += (series[o+slen] - series[o]) / slen
      }

      return sum / slen
    }

    function getNum(val) {
      if (isNaN(val)) {
        return 0;
      }
      return val;
    }

    function initial_seasonal_components(series, slen){
      seasonals = {}
      season_averages = []
      n_seasons = slen/slen

      for (p = 0 ; p < n_seasons ; p++){
        sum1 = 0;
        for (q = 0 ; q < slen ; q++) {
          sum1 = sum1 + series[q];
        }
        season_averages.push(sum1/slen)
      }

      for (h = 0 ; h < slen ; h++){
        sum_of_vals_over_avg = 0.0
        for (p = 0 ; p < n_seasons ; p++){
          sum_of_vals_over_avg += series[slen*p+h]-season_averages[p]
          seasonals[h] = sum_of_vals_over_avg/n_seasons
        }
      }
      return seasonals
    }

    result = []
    seasonals = initial_seasonal_components(series, slen)
    //console.log(slen);
    for (g = 0 ; g < slen+n_preds ;g++){

      if (g == 0){
        //console.log("here")
        smooth = series[0];
        trend = initial_trend(series, slen);
        result.push(series[0]);
      }

      else if (g >= slen)
      {
        m = g - slen + 1
        result.push((smooth + m*trend) + seasonals[g%slen])
      }

    else{
        //console.log("here2")
        //console.log("series[g] = "+series[g])
        //console.log("seasonals[g%slen] = "+ seasonals[g%slen]);
        //console.log("trend = "+beta * (smooth-last_smooth) + (1-beta)*trend)
        val = series[g]
        //console.log("alpha*(val-seasonals[g%slen]) = "+ alpha*(val-seasonals[g%slen]))
        //console.log("(1-alpha)*(smooth+trend) = "+ (smooth+trend))
        last_smooth, smooth = smooth, alpha*(val-seasonals[g%slen]) + getNum((1-alpha)*(smooth+trend))
        trend = getNum(beta) * getNum((smooth-last_smooth)) + getNum((1-beta)*trend)
        seasonals[g%slen] = getNum(gamma*(val-smooth)) + getNum((1-gamma)*seasonals[g%slen])
        result.push(math.round(getNum(smooth+trend+seasonals[g%slen]),3))
      }
    }

    //console.log("Return res : "+result);
    return result


    /*
    for (o = 0; o < slen; o++)
    {
      sumofvalsoveravg = 0.0;
      for (p = 0; p < nseasons; p++)
      {
        //console.log("Here2 " + i);
        sumofvalsoveravg = sumofvalsoveravg + series[slen*p+o]-seasonaverages[p];
        seasonals[o] = sumofvalsoveravg/nseasons;
      }

    }

    console.log("Seasonal : " +seasonals);
   for( o = 0; o < slen+npreds; o++)
    {
      console.log("Here3 " + i);
      if (o == 0)
      {
        console.log("Here4 " + i);
        smooth = series[0];
        sum = 0.0
        for (k = 0 ; k < slen; k++)
        {
          sum += (series[k+slen] - series[k]) / slen
        }

        trend = sum / slen;
        result.push(series[0]);
        continue;
      }

      if (o >= series.length)
      {
        console.log("Here5 " + i);
        m = o - series.length + 1;
        result.push((smooth + m*trend) + seasonals[o%slen]);
      }

      else
      {
        console.log("Here6 " + i);

        val = series[o];
        last_smooth = smooth;
        smooth =  alpha*(val-seasonals[o%slen]) + (1-alpha)*(smooth+trend);
        trend = beta * (smooth-last_smooth) + (1-beta)*trend;
        seasonals[o%slen] = gamma*(val-smooth) + (1-gamma)*seasonals[o%slen];
        result.push(smooth+trend+seasonals[o%slen]);
        console.log(val);
        console.log((1-alpha)*(smooth+trend));
        console.log(last_smooth);
        console.log(smooth);
        console.log(trend);
        console.log(seasonals[o%slen]);
        console.log(smooth+trend+seasonals[o%slen]);
      }
    }


    console.log("Return res : "+result);

    return result;
*/
  }
});

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

