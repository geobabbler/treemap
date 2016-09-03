angular.module('treeData', ['ngRoute']).factory('treeData', function($http, $q) {

    var year0 = 2013; //new Date().getFullYear();
    var year1 = year0 - 1;
    var year2 = year1 - 1;
    var year3 = year2 - 1;
    var year4 = year3 - 1;

  this.showTrees = function(data) {
    var swX = String(data.bbox._southWest.lng),
        swY = String(data.bbox._southWest.lat),
        neX = String(data.bbox._northEast.lng),
        neY = String(data.bbox._northEast.lat),
        filter = data.filter,
        baseyear = year0;

    var sendFilter = [];

    for (var a in filter) {
      if (filter[a] === 'Before ' + year3.toString()) {
        sendFilter.push.apply(sendFilter, ['0', (year3 - 1).toString(), (year3 - 2).toString(), (year3 - 3).toString(), (year3 - 4).toString(), (year3 - 5).toString(), (year3 - 6).toString(), (year3 - 7).toString(), (year3 - 8).toString(), (year3 - 9).toString(), (year3 - 10).toString()]);
      } else {
        sendFilter.push(filter[a]);
      }
    }

    return $http.get('/api/geo/trees?neLat=' + neY + '&neLng=' + neX + '&swLat=' + swY + '&swLng=' + swX + '&baseyear=' + baseyear.toString() + '&filter=' + sendFilter)
      .then(function(response) {
        return response.data;
      });
  }

  this.showNeighborhoods = function(data) {
    var swX = String(data.bbox._southWest.lng),
        swY = String(data.bbox._southWest.lat),
        neX = String(data.bbox._northEast.lng),
        neY = String(data.bbox._northEast.lat),
        zoomLev = String(data.zoomLev);

    return $http.get('/api/neighborhood?neLat=' + neY + '&neLng=' + neX + '&swLat=' + swY + '&swLng=' + swX + '&zoomLev=' + zoomLev)
      .then(function(response){
        return response.data;
      });
  }

  this.getZoomNeighborhoods = function(data) {
    var searchString = String(data.val);

    return $http.get('/api/neighborhoodNames?searchString=' + data)
      .then(function(response){
        return response.data;
      });
  }

  this.getSingleNeighborhoods = function(data) {
    var data = String(data);

    return $http.get('/api/getSingleNeighborhood?neighborhood=' + data)
      .then(function(response){
        return response.data;
      });
  }

  this.geocode = function(data, callback){
    var d = String(data);
    var r = $http.get('/api/geo/address?address=' + data)
      .then(function(response){
        callback(response);
      });
          //$http.get('/api/geo/address?address='+item);
      //alert(o);
      //$scope.items.push(item);
      //$scope.newItem = { title: '' }; // set newItem to a new object to lose the reference
    //}
  }

  /*TODO - Is this still being used?*/
  this.clusterByReducedPrecision = function(data) {

    var swX = String(data.bbox._southWest.lng),
        swY = String(data.bbox._southWest.lat),
        neX = String(data.bbox._northEast.lng),
        neY = String(data.bbox._northEast.lat),
        filter = data.filter,
        baseyear = year0;

    var sendFilter = [];

    for (var a in filter) {
     if (filter[a] === 'Before ' + year3.toString()) {
        sendFilter.push.apply(sendFilter, ['0', (year3 - 1).toString(), (year3 - 2).toString(), (year3 - 3).toString(), (year3 - 4).toString(), (year3 - 5).toString(), (year3 - 6).toString(), (year3 - 7).toString(), (year3 - 8).toString(), (year3 - 9).toString(), (year3 - 10).toString()]);
      } else {
        sendFilter.push(filter[a]);
      }
    };

    return $http.get('/api/geo/clusterByReducedPrecision?neLat=' + neY + '&neLng=' + neX + '&swLat=' + swY + '&swLng=' + swX + '&baseyear=' + baseyear.toString() + '&filter=' + sendFilter)
      .then(function(response){
        return response.data;
      });
  }

  return this;
});
