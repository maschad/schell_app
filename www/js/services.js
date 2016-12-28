angular.module('app.services', [])


//Service for managing local storage queiries and items
.factory('localStorageService', ['$localStorage',  function($localStorage){

  //Local storage using ngStorage, for trivial persistence
  $localStorage = $localStorage.$default({
    country: '',
    bookmarked_products: [],
    product_files: [],
    video_files: [],
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
      }
    ],
    filters : {},
    last_updated : ''
  });

  // Getters and Setters

  var getCountry = function () {
    return $localStorage.country;
  };

  var setCountry = function (country) {
    $localStorage.country = country;
  };

  var getBookmarkedProducts = function () {
    return $localStorage.bookmarked_products;
  };

  var bookmarkProduct = function (product) {
    if($localStorage.bookmarked_products.indexOf(product) != -1){
      return false;
    }else{
      $localStorage.bookmarked_products.push(product);
      return true;
    }
  };

  var removeBookmarkedProduct = function(bookmark){
    $localStorage.bookmarked_products.splice(indexOf(bookmark),1);
  };

  var getOfflinePreferences = function () {
    return $localStorage.offlinePreferences;
  };

  var updatePreferences = function (data) {
    $localStorage.offlinePreferences = data;
  };

  var getProductFile = function (product_id) {
    return $localStorage.product_files[product_id];
  };

  var setProductFile = function (product_id,product_info) {
    $localStorage.product_files[product_id] = product_info;
  };

  var getAllVideoPaths = function () {
    return $localStorage.video_files;
  };

  var getVideoPath = function (video_id) {
    return $localStorage.video_files[video_id];
  };

  var setVideoPath = function (video_id,path) {
    $localStorage.video_files[video_id] = path;
  };

  var getDownloadFiles =  function () {
    return $localStorage.download_files;
  };

  var setFilters = function (filters) {
    $localStorage.filters = filters;
  };

  return {
    getCountry : getCountry,
    setCountry : setCountry,
    getBookmarkedProducts : getBookmarkedProducts,
    bookmarkProduct : bookmarkProduct,
    removeBookmarkedProduct : removeBookmarkedProduct,
    getOfflinePreferences : getOfflinePreferences,
    updatePreferences : updatePreferences,
    getProductFile : getProductFile,
    setProductFile : setProductFile,
    getAllVideoPaths : getAllVideoPaths,
    getVideoPath : getVideoPath,
    setVideoPath : setVideoPath,
    getDownloadFiles : getDownloadFiles,
    setFilters : setFilters
  };


}])

  //Service for managing firebase queries
.factory('FirebaseService', ['$ionicPopup', function(){

  var goOffline = function () {
    firebase.database().goOffline();
  };

  //Download Product Category data from firebase
  var getAllProductCategories = function () {
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

      return categories;
  };

  //Get the top level categories e.g. Wastchisch, Modus, Linus etc.
  var getTopLevelCategory = function () {
    var  topLevel = [];

    firebase.database().ref('/product_categories/').orderByChild('elternelement').equalTo(0).once('value').then(function (snapshot) {
      snapshot.forEach(function (category) {
        topLevel.push(category.val());
      });
    }, function (error) {
      $ionicPopup.confirm({
        title: "Error Connecting to Database",
        content: error
      });
    });

    return topLevel;
  };

  //Download a set of Products by id
  var downloadProducts = function(product_ids) {
    var products = {};
    for(var i = 0; i < product_ids.length; i++){
      firebase.database().ref('/products/').orderByKey().equalTo(product_ids[i]).once('value').then(function (snapshot) {
        products[snapshot.key] = snapshot.val();
      }, function (error) {
        $ionicPopup.confirm({
          title: "Error Connecting to Database",
          content: error
        });
      });
    }

    return products;
  };

  var downloadAllProducts = function () {
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

    return products;
  };

  //Download Videos
  var downloadVideos = function () {
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


    return videos;

  };

  //Download files from downloads table
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


  //Download the filters for a product
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
    getAllProductCategories : getAllProductCategories,
    getTopLevelCategories : getTopLevelCategory,
    downloadProducts : downloadProducts,
    downloadVideos : downloadVideos,
    downloadFiles : downloadFiles,
    downloadProuctFilters : downloadProductFilters,
    downloadAllProducts : downloadAllProducts
  };

}])

