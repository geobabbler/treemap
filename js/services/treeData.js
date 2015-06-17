angular.module('treeData',['ngRoute']).factory('stormData', function($http, $q){
    var _this = this;

    function formatLatLng(inval){
        if((inval.match("N$")) || (inval.match("E$"))){
            return inval.substring(0, inval.length - 1);
        }
        else{
            return '-' + inval.substring(0, inval.length - 1);
        }
    }

    /*
    This crunches 
    */
    this.processStorms = function() {
        var defer = $q.defer();

        $http.get('data/hurdat2-1851-2014-050515.txt')
            .success(function(data) {
                var splitData = data.split(/\r?\n/);
                // angular.extend(_this, splitData);
                
                var hurricanes = [];
                splitData.forEach(function(value, index) {
                    var attributes = value.split(',');
                    
                    if(attributes.length === 4) {
                        //close previous hurricane
                        try{
                            hurricanes.push(currentHurricane);
                        }
                        catch(e){
                            //e
                        }
                        currentHurricane = {
                            id: attributes[0],
                            name: attributes[1],
                            path: []
                        };
                        // console.log('New Hurricane:', currentHurricane);

                    } else {
                        if(attributes[4]){
                            currentNode = [formatLatLng(attributes[4]) + ', ' + formatLatLng(attributes[5])];
                            currentHurricane.path.push(currentNode);
                        }
                        // attributes.forEach(function(value, index) {
                        //     tempFieldName = 'field_' + index;
                        //     currentNode[tempFieldName] = value;
                        // });
                    }
                });
                hurricanes.push(currentHurricane);
                // console.log(hurricanes);
                console.log('hi');

                defer.resolve(splitData);
            })
            .error(function() {
                defer.reject('could not find someFile.json');
            });

        return defer.promise;
    }

    this.helloWorld = function() {
        return 'hello world!';
    }
    return this;
});