'use strict';

angular.module('seriesFinder')
.controller('BooksCtrl', function ($scope, MainService) {
  $scope.books = [];

  MainService.GetBooks();

  $scope.$on('BookDataChange', function() {
  	$scope.books = MainService.Books;
  });
});
