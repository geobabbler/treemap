var appLayout = angular.module('appLayout',['ngRoute', 'ui.bootstrap']);

appLayout.controller('layoutController', ['$scope', '$rootScope', 'treeData', function($scope, $rootScope, treeData){
	$scope.tabs = [
		{ title:'Main'},
		{ title:'Output'},
		{ title:'About'}
	];

	$scope.zoomInOne = function(){
		$rootScope.$broadcast('zoomIn');
	};
	// $scope.stormData = stormData.processStorms().then(function(Data){
	// 	return Data;
	// });

	//layer toggler
	$scope.layerToggle = function(layer){
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
	}).directive('sidebarTab',function(){
	    return {
	        restrict: 'E',
	        templateUrl: 'js/layout/partials/sidebar.tpl.html',
	        controller: 'layoutController'
	    };
	});