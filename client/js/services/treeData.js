angular.module('treeData',['ngRoute']).factory('treeData', function($http, $q){
    var _this = this;

    this.showTrees = function(data) {
        console.log(data);
        var defer = $q.defer();

        $http.get('/api/geo/trees?' + data.bbox).success(function(data) {
                defer.resolve(splitData);
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