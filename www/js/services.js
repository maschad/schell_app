angular.module('app.services', [])


//Service for managing local storage queiries and items
.factory('localStorageService', ['$localStorage',  function($localStorage){

  //Local storage using ngStorage, for trivial persistence
  $localStorage = $localStorage.$default({
    lastUpdate: null,
    country: '',
    productCounts: {}, // Store product counts by category
    bookmarked_products: [],
    category_files: {},
    product_files: {},
    carousel_images: {},
    awards: {},
    video_files: {},
    download_files: [],
    offlinePreferences:[
      {
        text: 'Automatischer Sync deaktivieren',
        checked: false
      },
      {
        text: 'Mobiler Sync deaktivieren',
        checked: false
      },
      {
        downloaded_categories: []
      },
      {
        download_videos : false
      },
      {
        last_updated: ''
      }
    ],
    filters: []
  });

  // Getters and Setters

  var getLastUpdated = function() {
    return $localStorage.lastUpdate;
  };

  var setLastUpdated = function(newLastUpdated) {
    $localStorage.lastUpdate = newLastUpdated;
  };

  var getCountry = function () {
    return $localStorage.country;
  };

  var setCountry = function (country) {
    $localStorage.country = country;
  };

  var getBookmarkedProducts = function () {
    return $localStorage.bookmarked_products;
  };

  var checkBookmarked = function (product) {
    for (var i = 0; i < $localStorage.bookmarked_products.length; i++) {
      if ($localStorage.bookmarked_products[i] === product) {
        return true;
      }
    }
    return false;
  };

  var bookmarkProduct = function (product) {
    for (var i = 0; i < $localStorage.bookmarked_products.length; i++) {
      if ($localStorage.bookmarked_products[i] === product) {
        return false;
      }
    }
    $localStorage.bookmarked_products.push(product);
    return true;

  };

  var removeBookmarkedProduct = function(bookmark){
    $localStorage.bookmarked_products.splice($localStorage.bookmarked_products.indexOf(bookmark),1);
  };

  var getOfflinePreferences = function () {
    return $localStorage.offlinePreferences;
  };

  var updatePreferences = function (data) {
    $localStorage.offlinePreferences = data;
  };

  var productDownloaded = function (uid) {
    if ($localStorage.product_files.hasOwnProperty(uid.toString())) {
      return $localStorage.product_files[uid].hasOwnProperty('image_landscape');
    }

    return false;
  };

  var productImageDownloaded = function (uid) {
    if ($localStorage.product_files.hasOwnProperty(uid.toString())) {
      return $localStorage.product_files[uid].hasOwnProperty('image_portrait');
    }

    return false;
  };

  var setPDFPath = function (product_id, path) {
    if ($localStorage.product_files.hasOwnProperty(product_id.toString())) {
      if ($localStorage.product_files[product_id].hasOwnProperty('datei_de')) {
        $localStorage.product_files[product_id].datei_de.push(path);
      } else {
        $localStorage.product_files[product_id] = Object.assign({}, $localStorage.product_files[product_id], {'datei_de': []});
        $localStorage.product_files[product_id].datei_de.push(path);
      }
    } else {
      $localStorage.product_files[product_id] = Object.assign({}, $localStorage.product_files[product_id], {'datei_de': []});
      $localStorage.product_files[product_id].datei_de.push(path);
    }
    console.log('length of pdf array', $localStorage.product_files[product_id].datei_de.length);
  };

  var getPDFPath = function (product_id, lang, index) {
    if (lang == 'de') {
      return $localStorage.product_files[product_id].datei_de[index];
    }
  };

  var categoryDownloaded = function (uid) {
    return $localStorage.category_files.hasOwnProperty(uid.toString());
  };

  var setThumbnailPath = function (product_id, path) {
    console.log('attempting to download thumbnail');
    if ($localStorage.product_files.hasOwnProperty(product_id.toString())) {
      if ($localStorage.product_files[product_id].hasOwnProperty('thumbnail')) {
        $localStorage.product_files[product_id].thumbnail.push(path);
      } else {
        $localStorage.product_files[product_id] = Object.assign({}, $localStorage.product_files[product_id], {'thumbnail': []});
        $localStorage.product_files[product_id].thumbnail.push(path);
      }
    } else {
      $localStorage.product_files[product_id] = Object.assign({}, $localStorage.product_files[product_id], {'thumbnail': []});
      $localStorage.product_files[product_id].thumbnail.push(path);
    }
    console.log('length of thumbnail array', $localStorage.product_files[product_id].thumbnail.length);
  };

  var setAwardPath = function (product_id, path) {
    if ($localStorage.awards.hasOwnProperty(product_id.toString())) {
      if ($localStorage.awards[product_id].hasOwnProperty('logo')) {
        $localStorage.awards[product_id].logo.push(path);
      } else {
        $localStorage.awards[product_id] = Object.assign({}, $localStorage.awards[product_id], {'logo': []});
        $localStorage.awards[product_id].logo.push(path);
      }
    } else {
      $localStorage.awards[product_id] = Object.assign({}, $localStorage.awards[product_id], {'logo': []});
      $localStorage.awards[product_id].logo.push(path);
    }
  };

  var getAwardPath = function (product_id, index) {
    return $localStorage.awards[product_id].logo[index];
  };

  var getThumbnailPath = function (product_id, index) {
    return $localStorage.product_files[product_id].thumbnail[index];
  };

  var getLandscapePath = function (product_id) {
    return $localStorage.product_files[product_id].image_landscape;
  };

  var setLandscapePath = function (product_id, path) {
    $localStorage.product_files[product_id] = Object.assign({}, $localStorage.product_files[product_id], {'image_landscape': path});
  };

  var setBildPath = function (category_id, path) {
    $localStorage.category_files[category_id] = Object.assign({}, $localStorage.category_files[category_id], {'bild': path});
  };

  var getBildPath = function (category_id) {
    return $localStorage.category_files[category_id].bild;
  };

  var setCarouselPath = function (number, path) {
    $localStorage.carousel_images[number] = path;

  };

  var getCarouselPaths = function () {
    return $localStorage.carousel_images;
  };

  var setPortraitPath = function (product_id, path) {
    $localStorage.product_files[product_id] = Object.assign({}, $localStorage.product_files[product_id], {'image_portrait': path});
  };

  var getPortraitPath = function (product_id) {
    return $localStorage.product_files[product_id].image_portrait;
  };

  var setTechnicalPath = function (product_id, path) {
    $localStorage.product_files[product_id] = Object.assign({}, $localStorage.product_files[product_id], {'technical_drawing_link': path});
  };

  var getTechnicalPath = function (product_id) {
    return $localStorage.product_files[product_id].technical_drawing_link;
  };

  var getAllVideoPaths = function () {
    return $localStorage.video_files;
  };

  var getVideoPath = function (video_id) {
    return $localStorage.video_files[video_id].videofile_de;
  };

  var setVideoPath = function (video_id,path) {
    $localStorage.video_files[video_id] = Object.assign({}, $localStorage.video_files[video_id], {'videofile_de': path});
  };

  var setVideoImagePath = function (video_id, path) {
    $localStorage.video_files[video_id] = Object.assign({}, $localStorage.video_files[video_id], {'startimage_de': path});
  };

  var getVideoImagePath = function (video_id) {
    return $localStorage.video_files[video_id].startimage_de;
  };

  var getDownloadFiles =  function () {
    return $localStorage.download_files;
  };

  var setFilters = function (filters) {
    $localStorage.filters = filters;
  };

  var getFilters = function () {
    return $localStorage.filters;
  };

  var setProductCount = function(uid, count) {
    $localStorage.productCounts[uid] = count;
  };

  var getProductCounts = function() {
    return $localStorage.productCounts;
  };

  return {
    getCountry : getCountry,
    setCountry : setCountry,
    getBookmarkedProducts : getBookmarkedProducts,
    bookmarkProduct : bookmarkProduct,
    removeBookmarkedProduct : removeBookmarkedProduct,
    getOfflinePreferences : getOfflinePreferences,
    updatePreferences : updatePreferences,
    getLandscapePath: getLandscapePath,
    setAwardPath: setAwardPath,
    getAwardPath: getAwardPath,
    setLandscapePath: setLandscapePath,
    getAllVideoPaths : getAllVideoPaths,
    checkBookmarked: checkBookmarked,
    getVideoPath : getVideoPath,
    setVideoPath : setVideoPath,
    setVideoImagePath: setVideoImagePath,
    getVideoImagePath: getVideoImagePath,
    getDownloadFiles : getDownloadFiles,
    productDownloaded: productDownloaded,
    productImageDownloaded: productImageDownloaded,
    categoryDownloaded: categoryDownloaded,
    setFilters: setFilters,
    getFilters: getFilters,
    setPDFPath: setPDFPath,
    getPDFPath: getPDFPath,
    setTechnicalPath: setTechnicalPath,
    getTechnicalPath: getTechnicalPath,
    setThumbnailPath: setThumbnailPath,
    getThumbnailPath: getThumbnailPath,
    setBildPath: setBildPath,
    getBildPath: getBildPath,
    setCarouselPath: setCarouselPath,
    getCarouselPaths: getCarouselPaths,
    setPortraitPath: setPortraitPath,
    getPortraitPath: getPortraitPath,
    setProductCount: setProductCount,
    getProductCounts: getProductCounts,
    getLastUpdated: getLastUpdated,
    setLastUpdated: setLastUpdated
  };


}])

  //Service for managing firebase queries
  .factory('FirebaseService', ['localStorageService', '$ionicPopup', function (localStorageService, $ionicPopup) {

  var goOffline = function () {
    firebase.database().goOffline();
  };

  //Download Product Category data from firebase
  var getAllProductCategories = function (success,error) {
      var categories = {};
      firebase.database().ref('/product_categories/').orderByKey().once('value').then(function (snapshot) {
        snapshot.forEach(function (category) {
          categories[category.key] = category.val();
        });
      success(categories);
      }, function (error) {
        $ionicPopup.confirm({
          title: "Error Connecting to Database",
          content: error
        });
      });

  };

  var downloadAllProducts = function (success,error) {
    var products = {};
    firebase.database().ref('/products/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (product) {
        products[product.key] = product.val();
      });
      success(products);
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });

  };

  //Download Videos
  var downloadVideos = function (success,error) {
    var videos = {};
    firebase.database().ref('/videos/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (video) {
        videos[video.key] = video.val();
      });
      success(videos);
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });

  };

  //Download Videos
  var downloadVideoCategories = function (success, error) {
    var videos = {};
    firebase.database().ref('/video_categories/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (video) {
        videos[video.key] = video.val();
      });
      success(videos);
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });
  };

  //Download files from downloads table
  var downloadFiles = function (success,errors) {
    var files = {};

    firebase.database().ref('/downloads/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (file) {
        files[file.key] = file.val();
      });
      success(files);
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });

  };


  //Download the filters for a product
  var downloadProductFilters = function (success,error) {
    var filters = [];

    firebase.database().ref('/product_filters/').once('value').then(function (snapshot) {
        snapshot.forEach(function (filter) {
          filters.push(filter.val());
        });
        success(filters);
      }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });

  };

  var downloadAwards = function (success, error) {
    var awards = {};

    firebase.database().ref('/awards/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (award) {
        awards[award.key] = award.val();
      });
      success(awards);
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });
  };

  var downloadZubehoer = function (success, error) {
    var zubehoer = {};

    firebase.database().ref('/b_artikel_zubehoer/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (zub) {
        zubehoer[zub.key] = zub.val();
      });
      success(zubehoer);
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });
  };

    var checkBookmark = function (bookmarkedProducts) {
      for (var key in bookmarkedProducts) {
        console.log('checking bookmark ', bookmarkedProducts[key].uid);
        firebase.database().ref('/products/' + bookmarkedProducts[key].uid).once('value').then(function (snapshot) {
          if (snapshot.val() == null) {
            localStorageService.removeBookmarkedProduct(bookmarkedProducts[key]);
          }
        });
      }
    };

  return {
    goOffline : goOffline,
    getAllProductCategories : getAllProductCategories,
    downloadVideos : downloadVideos,
    downloadVideoCategories: downloadVideoCategories,
    downloadFiles : downloadFiles,
    downloadProductFilters : downloadProductFilters,
    downloadAllProducts: downloadAllProducts,
    downloadAwards: downloadAwards,
    downloadZubehoer: downloadZubehoer,
    checkBookmark: checkBookmark
  };

}])

