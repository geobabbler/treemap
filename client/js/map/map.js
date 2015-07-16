var mapStuff = angular.module('mapStuff',['ngRoute']);

mapStuff.controller('mapController', ['$scope', '$rootScope', 'treeData',
	function($scope, $rootScope, treeData){


			// default baltimore starts
		    var startX = 39.290452,
		        startY = -76.614090,
		        startZ = 15;
			$scope.map = L.map('map',{
				'zoomControl': false
			}).setView([startX, startY], startZ);


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
		    		$scope.basemap.addTo($scope.map);
		    		try {
		    			$scope.map.removeLayer($scope.satellite);
		    		} catch(err){
		    			console.log('error removing satellite')
		    		}
		    	} else {
		    		$scope.satellite.addTo($scope.map);
		    		try {
		    			$scope.map.removeLayer($scope.basemap);
		    		} catch(err){
							console.log('error removing basemap')
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

				//Set default state for treeLayer to be false || turned off
				$scope.treeLayerVisible = !$scope.treeLayerVisible;

				//when the toggle tree event is fired elseware in the app
		    $rootScope.$on('toggleTrees', function(e,d){

			    if(d === 'plantings'){
						if($scope.map.getZoom() >= 16){

							//if treeLayerVisible is true
							if($scope.treeLayerVisible){
								// request tree data from service
				    		treeData.showTrees({bbox: $scope.map.getBounds()}).then(function(data){
									$rootScope.$broadcast('treeCount', data.features.length);
				    			//success!
									$scope.treeLayer = L.geoJson(data, {
										style: function(feature) {
												switch (feature.properties.year) {
														case 2010:   return {fillColor: "#fed976"};
														case 2011:   return {fillColor: "#feb24c"};
														case 2012:   return {fillColor: "#fd8d3c"};
														case 2013:   return {fillColor: "#fc4e2a"};
														case 2014:   return {fillColor: "#e31a1c"};
														case 2015:   return {fillColor: "#b10026"};
														default: 	 return {fillColor: "blue"};
												}
										},
										pointToLayer: function (feature, latlng) {
											return L.circleMarker(latlng, {
													radius: 8,
													color: 'white',
													weight: .5,
													opacity: 1,
													fillOpacity: 0.8
											})
										}
									}).addTo($scope.map);

				    		},function(err){
				    			//failure!
				    			console.log(err);
				    		});
								$scope.map.on('moveend', function(){

									treeData.showTrees({bbox: $scope.map.getBounds()}).then(function(data){
					    			//success!
										$rootScope.$broadcast('treeCount', data.features.length);
										$scope.map.removeLayer($scope.treeLayer);
					    			$scope.treeLayer = L.geoJson(data, {
											style: function(feature) {
									        switch (feature.properties.year) {
									            case 2010:   return {fillColor: "#fed976"};
															case 2011:   return {fillColor: "#feb24c"};
															case 2012:   return {fillColor: "#fd8d3c"};
															case 2013:   return {fillColor: "#fc4e2a"};
															case 2014:   return {fillColor: "#e31a1c"};
															case 2015:   return {fillColor: "#b10026"};
															default: 	 return {fillColor: "blue"};
									        }
									    },
											pointToLayer: function (feature, latlng) {
												return L.circleMarker(latlng, {
												    radius: 8,
														color: 'white',
												    weight: .5,
												    opacity: 1,
												    fillOpacity: 0.8
												})
											}
										}).addTo($scope.map);

					    		},function(err){
					    			//failure!
					    			console.log(err);
					    		});
								});
				    	}
							else {
								$scope.map.removeLayer($scope.treeLayer);
							}
							$scope.treeLayerVisible = !$scope.treeLayerVisible;
						}
						else {
							alert('zoom in further to see the trees, you are at zoom level '+ $scope.map.getZoom() + ' and need to be at 16 17 or 18');
						}
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
