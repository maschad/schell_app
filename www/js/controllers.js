angular.module('app.controllers', [])

  .controller('start_screenCtrl', ['$scope', '$state', 'appDataService', 'DatabaseService', 'FileService', 'FirebaseService', 'localStorageService', '$ionicLoading', '$ionicPopup', '$ionicPopover', '$rootScope', '$ionicSideMenuDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $state, appDataService, DatabaseService, FileService, FirebaseService, localStorageService, $ionicLoading, $ionicPopup, $ionicPopover, $rootScope, $ionicSideMenuDelegate) {
 //Remove splash screen
  $scope.$on('$ionicView.afterEnter', function(){
    setTimeout(function(){
      document.getElementById("custom-overlay").style.display = "none";
    }, 3000);
  });

      //Loading functions
      $scope.showLoad = function () {
        $ionicLoading.show({
          template: '<p>Suche nach Updates...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
      };
      $scope.hideLoad = function () {
        $ionicLoading.hide();
      };

      //Helper function to cache slider images
      function downloadImages(number, url, fileName, dirName) {
        FileService.originalDownload(url, fileName, dirName, function (path) {
          localStorageService.setCarouselPath(number, path);
        });
      }

  //Side Menu
  $ionicSideMenuDelegate.canDragContent(false);

      function loadPage() {
        //Check for internet
        appDataService.checkInternet();


        //Clear categories
        appDataService.clearNavigatedCategories();

        //Whether anything is bookmarked
        $scope.bookmarks = [];

        //load bookmarked
        $scope.bookmarks = localStorageService.getBookmarkedProducts();
        //If there is internet, populate the DB with latest data, else, work with what is in database
        var lastUpdated = localStorageService.getLastUpdated();
        if (lastUpdated) {
          console.log('Database last updated at: ' + lastUpdated);
          var shouldUpdate = (Date.now() - lastUpdated) > 86400000; //We should update if we haven't in more than 24 hours..
        } else {
          console.log('Fresh installation, should update database.');
          var shouldUpdate = true;
        }
        if ($rootScope.internet && shouldUpdate) {
          $scope.showLoad();
          var country = localStorageService.getCountry();
          FirebaseService.downloadAllProducts(function (results) {
            DatabaseService.populateProducts(results, country, function() {
              FirebaseService.getAllProductCategories(function (results) {
                DatabaseService.populateProductCategories(results, country, function() {
                  var allCats = [];
                  var topCats = [];
                  var allProducts = [];
                  DatabaseService.selectTopCategories(function (topCategories) {
                    for (var x = 0; x < topCategories.rows.length; x++) {
                      topCats.push(topCategories.rows.item(x));
                    }
                    DatabaseService.selectAllCategories(function (allCategories) {
                      for (var z = 0; z < allCategories.rows.length; z++) {
                        allCats.push(allCategories.rows.item(z));
                      }
                      DatabaseService.selectAllProducts(function(productResults) {
                        for (var y = 0; y < productResults.rows.length; y++) {
                          allProducts.push(productResults.rows.item(y));
                        }
                        topCats.forEach(function (topCategory) {
                          console.log('counting artikels for ' + topCategory.title_de);
                          var count = countArtikelProduct(topCategory, allCats, allProducts);
                          localStorageService.setProductCount(topCategory.uid, count);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
          FirebaseService.downloadFiles(function (results) {
            DatabaseService.populateDownloads(results);
          });
          FirebaseService.downloadVideos(function (results) {
            DatabaseService.populateVideos(results);
          });
          FirebaseService.downloadVideoCategories(function (results) {
            DatabaseService.populateVideoCategories(results);
          });
          FirebaseService.downloadAwards(function (results) {
            DatabaseService.populateAwards(results);
          });
          FirebaseService.downloadZubehoer(function (results) {
            DatabaseService.populateZubehoer(results);
          });
          FirebaseService.downloadProductFilters(function (results) {
            localStorageService.setFilters(results);
            $scope.hideLoad();
            //If internet grab those images
            var url = 'http://www.schell.eu/fileadmin/app/slider/slider';
            for (var i = 1; i < 5; i++) {
              downloadImages(i, url.concat(i + '.png'), 'slider'.concat(i + '.png'), 'imgs');
            }
          });

          // Count Artikels
          countArtikelProduct = function (category, allCategories, products) {
            if (category.child_ids == '') {
              var product_ids = category.product_ids.split(',');
              product_ids = product_ids.filter(function(product_id) {
                var productInDatabase = false;
                products.forEach(function(product) {
                  if (parseInt(product_id) == product.uid) {
                    productInDatabase = true;
                  }
                });
                return productInDatabase;
              });
              localStorageService.setProductCount(category.uid, product_ids.length);
              return product_ids.length;
            } else {
              var count = 0;
              var childCategories = allCategories.filter(function (cat) {
                return cat.elternelement == category.uid;
              });
              childCategories.forEach(function (childCategory) {
                count += countArtikelProduct(childCategory, allCategories, products);
              });
            localStorageService.setProductCount(category.uid, count);
            return count;
          }
        };
          localStorageService.setLastUpdated(Date.now());
        } else {
          $scope.images = localStorageService.getCarouselPaths();

        }
      }

      //Load the page
      loadPage();

  $scope.swiper = {};

  $scope.onReadySwiper = function (swiper) {

    swiper.on('slideChangeStart', function () {
    });

    swiper.on('onSlideChangeEnd', function () {
    });
  };

  $ionicPopover.fromTemplateUrl('templates/settingsPopover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
    //Ensure popover is iOS
    document.body.classList.remove('platform-android');
    document.body.classList.add('platform-ios');
  });

  $scope.openPopover = function ($event) {
    $scope.popover.show($event);
  };


  $scope.goSettings = function () {
    $state.go('settings');
    $scope.popover.hide();
  };

      //On item refresh
      $scope.refreshItems = function () {
        //Check for internet
        appDataService.checkInternet();
        //Download images if internet
        if ($rootScope.internet) {
          var url = 'http://www.schell.eu/fileadmin/app/slider/slider';
          for (var i = 1; i < 5; i++) {
            downloadImages(i, url.concat(i + '.png'), 'slider'.concat(i + '.png'), 'imgs');
          }
        } else {
          $ionicPopup.alert({
            title: 'Internet getrennt',
            template: 'Einstellungen werden deaktiviert,' +
            ' und alle Materialien, ' +
            'die nicht heruntergeladen wurden'
          });
          $scope.images = localStorageService.getCarouselPaths();
          for (var image in $scope.images) {
            console.log('image', image);
          }
        }
      };

}])

  .controller('productOverviewCtrl', ['$scope', '$rootScope', '$ionicLoading', '$ionicHistory', '$state', 'appDataService', 'FileService', 'DatabaseService', 'localStorageService', '$ionicPopover',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $rootScope, $ionicLoading, $ionicHistory, $state, appDataService, FileService, DatabaseService, localStorageService, $ionicPopover) {


      //Breadcrumb state changer
      $scope.goState = function (index, length) {
        //Have to pop the until we reach the index the user has selected
        for (var i = length - 1; i > index; i--) {
          appDataService.removeNavigatedCategory();
          appDataService.getCurrentCategoryIds();
        }

        switch (index) {
          case 0:
            $state.go('products');
            break;

          case length - 1:
            break;

          default:
            $state.go('product_lines');
            break;
        }

      };

      //History function
      $scope.$on('go-back', function () {
        appDataService.removeNavigatedCategory();
        var pop = appDataService.getCurrentCategoryIds();
        $state.go('product_lines');
      });

      $scope.arrowStyle = function (index, length) {
        var indent = 18 * index;
        if (index == length - 1) {
          return {'text-indent': indent + 'px', 'background-color': '#000000'};
        } else {
          return {'text-indent': indent + 'px'};
        }
      };

      $scope.filter_ids = appDataService.getFilterIds();

      $scope.$on('new-filter-uid', function() {
        updateProductsWithFilters();
      });

      function updateProductsWithFilters() {
        //Total amount of filtered products
        $scope.total_filtered_products = 0;

        if ($scope.filter_ids !== ''){
          var currentFilterIds = appDataService.getCurrentSelectedFilterIds();

          for (var i = 0; i < $scope.products.length; i++) {
            // A product should not be shown unless it has all of the current clicked filters
            var hasAllFilters = true;
            for (var j = 0; j < currentFilterIds.length; j++) {
              hasAllFilters = hasAllFilters && ($scope.products[i].filter_ids.split(',').indexOf(currentFilterIds[j]) !== -1);
            }
            var shouldBeFiltered = !hasAllFilters;
            if (shouldBeFiltered) {
              $scope.total_filtered_products++;
            }
            $scope.products[i] = Object.assign({}, $scope.products[i], {'filter': shouldBeFiltered});
          }
        }
      }

      //Loading functions
      $scope.show = function () {
        $ionicLoading.show({
          template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
      };
      $scope.hide = function () {
        $ionicLoading.hide();
      };

      //Function to download file
      function downloadImage(uid, url, filename) {
        FileService.originalDownload(url, filename.concat('.png'), 'imgs', function (path) {
          localStorageService.setPortraitPath(uid, path);
        });
      }


      //Function to load the products for this category
      function getProducts(product_ids) {
        //Show loading
        $scope.show();

        //Get Titles
        $scope.title = appDataService.checkCurrentCategory();

        //Check for internet
        appDataService.checkInternet();


        //Whether to a product is bookmarked
        $scope.showBookmark = false;


        //Once there are products bookmarked
        if (localStorageService.getBookmarkedProducts().length > 0) {
          $scope.showBookmark = true;
        }

        //Initialize products to empty
        $scope.products = [];

        //Load the various products
        DatabaseService.selectProducts(product_ids, function (products) {
          for (var x = 0; x < products.rows.length; x++) {
            // Remove "SCHELL" from title
            var product = products.rows.item(x);
            if (product.produktbezeichnung_de.indexOf("SCHELL ") === 0) {
              product.produktbezeichnung_de = product.produktbezeichnung_de.substr(7);
            }

            $scope.products.push(product);
            //To uid to save file path
            var uid = $scope.products[x].uid;
            if (!$rootScope.internet) {
              if (localStorageService.productImageDownloaded(uid)) {
                $scope.products[x].image_portrait = localStorageService.getPortraitPath(uid);
              } else {
                $scope.products[x].image_portrait = 'img/placeholder.png';
              }

            } else if ($rootScope.internet) {
              downloadImage(uid, $scope.products[x].image_portrait, $scope.products[x].nummer.concat('_portrait'));
            }
          }

          updateProductsWithFilters();

          //Hide the loading screen
          $scope.hide();

        }, function (error) {
          //Handle error
          console.log('ERROR', error);
        });
    }



    //load Products
      getProducts(appDataService.checkCurrentCategoryIds());



    //Popover function
    $ionicPopover.fromTemplateUrl('templates/breadcrumb.html', {
      scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
        //Ensure popover is ios
        document.body.classList.remove('platform-ios');
        document.body.classList.add('platform-android');
    });


    $scope.choice = function (product,title) {
      appDataService.addNavigatedCategory(title);
      appDataService.setCurrentCategoryIds(product.uid);
      appDataService.setCurrentProduct(product);
      $state.go('detailPage');
    };


  }])

  .controller('product_areasCtrl', ['$scope', '$rootScope', '$state', '$ionicFilterBar', '$ionicHistory', 'FileService', 'FirebaseService', 'appDataService', 'DatabaseService', 'localStorageService', '$ionicPopover', '$ionicLoading', '$ionicSideMenuDelegate',
    function ($scope, $rootScope, $state, $ionicFilterBar, $ionicHistory, FileService, FirebaseService, appDataService, DatabaseService, localStorageService, $ionicPopover, $ionicLoading, $ionicSideMenuDelegate) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

      //History function
      $scope.$on('go-back', function () {
        $ionicHistory.goBack();
      });

      $scope.arrowStyle = function (index, length) {
        var indent = 18 * index;
        if (index == length - 1) {
          return {'text-indent': indent + 'px', 'background-color': '#000000'};
        } else {
          return {'text-indent': indent + 'px'};
        }
      };

      //Initialize as null
      $scope.categories = [];

      //Counts
      $scope.counts = localStorageService.getProductCounts();

      //Loading functions
      $scope.showLoad = function () {
        $ionicLoading.show({
          template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
      };
      $scope.hideLoad = function () {
        $ionicLoading.hide();
      };


    //Call the function to populate categories
    loadCategories();

      //Function to download file
      function downloadImage(uid, url, filename) {
        FileService.originalDownload(url, filename, 'imgs', function (path) {
          localStorageService.setBildPath(uid, path);
        });
      }


    //Load Categories from Database.
    function loadCategories() {
      $scope.showLoad();
      //Check for internet
      appDataService.checkInternet();

      //Clear categories
      appDataService.clearNavigatedCategories();

      //Set the title
      appDataService.addNavigatedCategory('PRODUKTE');
      //To keep stacks in line
      appDataService.setCurrentCategoryIds('');

      //Whether to a product is bookmarked
      $scope.showBookmark = false;


      //Once there are products bookmarked
      if (localStorageService.getBookmarkedProducts().length > 0) {
        $scope.showBookmark = true;
      }


      DatabaseService.selectTopCategories(function (results) {
        for (var x = 0; x < results.rows.length; x++) {
          $scope.categories.push(results.rows.item(x));
          var uid = $scope.categories[x].uid;
          if (!$rootScope.internet) {
            if (localStorageService.categoryDownloaded(uid)) {
              $scope.categories[x].bild = localStorageService.getBildPath(uid);

            } else {
              $scope.categories[x].bild = 'img/placeholder.png';
            }

          } else if ($rootScope.internet) {
            downloadImage(uid, $scope.categories[x].bild, $scope.categories[x].title_de.concat('_bild.png'));
          }
        }
        $scope.hideLoad();
      }, function (error) {
        //Handle error
        console.log('ERROR',error);
      });
    }

    //Popover function
    $ionicPopover.fromTemplateUrl('templates/breadcrumb.html', {
      scope: $scope
    }).then(function (popover) {
      $scope.popover = popover;
      //Ensure popover is android
      document.body.classList.remove('platform-ios');
      document.body.classList.add('platform-android');
    });


    //The category chosen by the user
    $scope.choice = function (child_ids, title,filter_ids) {
      appDataService.addNavigatedCategory(title);
      appDataService.setCurrentCategoryIds(child_ids);
      appDataService.setFilterIds(filter_ids);
      $scope.$emit('updateFilters');
      $state.go('product_lines');
    };

  }])


  .controller('videoCategoriesCtrl', ['$scope', '$state', '$ionicHistory', 'DatabaseService', 'appDataService', function ($scope, $state, $ionicHistory, DatabaseService, appDataService) {

    //History function
    $scope.$on('go-back', function () {
      $ionicHistory.goBack();
    });

    function loadCategories() {
      $scope.categories = [];

      DatabaseService.selectVideoCategories(function (results) {
        for (var x = 0; x < results.rows.length; x++) {
          $scope.categories.push(results.rows.item(x));
        }
      });
    }

    loadCategories();

    $scope.choice = function (uid) {
      //Video ids to select
      var video_ids = [];
      DatabaseService.selectAllVideos(function (results) {
        for (var y = 0; y < results.rows.length; y++) {
          if (uid === results.rows.item(y).category) {
            //push them into array to select correct videos
            video_ids.push(results.rows.item(y).uid);
          }
        }
        appDataService.setVideoId(video_ids);
        $state.go('video');
      })
    }
  }])


  .controller('videoCtrl', ['$scope', '$rootScope', '$sce', '$ionicHistory', '$ionicSideMenuDelegate', 'appDataService', 'FirebaseService', 'FileService', '$ionicLoading', '$ionicPopup', 'localStorageService', 'DatabaseService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $rootScope, $sce, $ionicHistory, $ionicSideMenuDelegate, appDataService, FirebaseService, FileService, $ionicLoading, $ionicPopup, localStorageService, DatabaseService) {
    //Initialize empty array
  $scope.videos = [];

      //History function
      $scope.$on('go-back', function () {
        $ionicHistory.goBack();
      });

  //Loading functions
  $scope.show = function() {
    $ionicLoading.show({
      template: '<p>Loading Videos...</p><ion-spinner></ion-spinner>',
      animation:'fade-in',
      showBackdrop:true
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide();
  };


  //Function to load the videos
  function loadVideos() {
    $scope.show();
    //Check for internet
    appDataService.checkInternet();
    var video_ids = appDataService.getVideoIds();
    DatabaseService.selectVideos(video_ids, function (videos) {
      for (var x = 0; x < videos.rows.length; x++) {
        $scope.videos.push(videos.rows.item(x));
      }
      if (!$rootScope.internet) {
        console.log('no internet');
        var vids = localStorageService.getAllVideoPaths();
        console.log('vids', vids);
        if (angular.equals(vids, {})) {
          $ionicPopup.alert({
            title: 'Keine Videos heruntergeladen'
          });
          //Set undownloaded images to default path
          console.log('not downloaded');
          for (var i = 0; i < $scope.videos.length; i++) {
            $scope.videos[i].startimage_de = 'img/placeholder.png';
          }
        } else {
          for (var key in vids) {
            var index = $scope.videos.findIndex(function (video) {
              return video.uid == key;
            });
            //Check for invalid paths
            if (index != -1) {
              console.log('image video path in local storage', vids[key].startimage_de);
              $scope.videos[index].startimage_de = vids[key].startimage_de;
              console.log('video path in local storage', vids[key].videofile_de);
              $scope.videos[index].videofile_de = vids[key].videofile_de;
            } else {
              //Set undownloaded images to default path
              console.log('not downloaded');
              $scope.videos[index].startimage_de = 'img/placeholder.png';
            }
          }
        }
      }
      $scope.hide();
    });

  }

  //Load Videos
  loadVideos();


  //return trusted external links
  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };


}])

  .controller('settingsCtrl', ['$scope', '$stateParams', '$ionicHistory', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $ionicHistory) {
      //History function
      $scope.$on('go-back', function () {
        $ionicHistory.goBack();
      });


}])

.controller('countryselectCtrl', ['$scope', '$state', '$ionicSideMenuDelegate','localStorageService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $state, $ionicSideMenuDelegate,localStorageService) {
  //Side Menu
  $ionicSideMenuDelegate.canDragContent(false);

  $scope.$on('$ionicView.afterEnter', function(){
    setTimeout(function(){
      document.getElementById("custom-overlay").style.display = "none";
    }, 3000);
  });

  $scope.country = 'de';

  $scope.selection = function(country) {
     $scope.country = country;
  };

  $scope.selectCountry = function() {
    localStorageService.setCountry($scope.country);
    $state.go('start-screen');
  };

}])

  .controller('detailPageCtrl', ['$scope', '$state', '$rootScope', '$ionicModal', '$ionicPopover', '$ionicHistory', '$sce', 'FileService', 'FirebaseService', 'appDataService', 'localStorageService', 'DatabaseService', '$ionicSideMenuDelegate', '$ionicLoading', '$ionicPopup', '$cordovaInAppBrowser',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $state, $rootScope, $ionicModal, $ionicPopover, $ionicHistory, $sce, FileService, FirebaseService, appDataService, localStorageService, DatabaseService, $ionicSideMenuDelegate, $ionicLoading, $ionicPopup, $cordovaInAppBrowser) {


      //Breadcrumb state changer
      $scope.goState = function (index, length) {
        //Have to pop the until we reach the index the user has selected
        for (var i = length - 1; i > index; i--) {
          appDataService.removeNavigatedCategory();
          appDataService.getCurrentCategoryIds();
        }

        switch (index) {
          case 0:
            $state.go('products');
            break;

          case 1:
            if ($rootScope.navigated_categories.includes('SUCHE')) {
              $state.go('searchPage');
            } else if ($rootScope.navigated_categories.includes('MERKZETTEL')) {
              $state.go('bookmark');
            } else {
              $state.go('product_lines');
            }
            break;

          case length - 1:
            break;

          case length - 2:
            $state.go('product_overview');
            break;

          default:
            $state.go('product_lines');
            break;
        }
      };


      //Side Menu
      $ionicSideMenuDelegate.canDragContent(false);

      $scope.arrowStyle = function (index, length) {
        var indent = 18 * index;
        if (index == length - 1) {
          return {'text-indent': indent + 'px', 'background-color': '#000000'};
        } else {
          return {'text-indent': indent + 'px'};
        }
      };

      //History function
      var goback = $scope.$on('go-back', function () {

        appDataService.removeNavigatedCategory();
        var pop = appDataService.getCurrentCategoryIds();
        if ($rootScope.navigated_categories.includes('MERKZETTEL') || $rootScope.navigated_categories.includes('SUCHE')) {
          $ionicHistory.goBack();
        } else {
          $state.go('product_overview');
        }
      });

      $scope.$on('$destroy', goback);



      //Loading functions
      $scope.show = function () {
        $ionicLoading.show({
          template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
      };

      //Loading functions
      $scope.showDownload = function () {
        $ionicLoading.show({
          template: '<p>Downloading Data...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
      };
      $scope.hide = function () {
        $ionicLoading.hide();
      };

      //The products to be show in collapsible list
      $scope.files = [];
      //Possible awards
      $scope.awards = [];
      //Array of Bookmarked Products
      $scope.bookmarked = [];
      //Videos for that corresponding product
      $scope.videos = [];



      //Load the product information
      function loadProduct() {
        $scope.show();
        //Check for internet
        appDataService.checkInternet();

        //Whether to a product is bookmarked
        $scope.bookmarked = false;

        //Load the bookmarks
        $scope.bookmarks = localStorageService.getBookmarkedProducts();

        //Get various labels
        $scope.title = appDataService.checkCurrentCategory();
        $scope.artikel = $scope.title;

        //Set details
        $scope.details = appDataService.getCurrentProduct();
        //Remove SCHELL from title
        if ($scope.details.produktbezeichnung_de.indexOf("SCHELL ") === 0) {
          $scope.details.produktbezeichnung_de = $scope.details.produktbezeichnung_de.substr(7);
        }

        //If product bookmarked
        if (!localStorageService.checkBookmarked($scope.details)) {
          $scope.bookmarked = true;
        }


        //Whether this product has been downloaded
        $scope.productDownloaded = localStorageService.productDownloaded($scope.details.uid);


        if (!$rootScope.internet) {
          if ($scope.productDownloaded) {
            //If no internet load these files
            $scope.details.image_landscape = localStorageService.getLandscapePath($scope.details.uid);
            $scope.details.image_portrait = localStorageService.getPortraitPath($scope.details.uid);
            $scope.details.technical_drawing_link = localStorageService.getTechnicalPath($scope.details.uid);
          } else {
            //If no internet load these files
            $scope.details.image_landscape = 'img/placeholder.png';
            $scope.details.image_portrait = 'img/placeholder.png';
            $scope.details.technical_drawing_link = 'img/placeholder.png';
          }
        }

        getFiles($scope.details.download_ids); //Downloads PDFs then goes to videos...
      }

      //Function to load files
      function getFiles(download_ids) {
        if (download_ids === '') {
          getVideos($scope.details.video_ids); // Downloads videos then gets varianten
        } else {
          DatabaseService.selectDownloads(download_ids, function (downloads) {
            for(var x = 0; x < downloads.rows.length; x++){
              if (downloads.rows.item(x).datei_de.includes('pdf')) {
                $scope.files.push(downloads.rows.item(x));
              }
            }
            //If no internet load local path
            if (!$rootScope.internet && localStorageService.productDownloaded($scope.details.uid)) {
              $scope.files.forEach(function (file, index) {
                file.thumbnail = localStorageService.getThumbnailPath($scope.details.uid, index);
              });
            }
            getVideos($scope.details.video_ids);
          });
        }
      }

      function getVideos(video_ids) {
        if (video_ids === '') {
          getProductVariations($scope.details.varianten); //Downloads varianten then goes to awards...
        } else {
          DatabaseService.selectVideos(video_ids, function(videos){
            for(var x = 0; x < videos.rows.length; x++){
              $scope.videos.push(videos.rows.item(x));
              if (!$rootScope.internet) {
                if (localStorageService.productDownloaded($scope.details.uid)) {
                  console.log('videofile', $scope.videos[x].videofile_de = localStorageService.getVideoPath($scope.videos[x].uid));
                  $scope.videos[x].startimage_de = localStorageService.getVideoImagePath($scope.videos[x].uid);
                  $scope.videos[x].videofile_de = localStorageService.getVideoPath($scope.videos[x].uid);
                } else {
                  $scope.videos[x].startimage_de = 'img/placeholder.png';
                }
              }
            }
            getProductVariations($scope.details.varianten);
          });
        }
      }

      //Load the varianten field for products
      function getProductVariations(uids) {
        if (uids === '') {
          getAwards($scope.details.designpreis); //Downloads awards then goes to accessories
        } else {
          //Initialize empty array
          $scope.productVariations = [];
          //Populate array
          DatabaseService.selectProducts(uids, function (results) {
            for (var x = 0; x < results.rows.length; x++) {
              $scope.productVariations.push(results.rows.item(x));
            }
            getAwards($scope.details.designpreis);
          });
        }
      }

      //Load the awards images
      function getAwards(award_ids) {
        if (award_ids === '') {
          getNotwendige($scope.details.b_artikel_id); //Downloads Notwendige then gets Emfolene
        } else {
          DatabaseService.selectAwards(award_ids, function (results) {
            for (var x = 0; x < results.rows.length; x++) {
              $scope.awards.push(results.rows.item(x));
            }
            if (!$rootScope.internet && $scope.productDownloaded) {
              $scope.awards[x].logo = localStorageService.getAwardPath($scope.details.uid, x);
            }
            getNotwendige($scope.details.b_artikel_id); //Downloads Notwendige then gets Emfolene
          });
        }
      }

      function getNotwendige(artikel_id) {
        $scope.notwendige = [];
        DatabaseService.selectAccessories(artikel_id, 0, function (results) {
          if (results.rows.length === 0) {
            getEmfolene(artikel_id); //Gets Emfolene then gets In Verbindung
          } else {
            var oder = {}; //Stores whether a product is "oder" or not
            for (var i = 0; i < results.rows.length; i++) {
              oder[results.rows.item(i).pos_b_artikel_id] = results.rows.item(i).verknuepfung == 1;
            }
            //The keys of oder are the b_artikel_ids we can use to query the products.
            var notwendige_ids = Object.keys(oder); //Keeps track of all the pos_b_artikel_ids;
            DatabaseService.selectProductsByBArtikelId(notwendige_ids, function (products) {
              for (var a = 0; a < products.rows.length; a++) {
                $scope.notwendige.push({product: products.rows.item(a), oder: oder[products.rows.item(a).b_artikel_id]});
              }
              getEmfolene(artikel_id); //Gets Emfolene then gets In Verbindung
            });
          }
        });
      }

      function getEmfolene(artikel_id) {
        $scope.emfolene = [];
        DatabaseService.selectAccessories(artikel_id, 1, function (results) {
          if (results.rows.length === 0) {
            getVerbindung(artikel_id); //Gets Verbindung then hides loading screen
          } else {
            var oder = {}; //Stores whether a product is "oder" or not
            for (var i = 0; i < results.rows.length; i++) {
              oder[results.rows.item(i).pos_b_artikel_id] = results.rows.item(i).verknuepfung == 1;
            }
            //The keys of oder are the b_artikel_ids we can use to query the products.
            var emfolene_ids = Object.keys(oder); //Keeps track of all the pos_b_artikel_ids;
            DatabaseService.selectProductsByBArtikelId(emfolene_ids, function (products) {
              for (var a = 0; a < products.rows.length; a++) {
                $scope.emfolene.push({product: products.rows.item(a), oder: oder[products.rows.item(a).b_artikel_id]});
              }
              getVerbindung(artikel_id); //Gets Verbindung then hides loading screen
            });
          }
        });
      }

      function getVerbindung(artikel_id) {
        $scope.verbindung = [];
        DatabaseService.selectAccessories(artikel_id, 2, function (results) {
          if (results.rows.length === 0) {
            $scope.hide();
          } else {
            var oder = {}; //Stores whether a product is "oder" or not
            for (var i = 0; i < results.rows.length; i++) {
              oder[results.rows.item(i).pos_b_artikel_id] = results.rows.item(i).verknuepfung == 1;
            }
            //The keys of oder are the b_artikel_ids we can use to query the products.
            var verbindung_ids = Object.keys(oder); //Keeps track of all the pos_b_artikel_ids;
            DatabaseService.selectProductsByBArtikelId(verbindung_ids, function (products) {
              for (var a = 0; a < products.rows.length; a++) {
                $scope.verbindung.push({product: products.rows.item(a), oder: oder[products.rows.item(a).b_artikel_id]});
              }
              $scope.hide();
            });
          }
        });
      }

      function downloadPDFFiles(pdfFiles) {
        if (pdfFiles.length == 0) {
          console.log('calling PDF Files');
          var videoImages = $scope.videos.slice();
          downloadVideoImage(videoImages);
        } else {
          console.log('calling PDF Files else');
          if (pdfFiles[0].datei_de == '' || pdfFiles[0].datei_de.substr(pdfFiles[0].datei_de.length - 3) == 'zip') {
            pdfFiles.shift();
            downloadPDFFiles(pdfFiles);
          } else {
            FileService.originalDownload(pdfFiles[0].datei_de, pdfFiles[0].uid.toString().concat('_booklet.pdf'), 'pdfs', function (path) {
              localStorageService.setPDFPath($scope.details.uid, path);
              pdfFiles.shift();
              downloadPDFFiles(pdfFiles);
            });
          }

        }
      }

      function downloadPDFImages(pdfFiles) {
        console.log('pdf files length', pdfFiles.length);
        if (pdfFiles.length == 0) {
          console.log('calling PDF Images');
          var filez = $scope.files.slice();
          downloadPDFFiles(filez);
        } else {
          console.log('calling else PDF Images');
          if (pdfFiles[0].thumbnail == '') {
            pdfFiles.shift();
            downloadPDFImages(pdfFiles);
          } else {
            //Check whether pdf or zip for PDF file
            switch (pdfFiles[0].thumbnail.substr(pdfFiles[0].thumbnail.length - 3)) {
              case 'jpg':
                FileService.originalDownload(pdfFiles[0].thumbnail, pdfFiles[0].uid.toString().concat('_thumbnail.jpg'), 'pdfs', function (path) {
                  localStorageService.setThumbnailPath($scope.details.uid, path);
                  pdfFiles.shift();
                  downloadPDFImages(pdfFiles);
                });
                break;

              case 'png':
                FileService.originalDownload(pdfFiles[0].thumbnail, pdfFiles[0].uid.toString().concat('_thumbnail.png'), 'pdfs', function (path) {
                  localStorageService.setThumbnailPath($scope.details.uid, path);
                  pdfFiles.shift();
                  downloadPDFImages(pdfFiles);
                });
                break;

              case 'gif':
                FileService.originalDownload(pdfFiles[0].thumbnail, pdfFiles[0].uid.toString().concat('_thumbnail.gif'), 'pdfs', function (path) {
                  localStorageService.setThumbnailPath($scope.details.uid, path);
                  pdfFiles.shift();
                  downloadPDFImages(pdfFiles);
                });
                break;
            }
          }

        }

      }

      function downloadAwards(awards) {
        if (awards.length == 0) {
          var pdfImages = $scope.files.slice();
          downloadPDFImages(pdfImages);
        } else {
          switch (awards[0].logo.substr(awards[0].logo.length - 3)) {
            case 'jpg':
              FileService.originalDownload(awards[0].logo, awards[0].titel.concat('_award.jpg'), 'awards', function (path) {
                localStorageService.setAwardPath($scope.details.uid, path);
                awards.shift();
                downloadAwards(awards);
              });
              break;

            case 'png':
              FileService.originalDownload(awards[0].logo, awards[0].titel.concat('_award.png'), 'awards', function (path) {
                localStorageService.setAwardPath($scope.details.uid, path);
                awards.shift();
                downloadAwards(awards);

              });
              break;

            case 'gif':
              FileService.originalDownload(awards[0].logo, awards[0].titel.concat('_award.gif'), 'awards', function (path) {
                localStorageService.setAwardPath($scope.details.uid, path);
                awards.shift();
                downloadAwards(awards);
              });
              break;
          }
        }

      }

      //Recursive functions to download videos and the corresponding thumbnail
      //This avoids Large queues for downloading Files
      function downloadVideoImage(videos) {
        if (videos.length == 0) {
          console.log('calling video images ');
          var video_files = $scope.videos.slice();
          downloadVideo(video_files);
        } else {
          console.log('calling video images  else');
          FileService.originalDownload(videos[0].startimage_de, videos[0].title.concat('_startimage.jpg'), 'videos', function (result) {
            localStorageService.setVideoImagePath(videos[0].uid, result);
            videos.shift();
            downloadVideoImage(videos);
          });
        }

      }

      function downloadVideo(videos) {
        if (videos.length == 0) {
          $scope.hide();
          $ionicPopup.alert({
            title: 'Downloads abgeschlossen'
          });
        } else {
          console.log('calling videos else');
          FileService.originalDownload(videos[0].videofile_de, videos[0].title.concat('_video.mp4'), 'videos', function (result) {
            localStorageService.setVideoPath(videos[0].uid, result);
            videos.shift();
            downloadVideo(videos);
          });
        }

      }

      function deleteFilePath(path) {
        if (path != '') {
          var filename = path.substr(path.lastIndexOf('/'), path.length - 1);
          path = path.replace(filename, "");
          FileService.deleteFile(path, filename.substr(1));
        }
      }

      //Load the product
      loadProduct();


      //Bookmark Function
      $scope.bookmark = function () {
        if (!localStorageService.bookmarkProduct($scope.details)) {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Artikel befindet sich bereits in der Merkliste.',
            cssClass: 'bookmark-popup',
            cancelText: 'Abbrechen',
            okText: 'Merkliste öffnen'
          });
          confirmPopup.then(function(res) {
            if(res) {
              $state.go('bookmark');
            } else {
              console.log('Still on product detail page');
            }
          });
        } else {
          $ionicPopup.alert({
            title: 'Seite bookmarkiert',
            cssClass: 'bookmark-popup'
          });
          $scope.bookmarked = true;
        }
      };

      //Download PDF
      $scope.showPDF = false;
      $scope.downloadPDF = function (file, index) {
        appDataService.checkInternet();
        if ($rootScope.internet) {
          $scope.pdfUrl = file.datei_de;
          console.log('pdf url', $scope.pdfUrl);
        } else {
          $scope.pdfUrl = localStorageService.getPDFPath($scope.details.uid, 'de', index);
          console.log('pdf url', $scope.pdfUrl);
        }
        $scope.showPDF = true;
        var options = {
          location: 'no',
          clearcache: 'yes',
          toolbar: 'yes',
          closebuttoncaption: 'Close',
          enableViewportScale: 'yes'
        };
        $cordovaInAppBrowser.open($scope.pdfUrl, '_blank',options);
      };

      $scope.listData = ([
          {
            title : 'TECHNISCHE ZEICHNUNG',
            show: false,
            hasData: function() {
              return typeof $scope.details.technical_drawing_link !== "undefined" && $scope.details.technical_drawing_link !== '';
            }
          },
          {
            title : 'LIEFERUMFANG',
            show: false,
            hasData: function () {
              return $scope.details.lieferumfang_de !== '';
            }
          },
          {
            title : 'EINSATZBEREICH / TECHNISCHE DATEN',
            show: false,
            hasData: function() {
              return $scope.details.einsatzbereich_de !== '';
            }
          },
          {
            title : 'DETAILS',
            show: false,
            hasData: function() {
              return $scope.details.werkstoff_de !== '';
            }
          },
          {
            title : 'DOWNLOADS',
            show: false,
            hasData: function() {
              return $scope.details.download_ids !== '';
            }
          },
          {
            title : 'VARIANTEN',
            show: false,
            hasData: function() {
              return $scope.details.varianten !== '';
            }
          },
          {
            title : 'EMPFOHLENE ZUGEHÖRIGE ARTIKEL',
            show: false,
            hasData: function() {
              return typeof $scope.emfolene !== "undefined" && $scope.emfolene.length > 0;
            }
          },
          {
            title : 'VIDEO',
            show: false,
            hasData: function() {
              return $scope.details.video_ids !== '';
            }
          },
          {
            title: 'VERBINDUNG',
            show: false,
            hasData: function() {
              return typeof $scope.verbindung !== "undefined" && $scope.verbindung.length > 0;
            }
          },
          {
            title: 'NOTWENDIGE ZUGEHÖRIGE ARTIKEL',
            show: false,
            hasData: function() {
              return typeof $scope.notwendige !== "undefined" && $scope.notwendige.length > 0;
            }
          }

      ]);

      //Function to download product
      $scope.downloadProduct = function () {
        if ($rootScope.internet && !$scope.productDownloaded) {
          var confirmPopup = $ionicPopup.confirm({
            title: 'Möchten Sie diesen Artikel offline speichern?',
            cssClass: 'download-popup',
            okText: 'Offline verfügbar machen',
            cancelText: 'Abbrechen'
          });
          confirmPopup.then(function(res) {
            if(res) {
              //Whether this product has been downloaded
              $scope.productDownloaded = true;
              $scope.showDownload();

              FileService.originalDownload($scope.details.image_landscape, $scope.details.nummer.concat('_landscape.png'), 'img', function (path) {
                localStorageService.setLandscapePath($scope.details.uid, path);

                FileService.originalDownload($scope.details.technical_drawing_link, $scope.details.nummer.concat('_technical_drawing.png'), 'img', function (path) {
                  localStorageService.setTechnicalPath($scope.details.uid, path);
                });
                var awards = $scope.awards.slice();
                downloadAwards(awards);
              });
            } else {
              console.log('Still on product detail page');
            }
          });
        } else if ($scope.productDownloaded) {
          var deletePopup = $ionicPopup.confirm({
            title: 'Bereits heruntergeladen,Würdest du gerne löschen?',
            cssClass: 'download-popup',
            okText: 'Daten löschen',
            cancelText: 'Abbrechen'
          });
          deletePopup.then(function (res) {
            if (res) {
              var landscape_path = localStorageService.getLandscapePath($scope.details.uid);
              deleteFilePath(landscape_path);
              var technical_path = localStorageService.getTechnicalPath($scope.details.uid);
              deleteFilePath(technical_path);
              for (var x = 0; x < $scope.awards.length; x++) {
                var award_path = localStorageService.getAwardPath($scope.details.uid, x);
                deleteFilePath(award_path);
              }
              for (var x = 0; x < $scope.files.length; x++) {
                var pdf_file_path = localStorageService.getPDFPath($scope.details.uid, 'de', x);
                deleteFilePath(pdf_file_path);
                var thumbnail_path = localStorageService.getThumbnailPath($scope.details.uid, x);
                deleteFilePath(thumbnail_path);
              }
              localStorageService.removeProduct($scope.details.uid);
              $scope.productDownloaded = localStorageService.productDownloaded($scope.details.uid);
            }
          });
        } else {
          $ionicPopup.alert({
            title: 'Download nicht möglich! Es besteht keine Insternetverbindung'
          });
        }
      };

      //return trusted external links
      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      };
      //Toggle collapsable list
      $scope.toggleGroup = function (group) {
        group.show = !group.show;
      };
      //Which product to show for collapsable list
      $scope.isGroupShown = function (group) {
        return group.show;
      };

      //Popover function
      $ionicPopover.fromTemplateUrl('templates/breadcrumb.html', {
        scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
        //Ensure popover is android
        document.body.classList.remove('platform-ios');
        document.body.classList.add('platform-android');
      });

      $scope.sendEmail = function () {
        var link = $scope.details.permalink;
        var number = '';
        var nummerString = $scope.details.nummer.toString();

        for (var i = 0; i < nummerString.length; i++) {
          if (i == 2 || i == 5 || i == 7 || i == 9) {
            number = number.concat(" " + nummerString[i]);

          } else {
            number = number.concat(nummerString[i]);
          }
        }

        var bodyText = "Dieser Artikel wurde Ihnen empfohlen: \n\n" +
          "Bestellnummer: " + number
          + "\n" + $scope.details.produktbezeichnung_de +
          "\n\n Link zum Produkt: \n" + link +
          "\n\n\nKennen Sie schon die SCHELL App?" +
          "\nAlle Produkte auf Ihrem Smartphone oder Tablet jetzt im App Store verfügbar.";



        if(window.plugins && window.plugins.emailComposer) {
          window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
            console.log("Response -> " + result);
          },
          "SCHELL Artikel " + number, // Subject
          bodyText,                      // Body
          [" "],    // To
          null,                    // CC
          null,                    // BCC
          false,                   // isHTML
          null,                    // Attachments
          null);                   // Attachment Data
        }else{
          console.log('could not open');
        }
      };

      //For the varianten field, we want to select Product variations
      $scope.selectProductVariations = function (product_id) {
        DatabaseService.selectProducts(product_id, function (results) {
          appDataService.setCurrentProduct(results.rows.item(0));
          var pop = appDataService.getCurrentCategoryIds();
          appDataService.removeNavigatedCategory();
          appDataService.setCurrentCategoryIds(results.rows.item(0).uid);
          appDataService.addNavigatedCategory(results.rows.item(0).nummer);
          $state.reload();
        });
      };

      // Product Image Modal
      $ionicModal.fromTemplateUrl('product-image.html', {
        id: '1', // We need to use an ID to identify the modal that is firing the event!
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal1 = modal;
      });

      // Technical Drawing Modal
      $ionicModal.fromTemplateUrl('technical-drawing.html', {
        id: '2', // We need to use an ID to identify the modal that is firing the event!
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal2 = modal;
      });

      $scope.openModal = function (index) {
        if (index == 1) $scope.modal1.show();
        else $scope.modal2.show();
      };

      $scope.closeModal = function (index) {
        if (index == 1) $scope.modal1.hide();
        else $scope.modal2.hide();
      };

      // Listen for broadcasted messages

      $scope.$on('modal.shown', function (event, modal) {
        console.log('Modal ' + modal.id + ' is shown!');
      });

      $scope.$on('modal.hidden', function (event, modal) {
        console.log('Modal ' + modal.id + ' is hidden!');
      });

}])

  .controller('productLinesCtrl', ['$scope', '$state', '$rootScope', '$ionicLoading', '$ionicHistory', '$ionicFilterBar', 'localStorageService', 'FileService', 'DatabaseService', 'appDataService', '$ionicPopover',
    function ($scope, $state, $rootScope, $ionicLoading, $ionicHistory, $ionicFilterBar, localStorageService, FileService, DatabaseService, appDataService, $ionicPopover) {

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      //Kinda hacky way to make sure filters stay current
      if (toState.name === 'product_lines') {
        //Get the filter ids for current category
        var filter_ids = appDataService.getCurrentSelectedFilterIds();
        //Apply the filter
        applyFilter(filter_ids);
      }
    });
    //Set the titles and initialize empty array of filters
    $scope.filter_ids = appDataService.getFilterIds();

      $scope.goState = function (index, length) {
        //Have to pop the until we reach the index the user has selected
        for (var i = length - 1; i > index; i--) {
          appDataService.removeNavigatedCategory();
          appDataService.getCurrentCategoryIds();
        }

        switch (index) {
        case 0:
          $state.go('products');
          break;

          case length - 1:
          break;

        default:
          $state.reload();
          break;
      }
    };

      $scope.arrowStyle = function (index, length) {
        var indent = 18 * index;
        if (index == length - 1) {
          return {'text-indent': indent + 'px', 'background-color': '#000000'};
        } else {
          return {'text-indent': indent + 'px'};
        }
      };

      //History function
      var goback = $scope.$on('go-back', function () {
        appDataService.removeNavigatedCategory();
        var child_ids = appDataService.getCurrentCategoryIds();
        if (appDataService.checkCurrentCategoryIds() == '') {
          $state.go('products');
        } else {
          $scope.$emit('updateFilters');
          $state.reload();
        }
      });

      $scope.$on('$destroy', goback);

    //Loading functions
    $scope.show = function() {
      $ionicLoading.show({
        template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop: true
      });
    };

      //Hide function
      $scope.hide = function () {
        $ionicLoading.hide();
      };


      //Function to download Image file
      function downloadImage(uid, url, filename) {
        FileService.originalDownload(url, filename, 'imgs', function (path) {
          localStorageService.setBildPath(uid, path);
        });
      }


    //Load SubCategories from database
    function loadSubCategories(child_ids) {
      //Initialize as empty
      $scope.categories = [];
      //Set title
      $scope.title = appDataService.checkCurrentCategory();

      $scope.show();
      //Check for internet
      appDataService.checkInternet();

      //Whether to a product is bookmarked
      $scope.showBookmark = false;

      //Once there are products bookmarked
      if (localStorageService.getBookmarkedProducts().length > 0) {
        $scope.showBookmark = true;
      }

      //Load the child ids from db
      DatabaseService.selectChildCategories(child_ids,function (categories) {
        for(var x = 0; x < categories.rows.length; x++){
          $scope.categories.push(categories.rows.item(x));
          //Grab the images or load them in offline mode
          var uid = $scope.categories[x].uid;
          if ($scope.categories[x].bild != '') {
            if (!$rootScope.internet) {
              if (localStorageService.categoryDownloaded(uid)) {
                $scope.categories[x].bild = localStorageService.getBildPath(uid);
              } else {
                $scope.categories[x].bild = 'img/placeholder.png';
              }
            } else if ($rootScope.internet) {
              downloadImage(uid, $scope.categories[x].bild, $scope.categories[x].title_de.concat('_bild.png'));
            }
          }
        }
        $scope.hide();
      }, function (error) {
        //Handle error
        console.log('ERROR',error);
      });
    }


    $scope.counts = {};

    //Function to apply the filter
    function applyFilter(applied_filters) {

      if (Object.keys($scope.counts).length === 0) {
        $scope.counts = localStorageService.getProductCounts();
      }

      function getBottomLevelCategoriesHelper(category, allCategories) {
        if (category.product_ids != '') {
          return [category];
        } else {
          var categories = [];
          var childCategories = allCategories.filter(function (cat) {
            return cat.elternelement == category.uid;
          });
          childCategories.forEach(function (childCategory) {
            categories = categories.concat(getBottomLevelCategoriesHelper(childCategory, allCategories));
          });

          return categories;
        }
      }

      // If no filters applied or category has no filters, then just add products
      if (applied_filters.length === 0 || $scope.filter_ids === '') {
        $scope.showFilter = false;
        $scope.counts = localStorageService.getProductCounts();
        $scope.hide();
      } else {
        $scope.show();

        //Get all categories
        var allCategories = [];
        DatabaseService.selectAllCategories(function (results) {
          for (var x = 0; x < results.rows.length; x++) {
            allCategories.push(results.rows.item(x));
          }

          //Get all product ids from bottom level categories.
          var categoriesWithAllProductIds = {};
          $scope.categories.forEach(function (scopedCategory) {
            var bottomLevelCategories = getBottomLevelCategoriesHelper(scopedCategory, allCategories);
            categoriesWithAllProductIds[scopedCategory.uid] = [];
            bottomLevelCategories.forEach(function(bottomLevelCategory){
              categoriesWithAllProductIds[scopedCategory.uid] = categoriesWithAllProductIds[scopedCategory.uid].concat(bottomLevelCategory.product_ids.split(','));
            });
          });

          function getAllCategoryCounts(catsWithProducts, counts, totalFiltered, totalProducts) {
            if (Object.keys(catsWithProducts).length === 0) {
              $scope.counts = counts;
              $scope.total_filter = totalFiltered;
              $scope.total_products = totalProducts;
              $scope.showFilter = true;
              $scope.hide();
            } else {
              $scope.showFilter = false;
              var categoryToCount = Object.keys(catsWithProducts)[0];
              var product_ids = catsWithProducts[categoryToCount];
              var products = [];
              DatabaseService.selectProducts(product_ids, function(results) {
                for (var x = 0; x < results.rows.length; x++) {
                  products.push(results.rows.item(x));
                }
                var filteredProducts = products.slice();
                //Loop over filters
                applied_filters.forEach(function (filter) {
                  //Filter the products
                  filteredProducts = filteredProducts.filter(function (product) {
                    return product.filter_ids.split(',').indexOf(filter) !== -1;
                  });
                });
                counts[categoryToCount] = filteredProducts.length;

                //Add them up
                totalFiltered += filteredProducts.length;
                totalProducts += products.length;

                delete catsWithProducts[categoryToCount];
                getAllCategoryCounts(catsWithProducts, counts, totalFiltered, totalProducts);
              });
            }
          }

          var counts = Object.assign({}, $scope.counts);
          getAllCategoryCounts(categoriesWithAllProductIds, counts, 0, 0);
        });
      }
    }


    //Get the correct childIds and then load them from database
    var child_ids = appDataService.checkCurrentCategoryIds();

    loadSubCategories(child_ids);


    //Popover function
    $ionicPopover.fromTemplateUrl('templates/breadcrumb.html', {
      scope: $scope
    }).then(function (popover) {
      $scope.popover = popover;
      //Ensure popover is android
      document.body.classList.remove('platform-ios');
      document.body.classList.add('platform-android');
    });


    //Child choice
    $scope.choice = function (child_ids, title) {
      //If user chooses something with child ids
      appDataService.addNavigatedCategory(title);
      //Set the current category Ids
      appDataService.setCurrentCategoryIds(child_ids);
      $scope.$emit('updateFilters');
      $state.reload();
    };

    //Product Choice
    $scope.choice_product = function (product_ids, title, category_id) {
      // If user chooses something with product_ids
      appDataService.setCurrentCategoryIds(product_ids);
      appDataService.addNavigatedCategory(title);
      $state.go('product_overview');
    };

    $scope.myEvent = function () {
      $state.go('start-screen');
    };

    //When user selects new filter
    $scope.$on('new-filter-uid', function () {
      //Get the filter ids for current category
      var filter_ids = appDataService.getCurrentSelectedFilterIds();
      //Apply the filter
      applyFilter(filter_ids);
    });

}])

  .controller('bookmarkCtrl', ['$scope', '$rootScope', '$state', '$ionicPopup', '$ionicHistory', '$ionicSideMenuDelegate', 'localStorageService', 'appDataService', 'FirebaseService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $rootScope, $state, $ionicPopup, $ionicHistory, $ionicSideMenuDelegate, localStorageService, appDataService, FirebaseService) {

      //Side Menu
      $ionicSideMenuDelegate.canDragContent(false);

      //History function
      $scope.$on('go-back', function () {
        $ionicHistory.goBack();
      });

      //Add Home as default
      appDataService.addNavigatedCategory('PRODUKTE');
      //Add search to navigated categories.
      appDataService.addNavigatedCategory('MERKZETTEL');

      //Check to see if any bookmark products should be removed.
      appDataService.checkInternet();
      if ($rootScope.internet) {
        FirebaseService.checkBookmark(localStorageService.getBookmarkedProducts());
      }


      //Download bookmarks
      $scope.bookmarks = localStorageService.getBookmarkedProducts();

    if($scope.bookmarks == null){
      $ionicPopup.alert({
        title: 'No Artikels'
      });
    }

      $scope.goBack = function () {
        $ionicHistory.goBack();
      };

    $scope.showDetails = function (product) {
      appDataService.setCurrentProduct(product);
      appDataService.addNavigatedCategory(product.nummer);
      $state.go('detailPage');
    };


    $scope.deleteBookmark = function (bookmark) {
      localStorageService.removeBookmarkedProduct(bookmark);
      $ionicPopup.alert({
        title: 'Artikel wurde entfernt'
      });
      $state.reload();
    };
}])

  .controller('offlineStorageCtrl', ['$scope', '$rootScope', '$ionicLoading', '$ionicHistory', 'FirebaseService', 'localStorageService', 'DatabaseService', 'FileService', '$ionicSideMenuDelegate', '$ionicPopup',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $rootScope, $ionicLoading, $ionicHistory, FirebaseService, localStorageService, DatabaseService, FileService, $ionicSideMenuDelegate, $ionicPopup) {

      //History function
      $scope.$on('go-back', function () {
        var confirmPopup = $ionicPopup.confirm({
          template: 'Möchten Sie Ihre Einstellungen speichern?',
          cancelText: 'Nein',
          okText: 'Ja'
        });
        confirmPopup.then(function (res) {
          if (res) {
            saveSettings();
          }
          $ionicHistory.goBack();
        });
      });

      //Disable Side Menu
    $ionicSideMenuDelegate.canDragContent(false);


    //Video File size
    $scope.total_video_size = 0;

    //Initialize as empty
    $scope.videos = [];
    $scope.counts = localStorageService.getProductCounts();

    //Preferences as empty
    $scope.preferences = [];

    //Category file sizes
    $scope.fileSizes = {};

      //Set totals for downloading files
      $scope.$on('$ionicView.afterEnter', function () {
        //Set Total file size to zero
        $rootScope.total = 0;
        $rootScope.loaded = 0;
      });

    //Loading functions
    $scope.show = function() {
      $ionicLoading.show({
        template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop:true
      });
    };

    //Hide function
    $scope.hide = function(){
      $ionicLoading.hide();
    };


      $scope.goBack = function () {
        $ionicHistory.goBack();
      };

      //Function to get today's date
      function getDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
          dd = '0' + dd
        }

        if (mm < 10) {
          mm = '0' + mm
        }
        today = dd + '/' + mm + '/' + yyyy;
        return today;
      }

      //Function to load the data on the screen
    function loadData() {
      //Initiate load
      $scope.show();

      DatabaseService.selectAllVideos(function (videos) {
        var mbTotal = 0;
        for (var x = 0; x < videos.rows.length; x++) {
          $scope.videos.push(videos.rows.item(x));
          mbTotal += videos.rows.item(x).filesize;
        }
        $scope.total_video_size = mbTotal / 1073741824;
      });
      //Assign preferences
      $scope.preferences = localStorageService.getOfflinePreferences();
      //Product Categories
      var items = [];
      DatabaseService.selectTopCategories(function (categories) {
        for(var x = 0; x < categories.rows.length; x++){
          items.push(categories.rows.item(x));
        }
        //Compare against local storage and most recent update of storage to remember what user checked
        if ($scope.preferences[2].downloaded_categories.length < items.length) {
          for (var i = 0; i < items.length; i++) {
            //Check for empty categories
            $scope.preferences[2].downloaded_categories.push({item: items[i], checked: false});
          }
        }
        //Calculate category file sizes
        items.forEach(function (category) {
          sumFileSizes(category);
        });
      }, function (error) {
        //#TODO:Handle error
        console.log('ERROR',error);
      });


      //Update to show selected categories
      localStorageService.updatePreferences($scope.preferences);
    }

    //Sum FileSizes
    function sumFileSizes(category) {
      //Array of download ids for this specific category,
      // to be calculated to avoid repetitions
      var download_ids = [];
      //Array of video_ids for this specific category
      var video_ids = [];
      //Bottom level categories
      var bottomLevelCategories = [];
      //Initialize array to store all categories
      var allCategories = [];
      //Initialize empty array of product ids
      var product_ids = [];


      //Retrieve all of the bottom level categories
      function helper(category, allCategories) {
        if (category.product_ids != '') {
          return [category];
        } else {

          var categories = [];

          var childCategories = allCategories.filter(function (cat) {
            return cat.elternelement == category.uid;
          });
          childCategories.forEach(function (childCategory) {
            categories = categories.concat(helper(childCategory, allCategories));
          });

          return categories;
        }
      }

      DatabaseService.selectAllCategories(function (results) {
        for (var x = 0; x < results.rows.length; x++) {
          allCategories.push(results.rows.item(x));
        }

        bottomLevelCategories = helper(category, allCategories);

        bottomLevelCategories.forEach(function(bottomLevelCategory) {
          if (bottomLevelCategory.download_ids !== '') {
            //We get all of the category downloads...
            download_ids = download_ids.concat(bottomLevelCategory.download_ids.split(','));
          }
          //Get all the products...
          product_ids = product_ids.concat(bottomLevelCategory.product_ids.split(','));
        });

        // Go through all the products and get their downloads, videos and filesizes
        var filesize = 0;
        DatabaseService.selectProducts(product_ids, function(results) {
          for (var x = 0; x < results.rows.length; x++) {
            filesize += results.rows.item(x).technical_drawing_filesize;
            filesize += results.rows.item(x).image_landscape_filesize;
            filesize += results.rows.item(x).image_portrait_filesize;
            if (results.rows.item(x).video_ids !== '') {
              video_ids = video_ids.concat(results.rows.item(x).video_ids.split(','));
            }
            if (results.rows.item(x).download_ids !== '') {
              download_ids = download_ids.concat(results.rows.item(x).download_ids.split(','));
            }
          }
          // Now we have all downloads and videos, we can download them and sum filesizes.
          DatabaseService.selectDownloads(download_ids, function(results) {
            for (var x = 0; x < results.rows.length; x++) {
              filesize += results.rows.item(x).filesize;
            }
            if (video_ids.length > 0) {
              DatabaseService.selectVideos(video_ids, function (results) {
                for (var x = 0; x < results.rows.length; x++) {
                  filesize += results.rows.item(x).filesize;
                }
                $scope.fileSizes[category.uid] = filesize;
                $scope.hide();
              });
            } else {
              $scope.fileSizes[category.uid] = filesize;
              $scope.hide();
            }
          });
        });

      });
    }


    //Download the files for the respective category and store the file paths in local storage
    function downloadCategoryFiles(category) {
      //Actual products to download
      $scope.products = [];
      //Product ids to download
      var product_ids_toDownload = [];
      //All categories
      var allCategories = [];
      //Categories have download ids
      var categoryDownloadIds = [];
      //First current category
      DatabaseService.selectAllCategories(function (results) {
        for (var x = 0; x < results.rows.length; x++) {
          allCategories.push(results.rows.item(x));
        }
        //to See if we are at the bottom level
        var atBottomLevel = false;
        //SubCategories
        var currentCategories = [category];
        while (!atBottomLevel) {
          var tempCurrentCategories = currentCategories.slice();
          currentCategories = [];
          // 2. get all the subcategories of [{category..}]
          tempCurrentCategories.forEach(function (temp) {
            allCategories.forEach(function (cat) {
              if (cat.elternelement == temp.uid) {
                currentCategories.push(cat);
              }
            });
          });
          atBottomLevel = true;
          // 3. if the first subcategory has product_ids
          currentCategories.forEach(function (currentCat) {
            //Some categories may have two levels of sub categories
            // and so we also have to traverse that branch
            if (currentCat.product_ids != '') {
              product_ids_toDownload = product_ids_toDownload.concat(currentCat.product_ids.split(','));
              if (currentCat.download_ids != '') {
                categoryDownloadIds = categoryDownloadIds.concat(currentCat.download_ids.split(','));
              }
            }
            atBottomLevel = atBottomLevel && currentCat.product_ids != '';
          });
          //Filter out sub categories with product ids
          // and traverse next branch
          currentCategories.filter(function (currentCat) {
            return currentCat.product_ids != '';
          });

        }
        //Categories with respective product_ids
        currentCategories.forEach(function (categoryWithProductIds) {
          product_ids_toDownload = product_ids_toDownload.concat(categoryWithProductIds.product_ids.split(','));
        });

        //Get the products with the info to download
        DatabaseService.selectProducts(product_ids_toDownload, function (results) {
          for (var x = 0; x < results.rows.length; x++) {
            $scope.products.push(results.rows.item(x));
          }
          //Total video sizes
          $rootScope.total += ($scope.products.length - 1);
          downloadProducts();
        });
      });
    }

    //Call the function on startup
    loadData();

      //These functions
      function downloadProducts() {
        //These variables should be made empty on each iteration to avoid
        //Repeat downloads for the same product
        $scope.awards = [];
        $scope.files = [];
        $scope.individual_videos = [];


        if ($scope.products.length > 0) {
          console.log('downloading products');
          getAwards($scope.products[0]);
        }
      }

      function getAwards(product) {
        console.log('getting awards');
        if (product.designpreis != '') {
          DatabaseService.selectAwards(product.designpreis, function (results) {
            for (var x = 0; x < results.rows.length; x++) {
              $scope.awards.push(results.rows.item(x));
            }
            getFiles(product);
          });
        } else {
          getFiles(product);
        }
      }

      function getFiles(product) {
        if (product.download_ids != '') {
          DatabaseService.selectDownloads(product.download_ids, function (results) {
            for (var x = 0; x < results.rows.length; x++) {
              $scope.files.push(results.rows.item(x));
              console.log('getting files');
            }
            getVideos(product);
          });
        } else {
          getVideos(product);
        }
      }

      function getVideos(product) {
        console.log('getting videos');
        if (product.video_ids != '') {
          DatabaseService.selectVideos(product.video_ids, function (results) {
            for (var x = 0; x < results.rows.length; x++) {
              console.log('pushing video id');
              console.log(results.rows.item(x).uid);
              $scope.individual_videos.push(results.rows.item(x));
            }
            getLandscapeFile(product);
          });
        } else {
          getLandscapeFile(product);
        }
      }

      function getLandscapeFile(product) {
        FileService.originalDownload(product.image_landscape, product.nummer.concat('_landscape.png'), 'img', function (path) {
          localStorageService.setLandscapePath(product.uid, path);
          getPortraitFile(product);
        });
      }

      function getPortraitFile(product) {
        FileService.originalDownload(product.image_portrait, product.nummer.concat('_portrait.png'), 'img', function (path) {
          localStorageService.setPortraitPath(product.uid, path);
          getTechnicalFile(product);
        });
      }

      function getTechnicalFile(product) {
        if (product.technical_drawing_link != '') {
          FileService.originalDownload(product.technical_drawing_link, product.nummer.concat('_technical_drawing.png'), 'img', function (path) {
            localStorageService.setTechnicalPath(product.uid, path);
            downloadAwards($scope.awards, product.uid);
          });
        } else {
          downloadAwards($scope.awards, product.uid);
        }
      }

      function downloadAwards(awards, uid) {
        if (awards.length == 0) {
          var pdfImages = $scope.files.slice();
          downloadPDFImages(pdfImages, uid);
        } else {
          switch (awards[0].logo.substr(awards[0].logo.length - 3)) {
            case 'jpg':
              FileService.originalDownload(awards[0].logo, awards[0].titel.concat('_award.jpg'), 'awards', function (path) {
                localStorageService.setAwardPath(uid, path);
                awards.shift();
                downloadAwards(awards, uid);
              });
              break;

            case 'png':
              FileService.originalDownload(awards[0].logo, awards[0].titel.concat('_award.png'), 'awards', function (path) {
                localStorageService.setAwardPath(uid, path);
                awards.shift();
                downloadAwards(awards, uid);
              });
              break;

            case 'gif':
              FileService.originalDownload(awards[0].logo, awards[0].titel.concat('_award.gif'), 'awards', function (path) {
                localStorageService.setAwardPath(uid, path);
                awards.shift();
                downloadAwards(awards, uid);
              });
              break;
          }
        }

      }

      function downloadPDFImages(pdfFiles, uid) {
        console.log('pdf files length', pdfFiles.length);
        if (pdfFiles.length == 0) {
          console.log('calling PDF Images');
          var filez = $scope.files.slice();
          downloadPDFFiles(filez, uid);
        } else {
          console.log('calling else PDF Images');
          if (pdfFiles[0].thumbnail == '') {
            pdfFiles.shift();
            downloadPDFImages(pdfFiles, uid);
          } else {
            //Check whether pdf or zip for PDF file
            switch (pdfFiles[0].thumbnail.substr(pdfFiles[0].thumbnail.length - 3)) {
              case 'jpg':
                FileService.originalDownload(pdfFiles[0].thumbnail, pdfFiles[0].uid.toString().concat('_thumbnail.jpg'), 'pdfs', function (path) {
                  localStorageService.setThumbnailPath(uid, path);
                  pdfFiles.shift();
                  downloadPDFImages(pdfFiles, uid);
                });
                break;

              case 'png':
                FileService.originalDownload(pdfFiles[0].thumbnail, pdfFiles[0].uid.toString().concat('_thumbnail.png'), 'pdfs', function (path) {
                  localStorageService.setThumbnailPath(uid, path);
                  pdfFiles.shift();
                  downloadPDFImages(pdfFiles, uid);
                });
                break;

              case 'gif':
                FileService.originalDownload(pdfFiles[0].thumbnail, pdfFiles[0].uid.toString().concat('_thumbnail.gif'), 'pdfs', function (path) {
                  localStorageService.setThumbnailPath(uid, path);
                  pdfFiles.shift();
                  downloadPDFImages(pdfFiles, uid);
                });
                break;
            }
          }

        }

      }

      function downloadPDFFiles(pdfFiles, uid) {
        if (pdfFiles.length == 0) {
          console.log('calling PDF Files');
          var videoImages = $scope.individual_videos.slice();
          downloadSingleVideoImage(videoImages);
        } else {
          console.log('calling PDF Files else');
          if (pdfFiles[0].datei_de == '' || pdfFiles[0].datei_de.substr(pdfFiles[0].datei_de.length - 3) == 'zip') {
            pdfFiles.shift();
            downloadPDFFiles(pdfFiles, uid);
          } else {
            FileService.originalDownload(pdfFiles[0].datei_de, pdfFiles[0].uid.toString().concat('_booklet.pdf'), 'pdfs', function (path) {
              localStorageService.setPDFPath(uid, path);
              pdfFiles.shift();
              downloadPDFFiles(pdfFiles, uid);
            });
          }

        }
      }

      //This seperate function is for downloading individual videos...
      //When a user selects download categories, this is distinct from
      //when a user downloads mass videos
      //This avoids Large queues for downloading Files
      function downloadSingleVideoImage(videos) {
        if (videos.length == 0) {
          console.log('calling single video images ');
          var video_files = $scope.individual_videos.slice();
          downloadVideo(video_files);
        } else {
          console.log('calling video images  else');
          FileService.originalDownload(videos[0].startimage_de, videos[0].title.concat('_startimage.jpg'), 'videos', function (result) {
            localStorageService.setVideoImagePath(videos[0].uid, result);
            videos.shift();
            downloadSingleVideoImage(videos);
          });
        }

      }


      //Recursive functions to download videos and the corresponding thumbnail
      //This avoids Large queues for downloading Files
      function downloadVideoImage(videos) {
        if (videos.length == 0) {
          console.log('calling video images ');
          var video_files = $scope.videos.slice();
          downloadVideo(video_files);
        } else {
          console.log('calling video images  else');
          FileService.originalDownload(videos[0].startimage_de, videos[0].title.concat('_startimage.jpg'), 'videos', function (result) {
            localStorageService.setVideoImagePath(videos[0].uid, result);
            videos.shift();
            downloadVideoImage(videos);
          });
        }

      }

      function downloadVideo(videos) {
        if (videos.length > 0) {
          FileService.originalDownload(videos[0].videofile_de, videos[0].title.concat('_video.mp4'), 'videos', function (result) {
            localStorageService.setVideoPath(videos[0].uid, result);
            videos.shift();
            downloadVideo(videos);
          });
        } else {
          //Add amount loaded
          console.log('file downloaded');
          $rootScope.loaded += 1;
          $scope.products.shift();
          downloadProducts();
        }
      }


    //Function to download videos
      function downloadVideos() {
      //If checked
      if ($scope.preferences[3].download_videos) {
        console.log('checked');
        $rootScope.total += $scope.videos.length;
        $scope.preferences[4].last_updated = getDate();
        var images = $scope.videos.slice();
        downloadVideoImage(images);
        localStorageService.updatePreferences($scope.preferences);
      } else {
        localStorageService.updatePreferences($scope.preferences);
      }
      }

    //Check to download selected category
      function downloadCategory() {
        for (var x = 0; x < $scope.preferences[2].downloaded_categories.length; x++) {
          //Download details based on check
          if ($scope.preferences[2].downloaded_categories[x].checked == true) {
            console.log('category checked', $scope.preferences[2].downloaded_categories[x].item.title_de);
            //Update preferences
            $scope.preferences[4].last_updated = getDate();
            //The product ids to download
            downloadCategoryFiles($scope.preferences[2].downloaded_categories[x].item);
          }
          //Update preference at selected preference
          localStorageService.updatePreferences($scope.preferences);
      }
      }

      function saveSettings() {
        //Preparing for Download
        $ionicLoading.show({
          template: '<p>Anwendung...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
        //Set the video file size and Re-multiply to get accurate byte size
        $rootScope.showDownload = true;
        downloadVideos();
        downloadCategory();
      }


    //#TODO: Check if product info updated

    //To refresh the page
    $scope.doRefresh = function() {
      if($scope.preferences[0].checked == true) {
        $ionicPopup.alert({
            title: 'Bitte aktivieren Sie die Offline-Synchronisation'
        });
      }else {
        $scope.show();
        loadData();
        $scope.hide();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      }
    };


    //Update preferences
    $scope.update = function () {
      localStorageService.updatePreferences($scope.preferences);
    };


  }])

  .controller('regionCtrl', ['$scope', '$rootScope', '$ionicSideMenuDelegate', '$ionicHistory', '$ionicPopup', '$ionicLoading', 'localStorageService', 'FirebaseService', 'DatabaseService', 'appDataService', 'FileService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $rootScope, $ionicSideMenuDelegate, $ionicHistory, $ionicPopup, $ionicLoading, localStorageService, FirebaseService, DatabaseService, appDataService, FileService) {
      //Side Menu deactivated
      $ionicSideMenuDelegate.canDragContent(false);

      //History function
      $scope.$on('go-back', function () {
        $ionicHistory.goBack();
      });

      //Set the country
      $scope.country = localStorageService.getCountry();

      //Update selected Country
      $scope.selectCountry = function (country) {
        if (country != $scope.country) {
          $ionicPopup.confirm({
            title: 'ACHTUNG!',
            template: 'Alle persönlichen Einstellungen (Merkzettel, Offline gesicherte Artikel) müssen nach Veränderung der Länderversion erneut geladen werden.',
            cancelText: 'Abbrechen',
            okText: 'Akzeptieren'
          }).then(function(res) {
            if (res) {
              appDataService.checkInternet();
              if ($rootScope.internet) {
                $scope.country = country;
                localStorageService.setCountry(country);
                reloadData();
              } else {
                //NO internet!
              }
            }
          });
        }
      };

      $scope.goBack = function () {
        $ionicHistory.goBack();
      };

      $scope.showLoad = function () {
        $ionicLoading.show({
          template: '<p>Suche nach Updates...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
      };

      $scope.hideLoad = function () {
        $ionicLoading.hide();
      };

      //Helper function to cache slider images
      function downloadImages(number, url, fileName, dirName) {
        FileService.originalDownload(url, fileName, dirName, function (path) {
          localStorageService.setCarouselPath(number, path);
        });
      }

      function reloadData() {
        $scope.showLoad();
        FileService.deleteDirectory('imgs', function() {
          var url = 'http://www.schell.eu/fileadmin/app/slider/slider';
          for (var i = 1; i < 5; i++) {
            downloadImages(i, url.concat(i + '.png'), 'slider'.concat(i + '.png'), 'imgs');
          }
        });
        FileService.deleteDirectory('pdfs');
        FileService.deleteDirectory('videos');
        FileService.deleteDirectory('awards');
        DatabaseService.clearDatabase();
        DatabaseService.createTables();
        var country = localStorageService.getCountry();
        FirebaseService.downloadAllProducts(function (results) {
          DatabaseService.populateProducts(results, country, function() {
            FirebaseService.getAllProductCategories(function (results) {
              DatabaseService.populateProductCategories(results, country, function() {
                var allCats = [];
                var topCats = [];
                var allProducts = [];
                DatabaseService.selectTopCategories(function (topCategories) {
                  for (var x = 0; x < topCategories.rows.length; x++) {
                    topCats.push(topCategories.rows.item(x));
                  }
                  DatabaseService.selectAllCategories(function (allCategories) {
                    for (var z = 0; z < allCategories.rows.length; z++) {
                      allCats.push(allCategories.rows.item(z));
                    }
                    DatabaseService.selectAllProducts(function(productResults) {
                      for (var y = 0; y < productResults.rows.length; y++) {
                        allProducts.push(productResults.rows.item(y));
                      }
                      topCats.forEach(function (topCategory) {
                        var count = countArtikelProduct(topCategory, allCats, allProducts);
                        localStorageService.setProductCount(topCategory.uid, count);
                      });
                    });
                  });
                });
              });
            });
          });
        });
        localStorageService.resetPreferences();
        localStorageService.resetBookmarks();
        FirebaseService.downloadFiles(function (results) {
          DatabaseService.populateDownloads(results);
        });
        FirebaseService.downloadVideos(function (results) {
          DatabaseService.populateVideos(results);
        });
        FirebaseService.downloadVideoCategories(function (results) {
          DatabaseService.populateVideoCategories(results);
        });
        FirebaseService.downloadAwards(function (results) {
          DatabaseService.populateAwards(results);
        });
        FirebaseService.downloadZubehoer(function (results) {
          DatabaseService.populateZubehoer(results);
        });
        FirebaseService.downloadProductFilters(function (results) {
          localStorageService.setFilters(results);
          $scope.hideLoad();
          //If internet grab those images
        });

        // Count Artikels
        countArtikelProduct = function (category, allCategories, products) {
          if (category.child_ids == '') {
            var product_ids = category.product_ids.split(',');
            product_ids = product_ids.filter(function(product_id) {
              var productInDatabase = false;
              products.forEach(function(product) {
                if (parseInt(product_id) == product.uid) {
                  productInDatabase = true;
                }
              });
              return productInDatabase;
            });
            localStorageService.setProductCount(category.uid, product_ids.length);
            return product_ids.length;
          } else {
            var count = 0;
            var childCategories = allCategories.filter(function (cat) {
              return cat.elternelement == category.uid;
            });
            childCategories.forEach(function (childCategory) {
              count += countArtikelProduct(childCategory, allCategories, products);
            });
            localStorageService.setProductCount(category.uid, count);
            return count;
          }
        };
        localStorageService.setLastUpdated(Date.now());
      }
}])

  .controller('searchPageCtrl', ['$scope', '$rootScope', '$state', '$ionicLoading', '$ionicFilterBar', '$ionicHistory', 'DatabaseService', 'appDataService', 'localStorageService',
    function ($scope, $rootScope, $state, $ionicLoading, $ionicFilterBar, $ionicHistory, DatabaseService, appDataService, localStorageService) {

    //Initalize products
    $scope.products = [];
    $scope.searchText = '';


    //Whether filter has been activated.
    $scope.showFilter = false;

    //When navigating here just clear the categories
    $scope.$on('$ionicView.afterEnter', function () {
      appDataService.clearNavigatedCategories();
      //Add Home as default
      appDataService.addNavigatedCategory('PRODUKTE');
      //Add search to navigated categories.
      appDataService.addNavigatedCategory('SUCHE');

    });
      //Loading functions
      $scope.show = function () {
        $ionicLoading.show({
          template: '<p>Loading Product information...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
      };
      $scope.hide = function () {
        $ionicLoading.hide();
      };

      $scope.search = function (event) {
        if (event.keyCode == 13) {
          $scope.products = [];
          $scope.showFilter = true;
          cordova.plugins.Keyboard.close();
          $scope.show();
          appDataService.checkInternet();
          DatabaseService.searchProducts(event.target.value, function (results) {
            for (var x = 0; x < results.rows.length; x++) {
              //Remove SCHELL from title
              var product = results.rows.item(x);
              if (product.produktbezeichnung_de.indexOf("SCHELL ") === 0) {
                product.produktbezeichnung_de = product.produktbezeichnung_de.substr(7);
              }
              $scope.products.push(product);
              if (!$rootScope.internet) {
                if (localStorageService.productImageDownloaded($scope.products[x].uid)) {
                  $scope.products[x].image_portrait = localStorageService.getPortraitPath($scope.products[x].uid);
                } else {
                  $scope.products[x].image_portrait = 'img/placeholder.png';
                }
              }
            }

            $scope.hide();
          });
        }
      };


    //History function
    $scope.$on('go-back', function () {
      $state.go('products');
    });

    //When user chooses a product
    $scope.choiceProduct = function (product, nummer) {
      appDataService.addNavigatedCategory(nummer);
      appDataService.setCurrentProduct(product);
      $state.go('detailPage');
    };


    }])

  .controller('MenuCtrl', ['$scope', '$ionicScrollDelegate', '$rootScope', '$ionicHistory', 'FirebaseService', 'localStorageService', 'appDataService',
    function ($scope, $ionicScrollDelegate, $rootScope, $ionicHistory, FirebaseService, localStorageService, appDataService) {

      $scope.goBack = function () {
        $rootScope.$broadcast('go-back');
      };

      function getFilterGroups(filter_headings, filter_ids) {
        var groups = [];
        var currentSelectedFilterIDs = appDataService.getCurrentSelectedFilterIds();

        filter_headings.forEach(function (filter_heading) {
          if (filter_heading.filters != null) {
            var keys = Object.keys(filter_heading.filters);
            var current_keys = keys.filter(function (key) {
              return filter_ids.indexOf(key) != -1;
            });
            var content = [];
            for (var i = 0; i < current_keys.length; i++) {
              content.push({
                uid: current_keys[i],
                filter_content: filter_heading.filters[current_keys[i]],
                checked: currentSelectedFilterIDs.indexOf(current_keys[i]) !== -1
              });
            }
            if (content.length != 0) {
              groups.push(
                {
                  name: filter_heading.title_de,
                  items: content,
                  show: false
                });
            }
          }
        });

        return groups;
      }

      // Update the groups
      $scope.$on('updateFilters', function () {
        var filters = localStorageService.getFilters();
        $scope.groups = getFilterGroups(filters, appDataService.getFilterIds().split(','));
      });

      $scope.applyFilter = function (uid, checked) {
        if (checked) {
          appDataService.addCurrentSelectedFilterIds(uid);
        } else {
          appDataService.removeCurrentSelectFilterId(uid);
        }

        $rootScope.$broadcast('new-filter-uid');
      };

      $scope.toggleGroup = function (group) {
        group.show = !group.show;
      };
      $scope.isGroupShown = function (group) {
        return group.show;
      };

      $scope.reset = function () {
        appDataService.clearSelectedFilters();
        $rootScope.$broadcast('new-filter-uid');
        $rootScope.$broadcast('updateFilters');
        $ionicScrollDelegate.scrollTop();
      }
}]);


// Setup the filter
angular.module('app.filters', [])

  .filter('split', function() {

    // Create the return function
    return function(input) {
      return input.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }

  })

  .filter('normalize', function() {

    return function(input) {
      return input.replace(/eSCHELL/g, '<span class="normalize">eSCHELL</span>');
    }

  })

  .filter('hide', function() {

    return function(input) {
      return input.replace(/(Wassermanagement-System)/g, '<span class="hidden">$1</span>');
    }

  });
