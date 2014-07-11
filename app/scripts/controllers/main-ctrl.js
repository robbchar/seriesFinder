'use strict';

angular.module('seriesFinder')
.controller('MainCtrl', function ($scope, $http, MainService, $cookies) {
  $scope.isLoggedIn = false;
  $scope.user;

  // $scope.startLogin = MainService.StartLogin;
  $scope.checkIfIsLoggedIn = MainService.IsLoggedIn;
  $scope.getUserInfo = MainService.GetUserInfo;

  $scope.$on('MainDataChange', function () {
    $scope.isLoggedIn = MainService.IsLoggedIn;
    $scope.user = MainService.User;
  });
});
