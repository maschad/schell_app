angular.module('app.services', [])

.factory('StorageService', ['$localStorage',  function($localStorage){
  //Subcategories to be returned
  var subs = [];
  var toDisplay = [];
  var title = '';
  var prevTitle = '';
  var rootTitle = '';
  var filter_ids = [];
  var link = 'http://www.schell.eu/deutschland-de/produkte/';

  $localStorage = $localStorage.$default({
    products: [],
    downloads: [],
    offlineProducts: [],
    bookmarked: [],
    settingsCategories: [],
    productsCategories: [],
    offlinePreferences:[
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

  var storeRootTitle = function (root) {
    rootTitle = root;

  };

  var storePreviousTitle = function (prev) {
    prevTitle = prev;
  };

  var getPrevTitle = function () {
    return prevTitle;
  };

  var getRootTitle = function () {
    return rootTitle;
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

  var getCategories = function () {
    return $localStorage.settingsCategories;
  };

  var setCategories = function (data) {
    $localStorage.settingsCategories = data;
  };

  var checkCategory = function (product,check) {
      $localStorage.settingsCategories.splice($localStorage.settingsCategories.indexOf(product),1,{item: product.item, checked: check});
  };

  var getOfflineProducts = function () {
    return $localStorage.offlineProducts;
  };

  var storeOfflineProducts = function (products) {
    $localStorage.offlineProducts = products;
  };

  var setLink = function (data) {
    link.concat(data);
  };

  var getLink = function () {
    return link;
  };

  var bookmark = function (data) {
    $localStorage.bookmarked.push(data);
  };

  var getBookmarks = function () {
    return $localStorage.bookmarked;
  };

  var removeBookmark = function (bookmark) {
    $localStorage.bookmarked.splice($localStorage.bookmarked.indexOf(bookmark),1);
  };

  var storeFilterIds = function (ids) {
    filter_ids = ids;
  };

  var getFilterIds = function(){
    return filter_ids;
  };

  var storeFile = function (data) {
    $localStorage.downloads = data;
  };

  var getFile = function (download_ids) {
    var toRet = [];
    for(var i = 0; i < download_ids.length; i++){
      toRet.push($localStorage.downloads[download_ids[i]]);
    }
    return toRet;
  };

  var getFilterGroups = function (filter_headings) {
    var groups = [];

    filter_headings.forEach(function (filter_heading) {
      if(filter_heading.filters != null){
        var keys = Object.keys(filter_heading.filters);
        var current_keys = keys.filter(function (key) {
          return filter_ids.indexOf(parseInt(key)) !== -1;
        });

        var content = [];
        for(var i = 0; i < current_keys.length; i ++){
          content.push(filter_heading.filters[current_keys[i]]);
        }
        groups.push(
        {
            name: filter_heading.title_de,
            items: content,
            show : false
        })
      }
    });
    return groups;
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
    setCountry : setCountry,
    getCategories : getCategories,
    checkCategory : checkCategory,
    setCategories : setCategories,
    storeOfflineProducts : storeOfflineProducts,
    getOfflineProducts : getOfflineProducts,
    getLink : getLink,
    setLink : setLink,
    storePrev : storePreviousTitle,
    storeRoot : storeRootTitle,
    getRoot : getRootTitle,
    getPrev : getPrevTitle,
    getBookmarks : getBookmarks,
    bookmark : bookmark,
    removeBookmark : removeBookmark,
    getFilterIds : getFilterIds,
    storeFilterIds : storeFilterIds,
    storeFile : storeFile,
    getFile : getFile,
    getFilterGroups : getFilterGroups
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

  var downloadFiles = function (ids) {
    var files = [];

    for(var i = 0; i < ids.length; i++ ) {
      firebase.database().ref('/downloads/').orderByKey().equalTo(ids[i]).once('value').then(function (snapshot) {
        files.push(snapshot.val());
      }, function (error) {
        $ionicPopup.confirm({
          title: "Error Connecting to Database",
          content: error
        });
      });
    }
    return files;
  };

  var downloadProductFilters = function () {
    var filters = [];

    firebase.database().ref('/product_filters/').once('value').then(function (snapshot) {
        snapshot.forEach(function (filter) {
          filters.push(filter.val());
        })
      }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });

    return filters;
  };


  return {
    goOffline : goOffline,
    downloadProductData : downloadProductData,
    downloadProductCategories : downloadProductCategories,
    downloadProducts : downloadProducts,
    downloadVideos : downloadVideos,
    downloadFiles : downloadFiles,
    downloadProuctFilters : downloadProductFilters
  };

}])

.factory('FileService',[function () {


    var download = function (url,filename,dirName) {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
          fs.root.getDirectory(
            dirName,
            {
              create: true
            },
            function(dirEntry) {
              dirEntry.getFile(
                filename,
                {
                  create: true,
                  exclusive: false
                },
                function gotFileEntry(fe) {
                  var p = fe.toURL();
                  fe.remove();
                  ft = new FileTransfer();
                  ft.download(
                    encodeURI(url),
                    p,
                    function(entry) {
                      return entry.toURL();
                    },
                    function(error) {
                      console.log(error);
                    },
                    false,
                    null
                  );
                },
                function() {
                  console.log("Get file failed");
                }
              );
            }
          );
        },
        function() {
          console.log("Request for filesystem failed");
        });
    };

    var load = function (fileName,dirName) {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
          fs.root.getDirectory(
            dirName,
            {
              create: false
            },
            function(dirEntry) {
              dirEntry.getFile(
                fileName,
                {
                  create: false,
                  exclusive: false
                },
                function gotFileEntry(fe) {
                  return fe.toURL();
                },
                function(error) {
                  console.log("Error getting file");
                }
              );
            }
          );
        },
        function() {
          console.log("Error requesting filesystem");
        });
    };

  return{
    download : download,
    load : load
  }

}]);
