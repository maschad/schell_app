angular.module('app.services', [])

.factory('localStorageService', ['$localStorage',  function($localStorage){

  //Local storage using ngStorage, for trivial persistence
  $localStorage = $localStorage.$default({
    country: '',
    boomarked_products: [],
    product_files: {},
    video_files: {},
    download_files: {},
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

  var getBoomarkedProducts = function () {
    return $localStorage.boomarked_products;
  };

  var boomarkProduct = function (product) {
    if($localStorage.boomarked_products.indexOf(product) != -1){
      return false;
    }else{
      $localStorage.boomarked_products.push(product);
      return true;
    }
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
    getBookmarkedProducts : getBoomarkedProducts,
    bookmarkProduct : boomarkProduct,
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

.factory('FirebaseService', ['$ionicPopup', function(){

  var goOffline = function () {
    firebase.database().goOffline();
  };

  //Download Product Category data from firebase
  var getAllProductCategories = function () {
    var categories = [];
    firebase.database().ref('/product_categories/').orderByKey().once('value').then(function (snapshot) {
      snapshot.forEach(function (category) {
        category.push(category.val());
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

  //Download Videos
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



  return{
    download : download
  }

}])

.factory('appDataService' , function () {
    var current_category = '';
    var email_link = 'http://www.schell.eu/deutschland-de/produkte/';
    var current_title = '';
    var previous_title = '';
    var root_title = '';

    var getCurrentCategory = function () {
      return current_category;
    };

    var setCurrentCategory = function (category) {
      current_category = category;
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
      getCurrentCategory : getCurrentCategory,
      setCurrentCategory : setCurrentCategory,
      getEmailLink : getEmailLink,
      appendEmailLink : appendEmailLink,
      getCurrentTitle : getCurrentTitle,
      setCurrentTitle : setCurrentTitle,
      getPreviousTitle : getPreviousTitle,
      setPreviousTitle : setPreviousTitle,
      getRootTitle : getRootTitle,
      setRootTitle : setRootTitle
    }


});
