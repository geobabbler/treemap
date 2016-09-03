var mapStuff = angular.module('mapStuff', ['ngRoute']);

mapStuff.controller('mapController', ['$scope', '$rootScope', 'treeData',
  function($scope, $rootScope, treeData) {

    /***************************************************************************
     * Defaults and configs
     ***************************************************************************/
    var year0 = 2013; //new Date().getFullYear();
    var year1 = year0 - 1;
    var year2 = year1 - 1;
    var year3 = year2 - 1;
    var year4 = year3 - 1;

    /*function getQueryParams(qs) {
      qs = qs.split('+').join(' ');

      var params = {},
          tokens,
          re = /[?&]?([^=]+)=([^&]*)/g;

      while (tokens = re.exec(qs)) {
          params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
      }

      return params;
    }

    var q = getQueryParams(window.location.search);*/
    //Set default state for treeLayer to be turned off
    $scope.neighborhoodLayerVisible = true;

    // default map starts for this project TODO: seperate starts into config file
    $scope.startX = 39.286012;
    $scope.startY = -76.609674;
    $scope.startZ = 16;
    $scope.maxBounds = L.latLngBounds(L.latLng(38.5, -77.2), L.latLng(39.8, -75.9));

    /***************************************************************************
     * Mapping / Control parts
    ***************************************************************************/

    // create map object, set view to be the default map starts
    $scope.map = L.map('map', {
      zoomControl: false,
      maxBounds: $scope.maxBounds,
      attributionControl: false,
      minZoom: 12
    });

    var attrib = L.control.attribution({position: 'bottomright', prefix: false}).addAttribution('<img src="logo.png" style="display:block; margin: auto; width: 40%; height: 40%;"/><br/><a href="http://leafletjs.com" target="_blank">Leaflet</a> | <span style="font-weight: bold; color: #248920">Tree</span>Baltimore, Mapbox, OSM');
    attrib.addTo($scope.map);

    $rootScope.$on('zoomChange', function(e, d) {
      if (d === 'zoomIn') {
        $scope.map.zoomIn();
      }
      $scope.map.zoomOut();
    });

    /***************************************************************************
     * Base Layers
    ***************************************************************************/
    $scope.basemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      'maxZoom': 18,
      //'attribution': 'mapbox/OSM',
      'id': 'mapbox.outdoors',
      'accessToken': 'pk.eyJ1IjoiaG9nYW5tYXBzIiwiYSI6ImFhMDUxZWFkNDhkZjkzMTU3MmYwNjJhN2VjYmFhN2U4In0.89HZWfBDYycfNzm1LIq3LA'
    }).addTo($scope.map);

    $scope.satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      'maxZoom': 18,
      //'attribution': 'mapbox/OSM',
      'id': 'mapbox.satellite',
      'accessToken': 'pk.eyJ1IjoiaG9nYW5tYXBzIiwiYSI6ImFhMDUxZWFkNDhkZjkzMTU3MmYwNjJhN2VjYmFhN2U4In0.89HZWfBDYycfNzm1LIq3LA'
    });

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


    /***************************************************************************
    Tree Layer Control
    ***************************************************************************/

    $scope.treeConfig = {
      "other": {
        "order": 5,
        "label": "Before " + year3.toString(),
        "color": "#edf8fb",
        "count": 0
      },
      "2010": {
        "order": 4,
        "label": year3.toString(),
        "color": "#b2e2e2",
        "count": 0
      },
      "2011": {
        "order": 3,
        "label": year2.toString(),
        "color": "#66c2a4",
        "count": 0
      },
      "2012": {
        "order": 2,
        "label": year1.toString(),
        "color": "#2ca25f",
        "count": 0
      },
      "2013": {
        "order": 1,
        "label": year0.toString(),
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
          var hover_bubble = new L.Rrose({
              offset: new L.Point(0, -2),
              closeButton: false,
              autoPan: false,
              y_bounds: 149
            })
            .setContent('<div class="row" style="text-align: center;">' +
              '<i class="fa fa-leaf"></i>' +
              '</div>' +
              '<hr>' +
              '<div class="row">' +
              '<b>Plant Year: </b>' + feature.properties.year + '</br>' +
              '<b>Trees Here: </b>' + feature.properties.total + '</br>' +
              '<b>Planting Org: </b>' + feature.properties.planted_by + '</br>' +
              '<b>Common Name: </b>' + feature.properties.common_name + '</br>' +
              '<b>Genus: </b>' +feature.properties.genus + '</br>' +
              '<b>Species: </b>' + feature.properties.species + '</br>' +
              '<b>Neighborhood: </b>' + feature.properties.neighborhoodname + '</br>' +
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
          case year0.toString():
            return {
              fillColor: $scope.treeConfig["2013"].color
            };
          case year1.toString():
            return {
              fillColor: $scope.treeConfig["2012"].color
            };
          case year2.toString():
            return {
              fillColor: $scope.treeConfig["2011"].color
            };
          case year3.toString():
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

    function groupingSize(count) {
      return count > 200 ? 22 :
        count > 100 ? 18 :
        count > 50 ? 14 :
        count > 10 ? 10 :
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
            .setContent('<div class="row" style="text-align: center;">' +
          '<i class="fa fa-leaf"></i>' +
          '</div>' +
          '<hr>' +
          '<div class="row">' +
          '<b>' + feature.properties.neighborhood + '</b></br>' +
          '<b>Trees Here: </b>' + feature.properties.count + '</br>' +
          '</div>' +
          '</div>')
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
          fillColor: '#66c2a4',
          color: 'black',
          weight: .5,
          opacity: 1,
          fillOpacity: 0.65
        });
      }
    });

    var layerGroup = new L.layerGroup();

    $scope.treeNeighborhoodPie = function(data) {
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
          highlight: false
        })).addTo($scope.map);

      }
    };

    //function to draw the trees
    $scope.drawTrees = function() {

      //zoomed in pretty far
      if ($scope.map.getZoom() >= 15) {
        treeData.showTrees({
          bbox: $scope.map.getBounds(),
          filter: $scope.disabledYearArray,
          baseyear: year0
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
            var yr = data.features[key].properties.year;
            var leaf = "";
            switch (yr.toString()) {
              case year0.toString():
                leaf = "2013";
                break;
              case year1.toString():
                leaf = "2012";
                break;
              case year2.toString():
                leaf = "2011";
                break;
              case year3.toString():
                leaf = "2010";
                break;
              default:
                leaf = "other";
          }
            $scope.treeConfig[leaf].count += 1;
            //if ($scope.treeConfig[data.features[key].properties.year]) {
            //  $scope.treeConfig[data.features[key].properties.year].count += 1;
            //}
            //if (!$scope.treeConfig[data.features[key].properties.year]) {
            //  $scope.treeConfig["other"].count += 1;
            //}
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
          console.log(data)
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
            $scope.treeConfig['other'].count += data.features[key].properties.YR2009 //(data.features[key].properties.YRunkown + data.features[key].properties.YR2008 + data.features[key].properties.YR2009)

            $scope.treeConfig['2010'].count += data.features[key].properties.YR2010
            $scope.treeConfig['2011'].count += data.features[key].properties.YR2011
            $scope.treeConfig['2012'].count += data.features[key].properties.YR2012
            $scope.treeConfig['2013'].count += data.features[key].properties.YR2013
          }

        }, function(err) {
          //failure!
          console.log(err)
        });
      }
    };

    $scope.neighborhoodsLayer = L.geoJson('', {
      style: function(feature) {
        return {
          color: '#7F9A65',
          className: 'borders',
          clickable: false
        }
      }
    });


    $scope.neighborhoods = function() {
      //neighborhood button clicked
      if ($scope.neighborhoodLayerVisible) {
        treeData.showNeighborhoods({
          bbox: $scope.map.getBounds(),
          zoomLev: $scope.map.getZoom()
        }).then(function(data) {
          $scope.neighborhoodsLayer.clearLayers();
          $scope.neighborhoodsLayer.addData(data);
          $scope.neighborhoodsLayer.addTo($scope.map);
          $scope.neighborhoodsLayer.bringToBack();
        }, function(err) {
          console.log(err);
        });
      } else {
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
      //alert(year);
      if (indexOf.call($scope.disabledYearArray, year) === -1) {
        //ensures at least one year filter is on at all times
        if ($scope.disabledYearArray.length < 4) {
          $scope.disabledYearArray.push(year);
        }
      } else {
        $scope.disabledYearArray.splice(indexOf.call($scope.disabledYearArray, year), 1);
      }
      $scope.drawTrees();
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