//Service for managing Files
.factory('FileService',[function () {

    //Save a file to system path
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



  return{
    download : download
  }

}])
//Service for storing in app Data to be shared between controllers
.factory('appDataService' , function () {
    var current_category_child_ids = '';
    var email_link = 'http://www.schell.eu/deutschland-de/produkte/';
    var current_title = '';
    var previous_title = '';
    var root_title = '';

    var getCurrentCategoryIds = function () {
      return current_category_child_ids;
    };

    var setCurrentCategoryIds = function (category) {
      current_category_child_ids = category;
    };

    var getEmailLink = function () {
      return email_link;
    };

    var appendEmailLink = function (data) {
      email_link.concat(data);
    };

    var getCurrentTitle = function () {
      return current_title;
    };

    var setCurrentTitle = function (title) {
      current_title = title;
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

    return {
      getCurrentCategoryIds : getCurrentCategoryIds,
      setCurrentCategoryIds : setCurrentCategoryIds,
      getEmailLink : getEmailLink,
      appendEmailLink : appendEmailLink,
      getCurrentTitle : getCurrentTitle,
      setCurrentTitle : setCurrentTitle,
      getPreviousTitle : getPreviousTitle,
      setPreviousTitle : setPreviousTitle,
      getRootTitle : getRootTitle,
      setRootTitle : setRootTitle
    }


})
//Database Service
.factory('DatabaseService', ['$cordovaSQLite', function($cordovaSQLite) {
    db = $cordovaSQLite.openDB({
      "name": "schell.db",
      "location": "default"
    });

    var populateProducts = function(firebaseProductsObject) {
      var preparedStatements = [];
      var BLANK_PRODUCT_INSERT_QUERY = 'INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

      for (var uid in firebaseProductsObject) {
        var filter_ids = firebaseProductsObject[uid]['filter_ids'].join();
        var download_ids = firebaseProductsObject[uid]['media']['download_ids'].join();

        preparedStatements.push([
          BLANK_PRODUCT_INSERT_QUERY,
          [
            uid,
            firebaseProductsObject[uid]['nummer'],
            firebaseProductsObject[uid]['referenzartikel'],
            firebaseProductsObject[uid]['de_data']['produktbezeichnung'],
            firebaseProductsObject[uid]['de_data']['zusatz1'],
            firebaseProductsObject[uid]['de_data']['zusatz2'],
            firebaseProductsObject[uid]['de_data']['beschreibung'],
            firebaseProductsObject[uid]['de_data']['differenzierung'],
            firebaseProductsObject[uid]['de_data']['lieferumfang'],
            firebaseProductsObject[uid]['de_data']['einsatzbereich'],
            firebaseProductsObject[uid]['de_data']['werkstoff'],
            firebaseProductsObject[uid]['de_data']['geraeuschklasse'],
            firebaseProductsObject[uid]['de_data']['pruefzeichen'],
            firebaseProductsObject[uid]['de_data']['dimension'],
            firebaseProductsObject[uid]['de_data']['oberflaeche'],
            firebaseProductsObject[uid]['verpackungseinheit'],
            firebaseProductsObject[uid]['gewicht'],
            firebaseProductsObject[uid]['media']['image_landscape'],
            firebaseProductsObject[uid]['media']['image_landscape_filesize'],
            firebaseProductsObject[uid]['media']['image_portrait'],
            firebaseProductsObject[uid]['media']['image_portrait_filesize'],
            firebaseProductsObject[uid]['media']['technical_drawing_link'],
            firebaseProductsObject[uid]['media']['technical_drawing_filesize'],
            filter_ids,
            download_ids,
            firebaseProductsObject[uid]['en_data']['produktbezeichnung'],
            firebaseProductsObject[uid]['en_data']['zusatz1'],
            firebaseProductsObject[uid]['en_data']['zusatz2'],
            firebaseProductsObject[uid]['en_data']['beschreibung'],
            firebaseProductsObject[uid]['en_data']['differenzierung'],
            firebaseProductsObject[uid]['en_data']['lieferumfang'],
            firebaseProductsObject[uid]['en_data']['einsatzbereich'],
            firebaseProductsObject[uid]['en_data']['werkstoff'],
            firebaseProductsObject[uid]['en_data']['geraeuschklasse'],
            firebaseProductsObject[uid]['en_data']['pruefzeichen'],
            firebaseProductsObject[uid]['en_data']['dimension'],
            firebaseProductsObject[uid]['en_data']['oberflaeche']
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
      var BLANK_CATEGORY_INSERT_QUERY = 'INSERT INTO product_categories VALUES (?,?,?,?,?,?,?,?,?,?,?)';
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
      var BLANK_DOWNLOAD_INSERT_QUERY = 'INSERT INTO downloads VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';

      for (var uid in firebaseDownloadsObject) {
        preparedStatements.push([
          BLANK_DOWNLOAD_INSERT_QUERY,
          [
            uid,
            firebaseDownloadsObject[uid]['thumbnail'],
            firebaseDownloadsObject[uid]['de_data']['artikelnummer'],
            firebaseDownloadsObject[uid]['de_data']['broschuerentitel'],
            firebaseDownloadsObject[uid]['de_data']['zusatzinformation'],
            firebaseDownloadsObject[uid]['de_data']['datei'],
            firebaseDownloadsObject[uid]['produziert_bis'],
            firebaseDownloadsObject[uid]['en_data']['artikelnummer'],
            firebaseDownloadsObject[uid]['en_data']['broschuerentitel'],
            firebaseDownloadsObject[uid]['en_data']['zusatzinformation'],
            firebaseDownloadsObject[uid]['en_data']['datei'],
            firebaseDownloadsObject[uid]['filesize'],
            firebaseDownloadsObject[uid]['title']
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
      var BLANK_VIDEO_INSERT_QUERY = 'INSERT INTO videos VALUES (?,?,?,?,?,?,?,?,?,?,?)';

      for (var uid in firebaseVideosObject) {
        preparedStatements.push([
          BLANK_VIDEO_INSERT_QUERY,
          [
            uid,
            firebaseVideosObject[uid]['title'],
            firebaseVideosObject[uid]['de_data']['startimage'],
            firebaseVideosObject[uid]['de_data']['videofile'],
            firebaseVideosObject[uid]['de_data']['information'],
            firebaseVideosObject[uid]['en_data']['startimage'],
            firebaseVideosObject[uid]['en_data']['videofile'],
            firebaseVideosObject[uid]['en_data']['information'],
            firebaseVideosObject[uid]['filesize'],
            firebaseVideosObject[uid]['de_data']['youtube'],
            firebaseVideosObject[uid]['en_data']['youtube']
          ]
        ]);
      }

      db.sqlBatch(preparedStatements, function() {
        console.log('Videos populated');
      }, function(error) {
        console.log('SQL BATCH ERROR. COULDN\'T POPULATE VIDEOS.' + error.message);
      });
    };

    var selectTopCategories = function(success, error) {
      console.log('Selecting Top categories');
      db.executeSql('SELECT * from product_categories where elternelement = 0;', [], function(rs) {
        console.log('Success selected');
        success(rs);
      }, function (error) {
        error(error);
      });
    };

    var selectChildCategories = function(child_ids, success, error) {
      db.executeSql('SELECT * from product_categories where uid in (' + child_ids + ');',[], function(rs) {
        success(rs);
      }, function(error) {
        error(error);
      });
    };

    var selectProducts = function(product_ids, success, error) {
      db.executeSql('SELECT * from products where uid in (' + product_ids + ');',[], function(rs) {
        success(rs);
      }, function(error) {
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

    var selectDownloads = function(download_ids, success, error) {
      db.executeSql('SELECT * from downloads where uid in (' + download_ids + ');', [], function(rs) {
        success(rs);
      }, function(error) {
        error(error);
      });

    };

    var searchProducts = function(search_term, success, error) {
      db.executeSql('SELECT * from products where nummer LIKE %' + search_term + '% OR beschreibung_de LIKE %' + search_term + '% OR produktbezeichnung_de LIKE %' + search_term + ';', [], function(rs) {
        success(rs);
      }, function(error) {
        error(error);
      });
    };

    return {
      populateProducts: populateProducts,
      populateProductCategories: populateProductCategories,
      populateDownloads: populateDownloads,
      populateAwards: populateAwards,
      populateVideos: populateVideos,
      selectTopCategories: selectTopCategories,
      selectChildCategories: selectChildCategories,
      selectProducts: selectProducts,
      selectVideos: selectVideos,
      selectDownloads: selectDownloads,
      searchProducts: searchProducts
    };

  }]);
