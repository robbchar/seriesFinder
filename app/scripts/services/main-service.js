
angular.module('seriesFinder')
.service('MainService', function ($rootScope, $http, $cookies) {
  var isLoggedIn,
    user = {},
    grServiceHost = '127.0.0.1',
    grServicePort = 8000;

    function init() {
    }

    function getIsLoggedIn () {
      var that = this;

      $http.get('/isLoggedIn')
      .success(function(data, status, headers, config) {
        that.IsLoggedIn = data.isLoggedIn;
        $rootScope.$broadcast('MainDataChange');
      }).
      error(function(data, status, headers, config) {
        console.log('error in isLoggedIn');
      });

      // $http.get('/auth/goodreads')
      // .success(function(data, status, headers, config){
      //   alert('logged in!');
      // })
      // .error(function(data, status, headers, config) {
      //   console.log('error!');
      // });
      // window.location = '/auth/goodreads';
      // window.location = '/isAuthenticated';
    }

    function getUserInfo () {
      var that = this;

      $http.get('/userInfo')
      .success(function(data, status, headers, config) {
        that.User = data.user;
        $rootScope.$broadcast('MainDataChange');
      }).
      error(function(data, status, headers, config) {
        console.log('error in getUserInfo');
      });
    }

    init();
  return {
    IsLoggedIn: isLoggedIn,
    User: user,
    GetUserInfo: getUserInfo,
    GetIsLoggedIn: getIsLoggedIn
  };
});