//Service for managing Files
  .factory('FileService', ['$cordovaFileTransfer', '$rootScope', '$ionicLoading', function ($cordovaFileTransfer, $rootScope, $ionicLoading) {
    //Loading functions
    var downloadShow = function () {
      $ionicLoading.show({
        scope: $rootScope,
        template: '<p>Downloading Data... {{download_status}}%</p><ion-spinner></ion-spinner>',
        animation: 'fade-in',
        showBackdrop: true
      });
    };

    //Hide function
    var hide = function () {
      $ionicLoading.hide();
    };

    var originalDownload = function (url, filename, dirName, success) {
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
          fs.root.getDirectory(
            dirName,
            {
              create: true
            },
            function (dirEntry) {
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
                    function (entry) {
                      success(entry.toURL());
                    },
                    function (error) {
                      console.log(error);
                    },
                    false,
                    null
                  );
                  ft.onprogress = function (progressEvent) {
                    if (progressEvent.lengthComputable && $rootScope.showDownload) {
                      downloadShow();
                      $rootScope.download_status = Math.round(($rootScope.loaded / $rootScope.total) * 100);
                      if ($rootScope.download_status >= 100) {
                        hide();
                      }
                    } else {
                      $rootScope.download_status += 1;
                    }
                  };
                },
                function () {
                  console.log("Get file failed");
                }
              );
            }
          );
        },
        function () {
          console.log("Request for filesystem failed");
        });
    };


  return{
    originalDownload: originalDownload
  }

}])

