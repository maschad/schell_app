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
