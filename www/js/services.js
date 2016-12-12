angular.module('app.services', [])

.factory('StorageService', ['$localStorage',  function($localStorage){
  //Subcategories to be returned
  var subs = [];
  var toDisplay = [];
  var title = '';

  $localStorage = $localStorage.$default({
    products: [],
    productsCategories: [],
    offlinePreferences: [
      {
        text: 'Automatischer Sync deaktivieren',
        checked: false
      },
      {
        text: 'Mobiler Sync deaktivieren',
        checked: false
      }
    ],
    product_info : [],
    country: ''
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

  var storeProductCategories = function (data) {
    $localStorage.productsCategories = data;
  };

  var getProductCategories = function(){
    return $localStorage.productsCategories;
  };

  var storeSubCategories = function (child_ids) {
    subs = [];
    for(var i = 0; i < $localStorage.products.length; i ++){
      for(j=0; j < child_ids.length; j++){
        if ($localStorage.products[i]['elternelement'] == child_ids[j]){
          subs.push($localStorage.products[i]);
        }
      }
    }
  };

  var loadSubCategories = function () {
    return subs;
  };

  var updatePreferences = function (data) {
    $localStorage.offlinePreferences = data;
  };

  var storeTitle = function (tit) {
    title = tit;
  };

  var getTitle = function () {
    return title;
  };

  var getProductInfo = function () {
    return $localStorage.product_info;
  };

  var storeProductInfo = function (data) {
    $localStorage.product_info = data;
  };

  var detailDisplay = function(product) {
    toDisplay = product;
  };

  var getDetails = function (){
    return toDisplay;
  };

  var loadOffline = function() {
    return $localStorage.offlinePreferences;
  };

  var reset = function () {
    $localStorage.$reset();
  };

  var setCountry = function (choice) {
    $localStorage.country = choice;
  };

  var checkCountry = function () {
    return !!$localStorage.country;
  };

  return {
    getAll : getAll,
    add : add,
    remove : remove,
    storeAll : storeAll,
    updatePreferences: updatePreferences,
    getProductCategories : getProductCategories,
    storeProductCategories : storeProductCategories,
    storeSubCategories : storeSubCategories,
    loadSubCategories : loadSubCategories,
    storeTitle : storeTitle,
    getTitle : getTitle,
    getProductInfo : getProductInfo,
    storeProductInfo : storeProductInfo,
    detailDisplay : detailDisplay,
    getDetails : getDetails,
    loadOffline : loadOffline,
    reset : reset,
    checkCountry : checkCountry,
    setCountry : setCountry
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

  var downloadProductCategories = function () {
    var products = [];

    firebase.database().ref('/product_categories/').orderByChild('elternelement').equalTo(0).once('value').then(function (snapshot) {
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

  var downloadProducts = function(product_ids) {
    var products = [];
    for(var i = 0; i < product_ids.length; i++){
      firebase.database().ref('/products/').orderByKey().equalTo(product_ids[i]).once('value').then(function (snapshot) {
        products.push(snapshot.val());
      }, function (error) {
        $ionicPopup.confirm({
          title: "Error Connecting to Database",
          content: error
        });
      });
    }

    return products;
  };

  var downloadVideos = function () {
    var videos = [];
    firebase.database().ref('/videos/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (video) {
        videos.push(video.val());
      });
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });


    return videos;

  };


  return {
    goOffline : goOffline,
    downloadProductData : downloadProductData,
    downloadProductCategories : downloadProductCategories,
    downloadProducts : downloadProducts,
    downloadVideos : downloadVideos
  };

}]);
