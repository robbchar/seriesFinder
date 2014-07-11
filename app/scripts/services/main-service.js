
angular.module('seriesFinder')
.service('MainService', function ($rootScope, $http, $cookies) {
  var isLoggedIn,
    user = {},
    grServiceHost = '127.0.0.1',
    grServicePort = 8000;

    function init() {
    }

    function isLoggedIn () {
      // $http.get('http://' + grServiceHost + ':' + grServicePort + '/isLoggedIn')
      $http.get('http://www.google.com/')
      // $http.get('http://www.google.')
      // .then(function (response) {
      //   user = response.data;
      //   $rootScope.$broadcast('MainDataChange');
      // }, function (error) {
      //   console.log('error in isLoggedIn');
      // });
      .success(function(data, status, headers, config) {
        user = data;
        $rootScope.$broadcast('MainDataChange');
      }).
      error(function(data, status, headers, config) {
        console.log('error in isLoggedIn');
      });
    }

    function getUserInfo () {
      // $http.get('http://' + grServiceHost + ':' + grServicePort + '/userInfo')
      $http.get('http://www.google.com/')
      // .then(function (response) {
      //   user = response.data;
      //   $rootScope.$broadcast('MainDataChange');
      // }, function (error) {
      //   console.log('error in getUserInfo');
      // });
      .success(function(data, status, headers, config) {
        user = data;
        $rootScope.$broadcast('MainDataChange');
      }).
      error(function(data, status, headers, config) {
        console.log('error in getUserInfo');
      });
    }

    function startLogin() {
      $http.get('http://' + grServiceHost + ':' + grServicePort + '/auth/goodreads')
      .then(function (response) {
        user = response.data;
        $rootScope.$broadcast('MainDataChange');
      }, function (error) {
        console.log('error in startLogin');
      });
    }

    init();
  return {
    IsLoggedIn: isLoggedIn,
    User: user,
    StartLogin: startLogin,
    GetUserInfo: getUserInfo
  };
});
