var mapStuff = angular.module('mapStuff',['ngRoute']);

mapStuff.controller('mapController', ['$scope', '$rootScope', 'stormData',
	function($scope, $rootScope, stormData){



			// default baltimore starts
		    var startX = 39.290452,
		        startY = -76.614090,
		        startZ = 13;

		    scope.map = L.map('map',{
		    	'inertia': false,
		        'minZoom': 18,
		        'maxZoom': 6,
		        'zoomControl': false, 
		        'scrollWheelZoom': false
		    }).setView([startX, startY], startZ);

		    $scope.basemap = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		        'maxZoom': 18,
		        'attribution': '© mapbox',
		        'id': 'examples.map-i875mjb7'
		    }).addTo(map);

		    $scope.satellite = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		        'maxZoom': 18,
		        'attribution': '© mapbox',
		        'id': 'examples.map-20v6611k'
		    });


			/*
				this section is for map controlls
			*/
		    $rootScope.$on('baseLayerChange', function(e,d){
		    	$if(d === 'road'){
		    		$scope.basemap.addTo(map);
		    		try {
		    			map.removeLayer($scope.satellite);
		    		} catch(err){
		    			//err
		    		}
		    	} else {
		    		$scope.satellite.addTo(map);
		    		try {
		    			map.removeLayer($scope.roads);
		    		} catch(err){
		    			//err
		    		}
		    	}
		    	}
		    });

		    $rootScope.$on('zoomChange', function(e,d){
		    	if(d === 'zoomIn'){
		    		$scope.maps.zoomIn()
		    		map.zoomIn;
		    	}
		    	if(d === 'zoomOut'){
		    		console.log('gonads');
		    		map.zoomOut;
		    	}
		    	else {
		    		console.log('ugh');
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