var appLayout = angular.module('appLayout', ['ngRoute', 'ui.bootstrap']);

appLayout.controller('layoutController', ['$scope', '$rootScope', 'treeData', function($scope, $rootScope, treeData) {

  $scope.projectName = "TreeBaltimore";

  //broadcast events
  $scope.baseLayerToggle = function(layer) {
    $scope.baseMap = layer;
    $rootScope.$broadcast('baseLayerChange', layer);
  };

  $scope.zoomChange = function(zoomType) {
    $rootScope.$broadcast('zoomChange', zoomType);
  }

  $scope.toggleTrees = function(layer2show) {
    $rootScope.$broadcast('toggleTrees', layer2show);
  }
  //listener events
  $rootScope.$on('treeCount', function(e,d){
    $scope.treeCount = d;
  });
  if(!$scope.treeCount){
    $scope.treeCount = 0;
  }
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
  }).directive('aboutTab', function() {
    return {
      restrict: 'E',
      templateUrl: 'js/layout/partials/about-tab.tpl.html',
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
