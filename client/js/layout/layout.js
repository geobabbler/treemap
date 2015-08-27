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

  $scope.neighborhoodTextInput = function(val) {
    return treeData.getZoomNeighborhoods({val:val}).then(function(response){
        // return response;
      return response.features.map(function(item){
        return item;
      });
    });
  };

  $scope.zoomToHood = function($item){
    var gotobounds = L.geoJson($item).getBounds();
    $scope.map.fitBounds(gotobounds);
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
