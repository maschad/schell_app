angular.module('app.services', [])

.factory('StorageService','$localStorage', [function($localStorage){

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
    var products = [];
    firebase.database().ref('/product_categories/').orderByKey().limitToFirst(10).once('value');
    DataService.download().then(function (snapshot) {
      snapshot.forEach(function (product) {
        products.push(product.val());
      });
    });

    return products;
  };

  return {
    goOffline : goOffline,
    download : downloadData
  };

}]);
