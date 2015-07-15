var appLayout = angular.module('appLayout',['ngRoute', 'ui.bootstrap']);

appLayout.controller('layoutController', ['$scope', '$rootScope', 'treeData', function($scope, $rootScope, treeData){

	$scope.projectName = "TreeBaltimore";
	console.log($scope.viewport);
	//layer toggler
	$scope.baseLayerToggle = function(layer){
		$scope.baseMap = layer;
		$rootScope.$broadcast('baseLayerChange', layer);
	};

	$scope.zoomChange = function(zoomType){
		$rootScope.$broadcast('zoomChange', zoomType);
	}

	$scope.showLayer = function(layer2show){
		$rootScope.$broadcast('showLayer', layer2show);
	}

	//set specific button to start as active
	$scope.radioModel = 'Road';
}]);

angular.module( 'appLayout')
    .directive('mainTab',function(){
	    return {
	        restrict: 'E',
	        templateUrl: 'js/layout/partials/main-tab.tpl.html',
	        controller: 'layoutController'
	    };
	}).directive('outputTab',function(){
	    return {
	        restrict: 'E',
	        templateUrl: 'js/layout/partials/output-tab.tpl.html',
	        controller: 'layoutController'
	    };
	}).directive('aboutTab',function(){
	    return {
	        restrict: 'E',
	        templateUrl: 'js/layout/partials/about-tab.tpl.html',
	        controller: 'layoutController'
	    };
}).directive('topBar',function(){
			return {
					restrict: 'E',
					templateUrl: 'js/layout/partials/topbar.tpl.html',
					controller: 'layoutController'
			};
	});
