angular.module('treeData',['ngRoute']).factory('treeData', function($http, $q){
    var _this = this;

    this.showTrees = function(data) {
        var defer = $q.defer();
        console.log(data);
            var swX = data.bbox._southWest.lng,
                swY = data.bbox._southWest.lat,
                neX = data.bbox._northEast.lng,
                neY = data.bbox._northEast.lat;

        console.log(swX);
        console.log(swY);
        $http.get('/api/geo/trees?neLat=' + neY + '&neLng=' + neX  + '&swLat=' + swY  + '&swLng=' + swX).success(function(outData) {
              defer.resolve(outData);
            })
            .error(function(e) {
                console.log(e);
                defer.reject('could not find treedat');
            });

        return defer.promise;
    }

    this.helloWorld = function() {
        return 'hello world!';
    }
    return this;
});
