var mapStuff = angular.module('mapStuff', ['ngRoute']);

mapStuff.controller('mapController', ['$scope', '$rootScope', 'treeData',
  function($scope, $rootScope, treeData) {

    /*
     * Defaults
     */

    //Set default state for treeLayer to be turned off
    $scope.neighborhoodLayerVisible = false;

    // default map starts for this project TODO: seperate starts into config file
    $scope.startX = 39.2847064,
      $scope.startY = -76.6204859,
      $scope.startZ = 16;
    $scope.maxBounds = L.latLngBounds(L.latLng(38.5, -77.2), L.latLng(39.8, -75.9));

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
    // $scope.clusteredGeoJSON = L.geoJson('');

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
        "order": 5,
        "label": "Before 2010",
        "color": "#edf8fb",
        "count": 0
      },
      "2010": {
        "order": 4,
        "label": "2010",
        "color": "#b2e2e2",
        "count": 0
      },
      "2011": {
        "order": 3,
        "label": "2011",
        "color": "#66c2a4",
        "count": 0
      },
      "2012": {
        "order": 2,
        "label": "2012",
        "color": "#2ca25f",
        "count": 0
      },
      "2013": {
        "order": 1,
        "label": "2013",
        "color": "#006d2c",
        "count": 0
      }
    };

    function pointSize(data) {
      return 8 + (data / 15);
    }

    //empty layer for the trees
    $scope.treeLayer = L.geoJson('', {
      onEachFeature: function(feature, layer) {
        layer.on('mouseover click', function(e) {
          var iconContent = changeIcon(String(feature.properties.year));
          console.log(iconContent)
          var hover_bubble = new L.Rrose({
              offset: new L.Point(0, -2),
              closeButton: false,
              autoPan: false,
              y_bounds: 149
            })
            .setContent('<div class="row" style="text-align: center;">' +
              `<i class="fa fa-leaf"></i>` +
              '</div>' +
              '<hr>' +
              '<div class="row">' +
              `<b>plant year: </b>${String(feature.properties.year)}</br>` +
              `<b>trees here: </b>${String(feature.properties.total)}</br>` +
              `<b>planting org: </b>${String(feature.properties.planted_by)}</br>` +
              `<b>common name: </b>${feature.properties.common_name}</br>` +
              `<b>genus: </b>${feature.properties.genus}</br>` +
              `<b>species: </b>${feature.properties.species}` +
              '</div>' +
              '</div>')
            .setLatLng(e.latlng)
            .openOn($scope.map);
        });
        layer.on('mouseout', function(e) {
          $scope.map.closePopup()
        });
      },
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
          radius: pointSize(parseInt(feature.properties.total)),
          color: 'black',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.65
        })
      }
    });

    function groupingSize(count){
      return count > 200  ? 22 :
           count > 100  ? 18 :
           count > 50   ? 14 :
           count > 10   ? 10 :
                      6;
    }

    //empty layer for the trees
