'use strict';

angular.module('seriesFinder')
.controller('NavCtrl', function ($scope, $rootScope, $route) {
  $scope.currentPage = '#';

  $rootScope.$on('$locationChangeSuccess', function(event, currentPage, previousPage){
    $scope.currentPage = $route.current.originalPath.toLowerCase();
  });
});
