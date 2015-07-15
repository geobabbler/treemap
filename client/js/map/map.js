var mapStuff = angular.module('mapStuff',['ngRoute']);

mapStuff.controller('mapController', ['$scope', '$rootScope', 'treeData',
	function($scope, $rootScope, treeData){



			// default baltimore starts
		    var startX = 39.290452,
		        startY = -76.614090,
		        startZ = 13;
			$scope.map = L.map('map',{
				'zoomControl': false
			}).setView([startX, startY], startZ);
		    // $scope.map = L.map('map',{
		    // 	'inertia': false,
		    //     'minZoom': 18,
		    //     'maxZoom': 6,
		    //     ,
		    //     'scrollWheelZoom': false,
		    //     'center': ,
		    //     'zoom': startZ
		    // });

		    $scope.basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		        'maxZoom': 18,
		        'attribution': '© mapbox',
		        'id': 'mapbox.outdoors',
		        'accessToken': 'pk.eyJ1IjoiaG9nYW5tYXBzIiwiYSI6ImFhMDUxZWFkNDhkZjkzMTU3MmYwNjJhN2VjYmFhN2U4In0.89HZWfBDYycfNzm1LIq3LA'
		    }).addTo($scope.map);

		    $scope.satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		        'maxZoom': 18,
		        'attribution': '© mapbox',
		        'id': 'mapbox.satellite',
		        'accessToken': 'pk.eyJ1IjoiaG9nYW5tYXBzIiwiYSI6ImFhMDUxZWFkNDhkZjkzMTU3MmYwNjJhN2VjYmFhN2U4In0.89HZWfBDYycfNzm1LIq3LA'
		    });


			/*
				this section is for map controlls
			*/
		    $rootScope.$on('baseLayerChange', function(e,d){
		    	if(d === 'road'){
						console.log('sup');
		    		$scope.basemap.addTo($scope.map);
		    		try {
		    			$scope.map.removeLayer($scope.satellite);
		    		} catch(err){
		    			//err
		    		}
		    	} else {
		    		$scope.satellite.addTo($scope.map);
		    		try {
		    			$scope.map.removeLayer($scope.roads);
		    		} catch(err){
		    			//err
		    		}
		    	}
		    });

		    $rootScope.$on('zoomChange', function(e,d){
		    	if(d === 'zoomIn'){
		    		$scope.map.zoomIn();
		    	}
		    	if(d === 'zoomOut') {
		    		$scope.map.zoomOut();
		    	}
		    });

		    $rootScope.$on('showLayer', function(e,d){
		    	var data2send = {bbox: $scope.map.getBounds()};
		    	if(d === 'plantings'){
		    		treeData.showTrees(data2send).then(function(data){
		    			//success!
		    			console.log(data);
		    		},function(err){
		    			//failure!
		    			console.log(err);
		    		});
		    	}
		    });

	//
}]);

mapStuff.directive('map', function() {
	return {
		templateUrl: 'js/layout/partials/map.tpl.html',
		restrict: 'E',
		controller: 'mapController'

	};
});
