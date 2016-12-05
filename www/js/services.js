angular.module('app.services', [])

.factory('StorageService', [function($localStorage){

  var getAll = function () {
    return $localStorage.products;
  };

  var add = function (product) {
    $localStorage.products.push(product);
  };

  var remove = function (product) {
    $localStorage.products.splice($localStorage.products.indexOf(product));
  };

  return {
    getAll : getAll,
    add : add,
    remove : remove
  };

}])

.service('BlankService', [function(){

}]);