//Service for storing in app Data to be shared between controllers
  .factory('appDataService', ['$rootScope', function ($rootScope) {
    var current_category_ids = [];
    var video_ids = [];
    var current_product = {};
    $rootScope.navigated_categories = [];
    var previousProduct = [];
    var previous_title = '';
    var root_title = '';
    var filter_ids = '';
    var current_selected_filters = [];


    var setVideoId = function (ids) {
      video_ids = ids;
    };

    var getVideoIds = function () {
      return video_ids;
    };

    var getCurrentCategoryIds = function () {
      if (current_category_ids.length > 0) {
        return current_category_ids.pop();
      } else {
        return false;
      }
    };

    var checkCurrentCategoryIds = function () {
      if (current_category_ids.length > 0) {
        return current_category_ids[current_category_ids.length - 1];
      } else {
        return false;
      }
    };

    var categoryids = function () {
      return current_category_ids;
    };

    var setCurrentCategoryIds = function (category) {
      current_category_ids.push(category);
    };

    var setCurrentProduct = function (data) {
      current_product = data;
    };

    var getCurrentProduct = function () {
      return current_product;
    };

    var getNavigatedCategories = function () {
      return $rootScope.navigated_categories;
    };

    var addNavigatedCategory = function (data) {
      $rootScope.navigated_categories.push(data);
    };

    var checkCurrentCategory = function () {
      return $rootScope.navigated_categories[$rootScope.navigated_categories.length - 1];
    };

    var removeNavigatedCategory = function () {
      $rootScope.navigated_categories.pop();
    };

    var clearNavigatedCategories = function () {
      $rootScope.navigated_categories = [];
      current_category_ids = [];
    };

    var getPreviousTitle = function () {
      return previous_title;
    };


    var setPreviousTitle = function (prev) {
      previous_title = prev;
    };

    var getRootTitle = function () {
      return root_title;
    };

    var setRootTitle = function (root) {
      root_title = root;
    };

    var setFilterIds = function (ids) {
      filter_ids = ids;
    };

    var getFilterIds = function () {
      return filter_ids;
    };

    var addCurrentSelectedFiltersIds = function (filter_uid) {
      current_selected_filters.push(filter_uid);
    };

  var removeCurrentSelectedFilterId = function (filter_uid) {
    current_selected_filters.splice(current_selected_filters.indexOf(filter_uid), 1);
  };

  var getCurrentSelectedFilterIds = function () {
    return current_selected_filters;
  };

    var clearSelectedFilters = function () {
      current_selected_filters = [];
    };

    var checkInternet = function () {
      //Check for internet
      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          //Set internet Variable to false
          $rootScope.internet = false;
        } else {
          $rootScope.internet = true;
        }
      }
    };


    return {
      getVideoIds: getVideoIds,
      setVideoId: setVideoId,
      getCurrentCategoryIds : getCurrentCategoryIds,
      categoryids: categoryids,
      setCurrentCategoryIds : setCurrentCategoryIds,
      checkCurrentCategoryIds: checkCurrentCategoryIds,
      setCurrentProduct : setCurrentProduct,
      getCurrentProduct : getCurrentProduct,
      getNavigatedCategories: getNavigatedCategories,
      checkInternet: checkInternet,
      addNavigatedCategory: addNavigatedCategory,
      checkCurrentCategory: checkCurrentCategory,
      removeNavigatedCategory: removeNavigatedCategory,
      clearNavigatedCategories: clearNavigatedCategories,
      getPreviousTitle : getPreviousTitle,
      setPreviousTitle : setPreviousTitle,
      getRootTitle : getRootTitle,
      setRootTitle: setRootTitle,
      setFilterIds: setFilterIds,
      getFilterIds: getFilterIds,
      addCurrentSelectedFilterIds: addCurrentSelectedFiltersIds,
      removeCurrentSelectFilterId: removeCurrentSelectedFilterId,
      getCurrentSelectedFilterIds: getCurrentSelectedFilterIds,
      clearSelectedFilters: clearSelectedFilters
    }


  }])

