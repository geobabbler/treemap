var mapStuff = angular.module('mapStuff', ['ngRoute']);

mapStuff.controller('mapController', ['$scope', '$rootScope', 'treeData',
  function($scope, $rootScope, treeData) {

		/*
     * Defaults
    */

    //Set default state for treeLayer to be turned off
    $scope.neighborhoodLayerVisible = false;

    // default map starts for this project TODO: seperate starts into config file
    $scope.startX = 39.290452,
    $scope.startY = -76.614090,
    $scope.startZ = 16;

		/*
     * Mapping / Leaflet parts
    */

		// create map object, set view to be the default map starts
		$scope.map = L.map('map', {'zoomControl': false});

		/*
     * Layers
    */
		// two basemaps being included TODO: put some of these basemap options into config file, maybe array for basemap options
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

		$scope.treeLayer = L.geoJson('', {
			style: function(feature) {
				switch (feature.properties.year) {
					case 2010: return { fillColor: "#fed976"};
					case 2011: return { fillColor: "#feb24c"};
					case 2012: return { fillColor: "#fd8d3c"};
					case 2013: return { fillColor: "#fc4e2a"};
					case 2014: return { fillColor: "#e31a1c"};
					case 2015: return { fillColor: "#b10026"};
					default: return { fillColor: "blue"};
				}
			},
			pointToLayer: function(feature, latlng) {
				return L.circleMarker(latlng, {
					radius: 8,
					color: 'white',
					weight: .5,
					opacity: 1,
					fillOpacity: 0.65
				})
			}
		});
    function highlightFeature(feature, layer) {
        console.log(feature)
    }

    function resetHighlight(e) {
        //stuff?
        console.log(e);
    }

    $scope.onEachFeature = function(feature, layer) {
        layer.on({
            mouseover: highlightFeature(feature, layer),
            mouseout: resetHighlight
        });
    }
    $scope.neighborhoodsLayer = L.geoJson('', {onEachFeature: $scope.onEachFeature}).addTo($scope.map);
    /*
    *	this section is for map events
    */

		//when the user clicks the icon that toggles the basemap
    $rootScope.$on('baseLayerChange', function(e, d) {
			// TODO build off array of basemaps in config maybe?
      if (d === 'road') {
        $scope.basemap.addTo($scope.map);
        $scope.map.removeLayer($scope.satellite);
      } else {
        $scope.satellite.addTo($scope.map);
        $scope.map.removeLayer($scope.basemap);
      }
    });

		//when the user clicks the zoom in and zoom out buttons
    $rootScope.$on('zoomChange', function(e, d) {
      if (d === 'zoomIn') {
        $scope.map.zoomIn();
      }
      $scope.map.zoomOut();
    });

		/*
		not sure where to put this yet
		*/

		$scope.drawTrees = function(){
      if($scope.map.getZoom() > 15){
  			treeData.showTrees({bbox: $scope.map.getBounds()}).then(function(data) {
  				$rootScope.$broadcast('treeCount', data.features.length);
          $scope.treeLayer.clearLayers();
  				$scope.treeLayer.addData(data);
  				$scope.treeLayer.addTo($scope.map);
  			}, function(err) {
  				console.log(err);
  				//failure!
  			});
      }
      else {
        $scope.treeLayer.clearLayers();
        console.log('zoom in to see trees');
      }
		};

    $scope.neighborhoods = function() {
      //neighborhood button clicked
      if($scope.neighborhoodLayerVisible){
        treeData.showNeighborhoods({bbox: $scope.map.getBounds()}).then(function(data) {
          $scope.neighborhoodsLayer.clearLayers();
          $scope.neighborhoodsLayer.addData(data);
          $scope.neighborhoodsLayer.bringToBack();
  			}, function(err) {
  				console.log(err);
  				//failure!
  			});
      }
      else {
        //
        $scope.neighborhoodsLayer.clearLayers();
      }
    }
    $scope.toggleNeighborhoods = function(){
        $scope.neighborhoodLayerVisible = !$scope.neighborhoodLayerVisible;
        $scope.neighborhoods();
    }


    $scope.map.on('moveend', $scope.drawTrees);
    $scope.map.on('load', $scope.drawTrees);
    $scope.map.on('moveend', $scope.neighborhoods);

    //file loaded, set the view so the listeners work
    $scope.map.setView([$scope.startX, $scope.startY], $scope.startZ);
  }
]);

mapStuff.directive('map', function() {
  return {
    templateUrl: 'js/layout/partials/map.tpl.html',
    restrict: 'E',
    controller: 'mapController'

  };
});
