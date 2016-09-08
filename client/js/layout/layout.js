var appLayout = angular.module('appLayout', ['ngRoute', 'ui.bootstrap']);

appLayout.controller('layoutController', ['$scope', '$rootScope', 'treeData', '$modal',
  function($scope, $rootScope, treeData, $modal) {

  $scope.projectName = "TreeBaltimore";

  //broadcast events
  $scope.baseLayerToggle = function(layer) {
    $scope.baseMap = layer;
    $rootScope.$broadcast('baseLayerChange', layer);
  };

  $scope.zoomChange = function(zoomType) {
    $rootScope.$broadcast('zoomChange', zoomType);
  }

  //when a user types in a neighborhood name, return a list of neighborhoods
  //  with matching input string
  $scope.neighborhoodTextInput = function(val) {
    return treeData.getZoomNeighborhoods(val).then(function(response){
      return response.features.map(function(item){
        return item;
      });
    });
  };

  $scope.zoomToHood = function($item){


    var gotobounds = L.geoJson($item).getBounds();
    $scope.map.fitBounds(gotobounds);

    $scope.toggleSingleNeighborood($item.properties.gid);
  }

  $scope.singleHood = L.geoJson('');
  $scope.hideSingleNeighborhood = true;
  $scope.toggleSingleNeighborood = function(neighborhoodGID){
    //$item.properties.gid
    if($scope.hideSingleNeighborhood){
      treeData.getSingleNeighborhoods(neighborhoodGID).then(function(e){
        $scope.singleHood.clearLayers();
        $scope.singleHood.addData(e);
        $scope.singleHood.addTo($scope.map);
        $scope.singleHood.bringToBack();

        $scope.hideSingleNeighborhood = false;
      })
    }
    else {
      $scope.singleHood.clearLayers();
      $scope.neighborhoodNameSelected = null;
      $scope.hideSingleNeighborhood = true;
      $scope.drawTrees();
    }

  }

  //listener events
  $rootScope.$on('treeCount', function(e,d){
    $scope.treeCount = d;
  });
  if(!$scope.treeCount){
    $scope.treeCount = 0;
  }

  $scope.showFilters = function(){
    $scope.filterOn = true;
  }
  $scope.hideFilters = function(){
    $scope.filterOn = false;
  }
  $scope.pinned = false;
  $scope.openFilterMenu = false;
  $scope.toggleShowFilter = function(type){
    //if the menu is not pinned and the filtertoggle is not pin(aka hover)
    if((type !== 'pin') && ($scope.pinned === false)){
      $scope.openFilterMenu = !$scope.openFilterMenu;
    }
    if(type === 'pin'){
      $scope.pinned = !$scope.pinned;

    }
  }


  $scope.aboutModal = function (size) {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'js/layout/partials/about-modal.tpl.html',
      controller: 'layoutController',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };
}]);

angular.module('appLayout')
  .directive('mainTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'js/layout/partials/main-tab.tpl.html',
      controller: 'layoutController'
    };
  }).directive('outputTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'js/layout/partials/output-tab.tpl.html',
      controller: 'layoutController'
    };
  }).directive('topBar', function() {
    return {
      restrict: 'E',
      templateUrl: 'js/layout/partials/topbar.tpl.html',
      controller: 'layoutController'
    };
  }).directive('filterBox', function() {
    return {
      restrict: 'E',
      templateUrl: 'js/layout/partials/filter-box.tpl.html',
      controller: 'layoutController'
    };
  });