//Database Service
.factory('DatabaseService', ['$cordovaSQLite', function($cordovaSQLite) {
    db = $cordovaSQLite.openDB({
      "name": "schell.db",
      "location": "default"
    });

    var populateProducts = function(firebaseProductsObject) {
      var preparedStatements = [];
      var BLANK_PRODUCT_INSERT_QUERY = 'INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

      for (var uid in firebaseProductsObject) {
        var filter_ids = firebaseProductsObject[uid]['filter_ids'] ? firebaseProductsObject[uid]['filter_ids'].join() : '' ;
        var download_ids = firebaseProductsObject[uid]['media']['download_ids'] ? firebaseProductsObject[uid]['media']['download_ids'].join() : '' ;
        var video_ids = firebaseProductsObject[uid]['media']['video_ids'] ? firebaseProductsObject[uid]['media']['video_ids'].join() : '' ;

        preparedStatements.push([
          BLANK_PRODUCT_INSERT_QUERY,
          [
            parseInt(uid),
            firebaseProductsObject[uid]['nummer'] ? firebaseProductsObject[uid]['nummer'] : '',
            firebaseProductsObject[uid]['referenzartikel'] ? firebaseProductsObject[uid]['referenzartikel'] : '',
            firebaseProductsObject[uid]['de_data']['produktbezeichnung'] ? firebaseProductsObject[uid]['de_data']['produktbezeichnung'] : '',
            firebaseProductsObject[uid]['de_data']['zusatz1'] ? firebaseProductsObject[uid]['de_data']['zusatz1'] : '',
            firebaseProductsObject[uid]['de_data']['zusatz2'] ? firebaseProductsObject[uid]['de_data']['zusatz2'] : '',
            firebaseProductsObject[uid]['de_data']['beschreibung'] ? firebaseProductsObject[uid]['de_data']['beschreibung'] : '',
            firebaseProductsObject[uid]['de_data']['differenzierung'] ? firebaseProductsObject[uid]['de_data']['differenzierung'] : '',
            firebaseProductsObject[uid]['de_data']['lieferumfang'] ? firebaseProductsObject[uid]['de_data']['lieferumfang'] : '',
            firebaseProductsObject[uid]['de_data']['einsatzbereich'] ? firebaseProductsObject[uid]['de_data']['einsatzbereich'] : '',
            firebaseProductsObject[uid]['de_data']['werkstoff'] ? firebaseProductsObject[uid]['de_data']['werkstoff'] : '',
            firebaseProductsObject[uid]['de_data']['geraeuschklasse'] ? firebaseProductsObject[uid]['de_data']['geraeuschklasse'] : '',
            firebaseProductsObject[uid]['de_data']['pruefzeichen'] ? firebaseProductsObject[uid]['de_data']['pruefzeichen'] : '',
            firebaseProductsObject[uid]['de_data']['dimension'] ? firebaseProductsObject[uid]['de_data']['dimension'] : '',
            firebaseProductsObject[uid]['de_data']['oberflaeche'] ? firebaseProductsObject[uid]['de_data']['oberflaeche'] : '',
            firebaseProductsObject[uid]['verpackungseinheit'] ? firebaseProductsObject[uid]['verpackungseinheit'] : '',
            firebaseProductsObject[uid]['gewicht'] ? firebaseProductsObject[uid]['gewicht'] : '',
            firebaseProductsObject[uid]['media']['image_landscape'] ? firebaseProductsObject[uid]['media']['image_landscape'] : '',
            firebaseProductsObject[uid]['media']['image_landscape_filesize'] ? parseInt(firebaseProductsObject[uid]['media']['image_landscape_filesize']) : 0,
            firebaseProductsObject[uid]['media']['image_portrait'] ? firebaseProductsObject[uid]['media']['image_portrait'] : '',
            firebaseProductsObject[uid]['media']['image_portrait_filesize'] ? parseInt(firebaseProductsObject[uid]['media']['image_portrait_filesize']) : 0,
            firebaseProductsObject[uid]['media']['technical_drawing_link'] ?  firebaseProductsObject[uid]['media']['technical_drawing_link'] : '' ,
            firebaseProductsObject[uid]['media']['technical_drawing_filesize'] ? parseInt(firebaseProductsObject[uid]['media']['image_portrait_filesize']) : 0 ,
            filter_ids,
            download_ids,
            video_ids,
            firebaseProductsObject[uid]['en_data']['produktbezeichnung'] ? firebaseProductsObject[uid]['en_data']['produktbezeichnung'] : '' ,
            firebaseProductsObject[uid]['en_data']['zusatz1'] ? firebaseProductsObject[uid]['en_data']['zusatz1'] : '' ,
            firebaseProductsObject[uid]['en_data']['zusatz2'] ? firebaseProductsObject[uid]['en_data']['zusatz2'] : '',
            firebaseProductsObject[uid]['en_data']['beschreibung'] ? firebaseProductsObject[uid]['en_data']['beschreibung'] : '',
            firebaseProductsObject[uid]['en_data']['differenzierung'] ? firebaseProductsObject[uid]['en_data']['differenzierung'] : '',
            firebaseProductsObject[uid]['en_data']['lieferumfang'] ? firebaseProductsObject[uid]['en_data']['lieferumfang'] : '',
            firebaseProductsObject[uid]['en_data']['einsatzbereich'] ? firebaseProductsObject[uid]['en_data']['einsatzbereich'] : '',
            firebaseProductsObject[uid]['en_data']['werkstoff'] ? firebaseProductsObject[uid]['en_data']['werkstoff'] : '',
            firebaseProductsObject[uid]['en_data']['geraeuschklasse'] ? firebaseProductsObject[uid]['en_data']['geraeuschklasse'] : '',
            firebaseProductsObject[uid]['en_data']['pruefzeichen'] ? firebaseProductsObject[uid]['en_data']['pruefzeichen'] : '',
            firebaseProductsObject[uid]['en_data']['dimension'] ? firebaseProductsObject[uid]['en_data']['dimension'] : '',
            firebaseProductsObject[uid]['en_data']['oberflaeche'] ? firebaseProductsObject[uid]['en_data']['oberflaeche'] : '',
            firebaseProductsObject[uid]['varianten'] ? firebaseProductsObject[uid]['varianten'] : '',
            firebaseProductsObject[uid]['designpreis'] ? firebaseProductsObject[uid]['designpreis'] : '',
            parseInt(firebaseProductsObject[uid]['b_artikel_id']),
            firebaseProductsObject[uid]['permalink'] ? firebaseProductsObject[uid]['permalink'] : '',
            firebaseProductsObject[uid]['hinweise_notes'] ? firebaseProductsObject[uid]['hinweise_notes'] : '',

          ]
        ]);
      }

      db.sqlBatch(preparedStatements, function() {
        console.log('Products populated');
      }, function(error) {
        console.log('SQL BATCH ERROR. COULDN\'T POPULATE PRODUCTS.' + error.message);
      });

    };

    var populateProductCategories = function(firebaseProductCategoriesObject) {

      var preparedStatements = [];
      var BLANK_CATEGORY_INSERT_QUERY = 'INSERT INTO product_categories VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
      for (var uid in firebaseProductCategoriesObject) {

        var filter_ids = firebaseProductCategoriesObject[uid]['filter_ids'] ? firebaseProductCategoriesObject[uid]['filter_ids'].join() : '';
        var download_ids = firebaseProductCategoriesObject[uid]['download_ids'] ? firebaseProductCategoriesObject[uid]['download_ids'].join() : '';
        var child_ids = firebaseProductCategoriesObject[uid]['child_ids'] ? firebaseProductCategoriesObject[uid]['child_ids'].join() : '';
        var product_ids = firebaseProductCategoriesObject[uid]['product_ids'] ? firebaseProductCategoriesObject[uid]['product_ids'].join() : '';

        preparedStatements.push([
          BLANK_CATEGORY_INSERT_QUERY,
          [
            parseInt(uid),
            firebaseProductCategoriesObject[uid]['title_de'],
            parseInt(firebaseProductCategoriesObject[uid]['elternelement']),
            firebaseProductCategoriesObject[uid]['produkte'],
            firebaseProductCategoriesObject[uid]['bild'],
            firebaseProductCategoriesObject[uid]['downloads'],
            child_ids,
            parseInt(firebaseProductCategoriesObject[uid]['sorting']),
            product_ids,
            filter_ids,
            download_ids,
            firebaseProductCategoriesObject[uid]['title_en']
          ]
        ]);
      }

      db.sqlBatch(preparedStatements, function() {
        console.log('Categories populated');
      }, function(error) {
        console.log('SQL BATCH ERROR. COULDN\'T POPULATE CATEGORIES.' + error.message);
      });

    };

    var populateDownloads = function(firebaseDownloadsObject) {

      var preparedStatements = [];
      var BLANK_DOWNLOAD_INSERT_QUERY = 'INSERT INTO downloads VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

      for (var uid in firebaseDownloadsObject) {

        preparedStatements.push([
          BLANK_DOWNLOAD_INSERT_QUERY,
          [
            parseInt(uid),
            firebaseDownloadsObject[uid]['thumbnail'],
            firebaseDownloadsObject[uid]['de_data']['artikelnummer'],
            firebaseDownloadsObject[uid]['de_data']['broschurentitel'],
            firebaseDownloadsObject[uid]['de_data']['zusatzinformation'],
            firebaseDownloadsObject[uid]['de_data']['datei'],
            firebaseDownloadsObject[uid]['produziert_bis'],
            firebaseDownloadsObject[uid]['en_data']['artikelnummer'],
            firebaseDownloadsObject[uid]['en_data']['broschurentitel'],
            firebaseDownloadsObject[uid]['en_data']['zusatzinformation'],
            firebaseDownloadsObject[uid]['en_data']['datei'],
            parseInt(firebaseDownloadsObject[uid]['filesize']),
            firebaseDownloadsObject[uid]['title'],
            firebaseDownloadsObject[uid]['de_data']['category']
          ]
        ]);
      }

      db.sqlBatch(preparedStatements, function() {
        console.log('Downloads populated');
      }, function(error) {
        console.log('SQL BATCH ERROR. COULDN\'T POPULATE DOWNLOADS.' + error.message);
      });

    };

    var populateAwards = function(firebaseAwardsObject) {

      var preparedStatements = [];
      var BLANK_AWARDS_INSERT_QUERY = 'INSERT INTO awards VALUES (?,?,?)';

      for (var uid in firebaseAwardsObject) {
        preparedStatements.push([
          BLANK_AWARDS_INSERT_QUERY,
          [
            uid,
            firebaseAwardsObject[uid]['titel'],
            firebaseAwardsObject[uid]['logo']
          ]
        ]);
      }

      db.sqlBatch(preparedStatements, function() {
        console.log('Awards populated');
      }, function(error) {
        console.log('SQL BATCH ERROR. COULDN\'T POPULATE AWARDS.' + error.message);
      });

    };

    var populateVideos = function(firebaseVideosObject) {

      var preparedStatements = [];
      var BLANK_VIDEO_INSERT_QUERY = 'INSERT INTO videos VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';

      for (var uid in firebaseVideosObject) {
        preparedStatements.push([
          BLANK_VIDEO_INSERT_QUERY,
          [
            parseInt(uid),
            firebaseVideosObject[uid]['title'],
            firebaseVideosObject[uid]['de_data']['startimage'],
            firebaseVideosObject[uid]['de_data']['videofile'],
            firebaseVideosObject[uid]['de_data']['information'],
            firebaseVideosObject[uid]['en_data']['startimage'],
            firebaseVideosObject[uid]['en_data']['videofile'],
            firebaseVideosObject[uid]['en_data']['information'],
            parseInt(firebaseVideosObject[uid]['filesize']),
            firebaseVideosObject[uid]['de_data']['youtube'],
            firebaseVideosObject[uid]['en_data']['youtube'],
            parseInt(firebaseVideosObject[uid]['category'])
          ]
        ]);
      }

      db.sqlBatch(preparedStatements, function() {
        console.log('Videos populated');
      }, function(error) {
        console.log('SQL BATCH ERROR. COULDN\'T POPULATE VIDEOS.' + error.message);
      });
    };

  var populateVideoCategories = function (firebaseVideoCategoriesObject) {

    var preparedStatements = [];
    var BLANK_VIDEO_CATEGORY_INSERT_QUERY = 'INSERT INTO video_categories VALUES (?,?,?)';

    for (var uid in firebaseVideoCategoriesObject) {
      preparedStatements.push([
        BLANK_VIDEO_CATEGORY_INSERT_QUERY,
        [
          parseInt(uid),
          firebaseVideoCategoriesObject[uid]['title_de'],
          firebaseVideoCategoriesObject[uid]['title_en']
        ]
      ])
    }

    db.sqlBatch(preparedStatements, function () {
      console.log('Video Categories populated');
    }, function (error) {
      console.log('SQL BATCH ERROR. COULDN\'T POPULATE VIDEO CATEGORIES.' + error.message);
    });

  };

  var populateZubehoer = function (firebaseObject) {
    var preparedStatements = [];
    var BLANK_VIDEO_INSERT_QUERY = 'INSERT INTO b_artikel_zubehoer VALUES (?,?,?,?,?,?,?,?)';

    for (var b_artikel_zubehoer_id in firebaseObject) {
      preparedStatements.push([
        BLANK_VIDEO_INSERT_QUERY,
        [
          parseInt(b_artikel_zubehoer_id),
          parseInt(firebaseObject[b_artikel_zubehoer_id]['b_artikel_id']),
          parseInt(firebaseObject[b_artikel_zubehoer_id]['lfdnr']),
          parseInt(firebaseObject[b_artikel_zubehoer_id]['status']),
          parseInt(firebaseObject[b_artikel_zubehoer_id]['recordstatus']),
          parseInt(firebaseObject[b_artikel_zubehoer_id]['pos_b_artikel_id']),
          parseInt(firebaseObject[b_artikel_zubehoer_id]['verknuepfung']),
          firebaseObject[b_artikel_zubehoer_id]['data']
        ]
      ]);
    }

    db.sqlBatch(preparedStatements, function () {
      console.log('ZUBEHOER populated');
    }, function (error) {
      console.log('SQL BATCH ERROR. COULDN\'T POPULATE ZUBEHOER.' + error.message);
    });
  };

  var populateCLanguage = function (firebaseObject) {
    var preparedStatements = [];
    var BLANK_VIDEO_INSERT_QUERY = 'INSERT INTO c_language VALUES (?,?,?,?,?,?,?)';

    for (var c_language_id in firebaseObject) {
      preparedStatements.push([
        BLANK_VIDEO_INSERT_QUERY,
        [
          parseInt(c_language_id),
          parseInt(firebaseObject[c_language_id]['recordstatus']),
          parseInt(firebaseObject[c_language_id]['table_id']),
          firebaseObject[c_language_id]['tablename'],
          firebaseObject[c_language_id]['fieldname'],
          firebaseObject[c_language_id]['langcode'],
          firebaseObject[c_language_id]['content']
        ]
      ]);
    }

    db.sqlBatch(preparedStatements, function () {
      console.log('C_LANGUAGE populated');
    }, function (error) {
      console.log('SQL BATCH ERROR. COULDN\'T POPULATE C_LANGUAGE.' + error.message);
    });
  };



    var selectTopCategories = function(success, error) {
      db.executeSql('SELECT * from product_categories where elternelement = 0 order by sorting;', [], function(rs) {
        success(rs);
      }, function (error) {
        error(error);
      });
    };

    var selectChildCategories = function(child_ids, success, error) {
      db.executeSql('SELECT * from product_categories where uid in (' + child_ids + ') order by sorting;',[], function(rs) {
        success(rs);
      }, function(error) {
        error(error);
      });
    };

  var selectAllCategories = function (success, error) {
    db.executeSql('SELECT * from product_categories order by sorting;', [], function (rs) {
      success(rs);
    }, function (error) {
      error(error);
    })
  };

  var selectProducts = function (product_ids, success, error) {
    db.executeSql('SELECT * from products where uid in (' + product_ids + ');', [], function (rs) {
      success(rs);
    }, function (error) {
      error(error);
    });
  };

  var selectProductsByBArtikelId = function (product_ids, success, error) {
    db.executeSql('SELECT * from products where b_artikel_id in (' + product_ids + ');', [], function (rs) {
      success(rs);
    }, function (error) {
      error(error);
    });
  };

  var selectAllProducts = function (success, error) {
    db.executeSql('SELECT * from products;', [], function (rs) {
      success(rs);
    }, function (error) {
      error(error);
    });
  };

    var selectVideos = function(video_ids, success, error) {
      db.executeSql('SELECT * from videos where uid in (' + video_ids + ');', [], function(rs) {
        success(rs);
      }, function(error) {
        error(error);
      });
    };

    var selectAllVideos = function (success, error) {
      db.executeSql('SELECT * from videos;', [], function(rs) {
        success(rs);
      }, function(error) {
        error(error);
      });
    };

  var selectVideoCategories = function (success, error) {
    db.executeSql('SELECT * from video_categories;', [], function (rs) {
      success(rs);
    }, function (error) {
      error(error);
    });
  };

    var selectDownloads = function(download_ids, success, error) {
      db.executeSql('SELECT * from downloads where uid in (' + download_ids + ');', [], function(rs) {
        success(rs);
      }, function(error) {
        error(error);
      });

    };

    var searchProducts = function(search_term, success, error) {
      db.executeSql('SELECT * from products where nummer LIKE "%' + search_term + '%" OR beschreibung_de LIKE "%' + search_term + '%" OR produktbezeichnung_de LIKE "%' + search_term + '%";', [], function(rs) {
        success(rs);
      }, function(error) {
        error(error);
      });
    };

  var selectAwards = function (award_ids, success, error) {
    db.executeSql('SELECT * from awards where uid in (' + award_ids + ');', [], function (rs) {
      success(rs);
    }, function (error) {
      error(error);
    });
  };

  var selectAccessories = function (product_b_artikel_id, status, success) {
    db.executeSql('SELECT b_artikel_zubehoer_id, status, verknuepfung, data, pos_b_artikel_id ' +
      'FROM b_artikel_zubehoer WHERE recordstatus=1 AND b_artikel_id=' + product_b_artikel_id +
      ' AND status=' + status + ' ORDER BY status,lfdnr;', [], function (rs) {
      success(rs);
    }, function (error) {
      console.log(error);
    });
  };

    return {
      populateProducts: populateProducts,
      populateProductCategories: populateProductCategories,
      populateDownloads: populateDownloads,
      populateAwards: populateAwards,
      populateVideos: populateVideos,
      populateVideoCategories: populateVideoCategories,
      populateZubehoer: populateZubehoer,
      populateCLanguage: populateCLanguage,
      selectTopCategories: selectTopCategories,
      selectAllCategories: selectAllCategories,
      selectChildCategories: selectChildCategories,
      selectProducts: selectProducts,
      selectProductsByBArtikelId: selectProductsByBArtikelId,
      selectAllProducts: selectAllProducts,
      selectVideos: selectVideos,
      selectVideoCategories: selectVideoCategories,
      selectAllVideos : selectAllVideos,
      selectDownloads: selectDownloads,
      selectAwards: selectAwards,
      selectAccessories: selectAccessories,
      searchProducts: searchProducts
    };

  }]);
