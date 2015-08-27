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
    $scope.maxBounds = L.latLngBounds(L.latLng(39.0, -76.7), L.latLng(39.6, -76.4));

    /*
     * Mapping / Leaflet parts
     */

    // create map object, set view to be the default map starts
    $scope.map = L.map('map', {
      'zoomControl': false,
      maxBounds: $scope.maxBounds,
      minZoom: 12
    });

    /*
     * Layers
     */
    // two basemaps being included TODO: put some of these basemap options into config file, maybe array for basemap options
    $scope.basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      'maxZoom': 18,
      'attribution': 'mapbox/OSM',
      'id': 'mapbox.outdoors',
      'accessToken': 'pk.eyJ1IjoiaG9nYW5tYXBzIiwiYSI6ImFhMDUxZWFkNDhkZjkzMTU3MmYwNjJhN2VjYmFhN2U4In0.89HZWfBDYycfNzm1LIq3LA'
    }).addTo($scope.map);

    $scope.satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      'maxZoom': 18,
      'attribution': 'mapbox/OSM',
      'id': 'mapbox.satellite',
      'accessToken': 'pk.eyJ1IjoiaG9nYW5tYXBzIiwiYSI6ImFhMDUxZWFkNDhkZjkzMTU3MmYwNjJhN2VjYmFhN2U4In0.89HZWfBDYycfNzm1LIq3LA'
    });

    /*
      this empty unstyled geojson feeds the clusters
    */
    $scope.clusteredGeoJSON = L.geoJson('');

    $scope.neighborhoodPolyStyle = function(feat) {
      return {
        // fillColor: '#7F9A65',
        // weight: 2,
        // opacity: 1,
        color: '#7F9A65',
        // fillOpacity: 0.7,
        className: 'borders',
        clickable: false
      };
    }

    $scope.neighborhoodsLayer = L.geoJson('', {
      onEachFeature: $scope.onEachFeature,
      style: $scope.neighborhoodPolyStyle
    }).addTo($scope.map);

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
    Tree Layer Control
    */

    $scope.treeConfig = {
      "other": {
        "order": 1,
        "label": "Before 2010",
        "color": "#feb24c",
        "count": 0
      },
      "2010": {
        "order": 2,
        "label": "2010",
        "color": "#fd8d3c",
        "count": 0
      },
      "2011": {
        "order": 3,
        "label": "2011",
        "color": "#fc4e2a",
        "count": 0
      },
      "2012": {
        "order": 4,
        "label": "2012",
        "color": "#e31a1c",
        "count": 0
      },
      "2013": {
        "order": 5,
        "label": "2013",
        "color": "#b10026",
        "count": 0
      }
    };

    //empty layer for the trees
    $scope.treeLayer = L.geoJson('', {
      style: function(feature) {
        switch (String(feature.properties.year)) {
          case "2013":
            return {
              fillColor: $scope.treeConfig["2013"].color
            };
          case "2012":
            return {
              fillColor: $scope.treeConfig["2012"].color
            };
          case "2011":
            return {
              fillColor: $scope.treeConfig["2011"].color
            };
          case "2010":
            return {
              fillColor: $scope.treeConfig["2010"].color
            };
          default:
            return {
              fillColor: $scope.treeConfig["other"].color
            };
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

    //function to draw the trees
    $scope.drawTrees = function() {

      if ($scope.map.getZoom() >= 16) {

        treeData.showTrees({
          bbox: $scope.map.getBounds(),
          filter: $scope.disabledYearArray
        }).then(function(data) {

          $scope.showClusterByReducedPrecisionLayer.clearLayers();
          $rootScope.$broadcast('treeCount', data.features.length);
          try {
            $scope.map.removeLayer($scope.markers);
          } catch (err) {
            //
          }

          for (var item in $scope.treeConfig) {
            $scope.treeConfig[item].count = 0;
          };
          for (var key in data.features) {

            if ($scope.treeConfig[data.features[key].properties.year]) {
              $scope.treeConfig[data.features[key].properties.year].count += 1;
            }
            if (!$scope.treeConfig[data.features[key].properties.year]) {
              $scope.treeConfig["other"].count += 1;
            }
          }

          $scope.treeLayer.clearLayers();
          $scope.treeLayer.addData(data);
          $scope.treeLayer.addTo($scope.map);

        }, function(err) {
          //failure!
        });
      }
      if (($scope.map.getZoom() > 14) && ($scope.map.getZoom() < 16)) {
        treeData.clusterByReducedPrecision({
          precision: 4,
          bbox: $scope.map.getBounds(),
          filter: $scope.disabledYearArray
        }).then(function(data) {
          $scope.treeLayer.clearLayers();
          $rootScope.$broadcast('treeCount', data.total);

          try {
            $scope.map.removeLayer($scope.markers);
          } catch (err) {
            //
          }

          $scope.markers = new L.MarkerClusterGroup({
            showCoverageOnHover: false
          });
          $scope.clusteredGeoJSON.addData(data);

          $scope.markers.addLayer($scope.clusteredGeoJSON);
          $scope.map.addLayer($scope.markers);
        }, function(err) {
          //failure!
        });
      }
      if ($scope.map.getZoom() < 15) {
        treeData.clusterByReducedPrecision({
          precision: 3,
          bbox: $scope.map.getBounds(),
          filter: $scope.disabledYearArray
        }).then(function(data) {
          $scope.treeLayer.clearLayers();
          $rootScope.$broadcast('treeCount', data.total);
          try {
            $scope.map.removeLayer($scope.markers);
          } catch (err) {
            //
          }

          $scope.markers = new L.MarkerClusterGroup({
            showCoverageOnHover: false
          });
          $scope.clusteredGeoJSON.addData(data);

          $scope.markers.addLayer($scope.clusteredGeoJSON);
          $scope.map.addLayer($scope.markers);
        }, function(err) {
          //failure!
        });
      }

    };

    $scope.neighborhoods = function() {
      //neighborhood button clicked
      if ($scope.neighborhoodLayerVisible) {
        treeData.showNeighborhoods({
          bbox: $scope.map.getBounds()
        }).then(function(data) {
          $scope.neighborhoodsLayer.clearLayers();
          $scope.neighborhoodsLayer.addData(data);
          $scope.neighborhoodsLayer.bringToBack();
        }, function(err) {
          console.log(err);
          //failure!
        });
      } else {
        //
        $scope.neighborhoodsLayer.clearLayers();
      }
    }
    $scope.toggleNeighborhoods = function() {
      $scope.neighborhoodLayerVisible = !$scope.neighborhoodLayerVisible;
      $scope.neighborhoods();
    }

    //empty array to push hidden tree years in to
    $scope.disabledYearArray = [];

    //helper function that we will use to simplify pushing in to and out of an
    // array, specifically for the trees
    var indexOf = function(needle) {
      if (typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
      } else {
        indexOf = function(needle) {
          var i = -1,
            index = -1;

          for (i = 0; i < this.length; i++) {
            if (this[i] === needle) {
              index = i;
              break;
            }
          }

          return index;
        };
      }

      return indexOf.call(this, needle);
    };

    //push and splice tree year labels in and out of the array
    $scope.toggleTreeYear = function(year) {
      if (indexOf.call($scope.disabledYearArray, year) === -1) {
        $scope.disabledYearArray.push(year);
      } else {
        $scope.disabledYearArray.splice(indexOf.call($scope.disabledYearArray, year), 1);
      }
      $scope.drawTrees();
    }

    function getSize(d) {
      return d >= 40 ? 20 :
        d >= 21 ? 15 :
        d >= 6 ? 10 :
        d >= 1 ? 4 :
        0;
    }

    $scope.showClusterByReducedPrecisionLayer = L.geoJson('', {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: getSize(feature.properties.count),
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo($scope.map);
      }
    }).addTo($scope.map);
    $scope.showClusterByReducedPrecision = false;


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
