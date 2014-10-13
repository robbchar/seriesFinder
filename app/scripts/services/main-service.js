
angular.module('seriesFinder')
.service('MainService', function ($rootScope, $http, $cookies) {
  var isLoggedIn,
    user = {},
    books = [],
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

    function getBooks () {
      var that = this;

      $http.get('/bookInfo')
      .success(function(data, status, headers, config) {
        that.User = data.books;
        $rootScope.$broadcast('BookDataChange');
      }).
      error(function(data, status, headers, config) {
        console.log('error in getBooks');
      });
    }

    init();
  return {
    IsLoggedIn: isLoggedIn,
    User: user,
    GetUserInfo: getUserInfo,
    GetIsLoggedIn: getIsLoggedIn,
    Books: books,
    GetBooks: getBooks
  };
});
