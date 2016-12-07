angular.module('app.services', [])

.factory('StorageService', ['$localStorage', function($localStorage){

  $localStorage = $localStorage.$default({
    products: []
  });

  var getAll = function () {
    return $localStorage.products;
  };

  var add = function (product) {
    $localStorage.products.push(product);
  };

  var remove = function (product) {
    $localStorage.products.splice($localStorage.products.indexOf(product));
  };

  var storeAll = function (data) {
    $localStorage.products = data;
  };

  return {
    getAll : getAll,
    add : add,
    remove : remove,
    storeAll : storeAll
  };

}])

.factory('DataService', ['$ionicPopup', function($ionicPopup){

  var goOffline = function () {
    firebase.database().goOffline();
  };

  //Download Product Data
  var downloadProductData = function () {
    var products = [];
    firebase.database().ref('/product_categories/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (product) {
        products.push(product.val());
      });
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });
    return products;
  };

  return {
    goOffline : goOffline,
    downloadProductData : downloadProductData
  };

}]);
