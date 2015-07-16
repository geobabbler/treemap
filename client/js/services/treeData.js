angular.module('treeData',['ngRoute']).factory('treeData', function($http, $q){
    var _this = this;

    this.showTrees = function(data) {
        var defer = $q.defer();

            var swX = data.bbox._southWest.lng,
                swY = data.bbox._southWest.lat,
                neX = data.bbox._northEast.lng,
                neY = data.bbox._northEast.lat;
        $http.get('/api/geo/trees?neLat=' + String(neY) + '&neLng=' + String(neX)  + '&swLat=' + String(swY)  + '&swLng=' + String(swX))
          .success(function(outData) {
              defer.resolve(outData);
            })
            .error(function(e) {
                defer.reject('could not find treedat');
            });

        return defer.promise;
    }

    this.helloWorld = function() {
        return 'hello world!';
    }
    return this;
});