$scope.treeNeighborhoodPoints = L.geoJson('', {
  onEachFeature: function(feature, layer) {
    layer.on('mouseover click', function(e) {
      var hover_bubble = new L.Rrose({
          offset: new L.Point(0, -2),
          closeButton: false,
          autoPan: false,
          y_bounds: 149
        })
        .setContent(`<div class="row" style="text-align: center;">
          <i class="fa fa-leaf"></i>
          </div>
          <hr>
          <div class="row">
          <b>${String(feature.properties.neighborhood)}</b></br>
          <b>trees here: </b>${String(feature.properties.count)}</br>
          </div>
          </div>`)
        .setLatLng(e.latlng)
        .openOn($scope.map);
    });
    layer.on('mouseout', function(e) {
      $scope.map.closePopup()
    });
  },
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: groupingSize(feature.properties.count),
      color: '#66c2a4',
      weight: .5,
      opacity: 1,
      fillOpacity: 0.65
    });
  }
});
var layerGroup = new L.layerGroup();
      $scope.treeNeighborhoodPie = function(data){
        layerGroup.clearLayers()

        for (var a in data.features) {
          layerGroup.addLayer(new L.PieChartMarker(L.latLng(data.features[a].geometry.coordinates[1], data.features[a].geometry.coordinates[0]), {
            data: {
              'Before 2010': (data.features[a].properties.YRunkown + data.features[a].properties.YR2008 + data.features[a].properties.YR2009),
              '2010': data.features[a].properties.YR2010,
              '2011': data.features[a].properties.YR2011,
              '2012': data.features[a].properties.YR2012,
              '2013': data.features[a].properties.YR2013
            },
            chartOptions: {
              'Before 2010': {
                fillColor: $scope.treeConfig["other"].color,
                color: 'black'
              },
              '2010': {
                fillColor: $scope.treeConfig["2010"].color,
                color: 'black'
              },
              '2011': {
                fillColor: $scope.treeConfig["2011"].color,
                color: 'black'
              },
              '2012': {
                fillColor: $scope.treeConfig["2012"].color,
                color: 'black'
              },
              '2013': {
                fillColor: $scope.treeConfig["2013"].color,
                color: 'black'
              }
            },
            fill: true,
            weight: .5,
            fillOpacity: 1,
            radius: groupingSize(data.features[a].properties.count) + 5,
            barThickness: 5,
            gradient: false,
            highlight: false,
            tooltipOptions: {
              showTooltips: false
            }
          })
        ).addTo($scope.map);

        }
      };

    //function to draw the trees
    $scope.drawTrees = function() {

      //zoomed in pretty far
      if ($scope.map.getZoom() >= 15) {
        treeData.showTrees({
          bbox: $scope.map.getBounds(),
          filter: $scope.disabledYearArray
        }).then(function(data) {
          var total = 0;
          data.features.forEach(function(d) {
            total += parseInt(d.properties.total);
          });
          $rootScope.$broadcast('treeCount', total);
          try {
            layerGroup.clearLayers()
            $scope.map.removeLayer($scope.treeNeighborhoodPoints);
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
      } else {
        //Mid level zoom/start of backend clustered data
        // var precision;
        // if (($scope.map.getZoom() < 15) && ($scope.map.getZoom() > 13)) {
        //   precision = 4;
        // }
        // if ($scope.map.getZoom() <= 13) {
        //   precision = 3;
        // }
        treeData.clusterByReducedPrecision({
          bbox: $scope.map.getBounds(),
          filter: $scope.disabledYearArray
        }).then(function(data) {
          $scope.treeLayer.clearLayers();
          $rootScope.$broadcast('treeCount', data.total);
          try {
            $scope.map.removeLayer($scope.treeNeighborhoodPoints);
          } catch (err) {
            //
          }

          $scope.treeNeighborhoodPie(data);
          $scope.treeNeighborhoodPoints.clearLayers();
          $scope.treeNeighborhoodPoints.addData(data);
          $scope.treeNeighborhoodPoints.addTo($scope.map);

          for (var item in $scope.treeConfig) {
            $scope.treeConfig[item].count = 0;
          };
          for (var key in data.features) {
            //other (unkown, 2008, 2009)
            $scope.treeConfig['other'].count += (data.features[key].properties.YRunkown + data.features[key].properties.YR2008 + data.features[key].properties.YR2009)

            $scope.treeConfig['2010'].count += data.features[key].properties.YR2010
            $scope.treeConfig['2011'].count += data.features[key].properties.YR2011
            $scope.treeConfig['2012'].count += data.features[key].properties.YR2012
            $scope.treeConfig['2013'].count += data.features[key].properties.YR2013
          }

        }, function(err) {
          //failure!
        });
      }
    };

    $scope.neighborhoods = function() {
      //neighborhood button clicked
      if ($scope.neighborhoodLayerVisible) {
        treeData.showNeighborhoods({
          bbox: $scope.map.getBounds(),
          zoomLev: $scope.map.getZoom()
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
      $scope.neighborhoodButton = !$scope.neighborhoodButton;
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
          //ensures at least one year filter is on at all times
          if($scope.disabledYearArray.length < 4){
            $scope.disabledYearArray.push(year);
          }
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

    // $scope.showClusterByReducedPrecisionLayer = L.geoJson('', {
    //   pointToLayer: function(feature, latlng) {
    //     return L.circleMarker(latlng, {
    //       radius: getSize(feature.properties.count),
    //       fillColor: "#ff7800",
    //       color: "#000",
    //       weight: 1,
    //       opacity: 1,
    //       fillOpacity: 0.8
    //     }).addTo($scope.map);
    //   }
    // }).addTo($scope.map);
    // $scope.showClusterByReducedPrecision = false;


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
