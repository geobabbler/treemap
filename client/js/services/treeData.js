angular.module('treeData', ['ngRoute']).factory('treeData', function($http, $q) {

  this.showTrees = function(data) {
    var swX = String(data.bbox._southWest.lng),
        swY = String(data.bbox._southWest.lat),
        neX = String(data.bbox._northEast.lng),
        neY = String(data.bbox._northEast.lat),
        filter = data.filter;

    var sendFilter = [];

    for (var a in filter) {
      if (filter[a] === 'Before 2010') {
        sendFilter.push.apply(sendFilter, ['2009', '0', '2008']);
      } else {
        sendFilter.push(filter[a]);
      }
    }

    return $http.get(`/api/geo/trees?neLat=${neY}&neLng=${neX}&swLat=${swY}&swLng=${swX}&filter=${sendFilter}`)
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

    return $http.get(`/api/neighborhood?neLat=${neY}&neLng=${neX}&swLat=${swY}&swLng=${swX}&zoomLev=${zoomLev}`)
      .then(function(response){
        return response.data;
      });
  }

  this.getZoomNeighborhoods = function(data) {
    var searchString = String(data.val);

    return $http.get(`/api/neighborhoodNames?searchString=${data}`)
      .then(function(response){
        return response.data;
      });
  }

  this.getSingleNeighborhoods = function(data) {
    var data = String(data);

    return $http.get(`/api/getSingleNeighborhood?neighborhood=${data}`)
      .then(function(response){
        return response.data;
      });
  }

  /*TODO - Is this still being used?*/
  this.clusterByReducedPrecision = function(data) {

    var swX = String(data.bbox._southWest.lng),
        swY = String(data.bbox._southWest.lat),
        neX = String(data.bbox._northEast.lng),
        neY = String(data.bbox._northEast.lat),
        filter = data.filter;

    var sendFilter = [];

    for (var a in filter) {
      if (filter[a] === 'Before 2010') {
        sendFilter.push.apply(sendFilter, ['2009', '0', '2008']);
      } else {
        sendFilter.push(filter[a]);
      }
    };

    return $http.get(`/api/geo/clusterByReducedPrecision?neLat=${neY}&neLng=${neX}&swLat=${swY}&swLng=${swX}&filter=${sendFilter}`)
      .then(function(response){
        return response.data;
      });
  }

  return this;
});
