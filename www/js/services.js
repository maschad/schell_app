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

.factory('DataService', [function(){

  var goOffline = function () {
    firebase.database().goOffline();
  };

  var downloadData = function () {
    return firebase.database().ref('/product_categories/1').once('value');
  };

  return {
    goOffline : goOffline,
    download : downloadData
  };

}]);
