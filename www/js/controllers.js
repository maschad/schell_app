angular.module('app.controllers', [])

  .controller('start_screenCtrl', ['$scope', '$state', 'appDataService', 'DatabaseService', 'FirebaseService', 'localStorageService', '$ionicLoading', '$ionicPopup', '$ionicPopover', '$rootScope', '$ionicSideMenuDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $state, appDataService, DatabaseService, FirebaseService, localStorageService, $ionicLoading, $ionicPopup, $ionicPopover, $rootScope, $ionicSideMenuDelegate) {
 //Remove splash screen
  $scope.$on('$ionicView.afterEnter', function(){
    setTimeout(function(){
      document.getElementById("custom-overlay").style.display = "none";
    }, 3000);
  });

      //Loading functions
      $scope.showLoad = function () {
        $ionicLoading.show({
          template: '<p>Aktualisierung lokaler Daten...</p><ion-spinner></ion-spinner>',
          animation: 'fade-in',
          showBackdrop: true
        });
      };
      $scope.hideLoad = function () {
        $ionicLoading.hide();
      };


  //Side Menu
  $ionicSideMenuDelegate.canDragContent(false);


      function loadPage() {
        //Check for internet
        appDataService.checkInternet();

        //Whether anything is bookmarked
        $scope.bookmarks = [];

        //load bookmarked
        $scope.bookmarks = localStorageService.getBookmarkedProducts();
        //Whether to allow settings based on network connection
        $scope.show = $rootScope.internet;
        //If there is internet, populate the DB with latest data, else, work with what is in database
        if ($rootScope.internet) {
          $scope.showLoad();
          FirebaseService.downloadAllProducts(function (results) {
            DatabaseService.populateProducts(results);
          });
          FirebaseService.getAllProductCategories(function (results) {
            DatabaseService.populateProductCategories(results);
          });
          FirebaseService.downloadFiles(function (results) {
            DatabaseService.populateDownloads(results);
          });
          FirebaseService.downloadVideos(function (results) {
            DatabaseService.populateVideos(results);
          });
          FirebaseService.downloadProductFilters(function (results) {
            localStorageService.setFilters(results);
            $scope.hideLoad();
          });
        } else {
          //#TODO: Handle DB offline
        }
      }

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

      $scope.refreshItems = function () {
        //Check for internet
        appDataService.checkInternet();
        $state.reload();
      };

}])

  .controller('productOverviewCtrl', ['$scope', '$ionicLoading', '$ionicHistory', '$state', 'appDataService', 'DatabaseService', '$ionicPopover',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $ionicLoading, $ionicHistory, $state, appDataService, DatabaseService, $ionicPopover) {

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


      //Function to load the products for this category
      function getProducts(product_ids) {
        //Get Titles
        $scope.prev = appDataService.getPreviousTitle();
        $scope.title = $scope.prev;
        $scope.root = appDataService.getRootTitle();

        //Initialize products to empty
        $scope.products = [];
        //Show loading
        $scope.showLoad();
      //Load the various products
      DatabaseService.selectProducts(product_ids, function (products) {
        for(var x = 0; x < products.rows.length; x++){
          $scope.products.push(products.rows.item(x));
        }
        $scope.hideLoad();
      }, function (error) {
        //Handle error
        console.log('ERROR',error);
      });
    }



    //load Products
    getProducts(appDataService.getCurrentCategoryIds());

      //History function
      $scope.goBack = function () {
        appDataService.removeNavigatedCategory();
        $ionicHistory.goBack();
      };


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
      appDataService.setCurrentTitle(title);
      appDataService.setCurrentProduct(product);
      $state.go('detailPage');
    };

  }])

  .controller('product_areasCtrl', ['$scope', '$rootScope', '$state', '$ionicFilterBar', 'FileService', 'FirebaseService', 'appDataService', 'DatabaseService', 'localStorageService', '$ionicPopover', '$ionicLoading', '$ionicSideMenuDelegate',
    function ($scope, $rootScope, $state, $ionicFilterBar, FileService, FirebaseService, appDataService, DatabaseService, localStorageService, $ionicPopover, $ionicLoading, $ionicSideMenuDelegate) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

      //Filter bar is not clicked
      $scope.filterOn = false;

      //Initialize as null
      $scope.categories = [];

      //Counts
      $scope.counts = {};

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

      //Clear array when at home
      appDataService.clearNavigatedCategories();


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
      DatabaseService.selectTopCategories(function (results) {
        for (var x = 0; x < results.rows.length; x++) {
          $scope.categories.push(results.rows.item(x));
          var uid = $scope.categories[x].uid;
          if (!$rootScope.internet && localStorageService.categoryDownloaded(uid)) {
            $scope.categories[x].bild = localStorageService.getBildPath(uid);

          } else if ($rootScope.internet) {
            downloadImage(uid, $scope.categories[x].bild, $scope.categories[x].title_de.concat('_bild.png'));
          }
        }
        countArtikels();
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

      //Refresh the items
      $scope.refreshItems = function () {
        loadCategories();
      };

      //When user chooses a product
      $scope.choiceProduct = function (product, nummer) {
        appDataService.setCurrentTitle(nummer);
        appDataService.setCurrentProduct(product);
        $state.go('detailPage');
      };

    //The category chosen by the user
    $scope.choice = function (child_ids, title,filter_ids) {
      appDataService.setRootTitle(title);
      appDataService.setCurrentTitle(title);
      appDataService.setCurrentCategoryIds(child_ids);
      appDataService.addNavigatedCategory(title);
      appDataService.setFilterIds(filter_ids);
      $state.go('product_lines');
    };

    //The filter/search bar using ionic filter bar plugin
    $scope.showFilterBar = function () {
      var products = [];
      $scope.filterOn = true;
      DatabaseService.selectAllProducts(function (results) {
        for (var x = 0; x < results.rows.length; x++) {
          products.push(results.rows.item(x));
        }
        var filterBarInstance = $ionicFilterBar.show({
          items: products,
          cancelText: 'Abrechen',
          cancel: function () {
            $scope.filterOn = false;
            loadCategories();
            $state.reload();
          },
          expression: function (filterText, value, index, array) {
            return value.nummer.includes(filterText) || value.produktbezeichnung_de.includes(filterText.toUpperCase()) || value.produktbezeichnung_de.includes(filterText) || value.beschreibung_de.includes(filterText);
          },
          update: function (filteredItems, filterText) {
            $scope.products = filteredItems;
          }
        });
      });
    };

      //Function to count the total number of artikels in category below
      function countArtikels() {
        //all Categories
        var allCategories = [];

        //Get all categories
        DatabaseService.selectAllCategories(function (results) {
          for (var x = 0; x < results.rows.length; x++) {
            allCategories.push(results.rows.item(x));
          }
          $scope.categories.forEach(function (category) {
            //Initialize count to 0
            var count = 0;
            //If we are at bottom level
            var atBottomLevel = category.product_ids != '';
            // 2. If we are at the bottom level category
            // Get the products and sum the #
            if (atBottomLevel) {
              $scope.counts[category.uid] = category.product_ids.split(',').length;
            } else {
              var currentCategories = [category];
              // 3. If we aren't at the bottom level,
              // query all the child_ids until we get to the bottom level.
              while (!atBottomLevel) {
                // We copy over the current categories so we can reuse currentCategories
                var tempCurrentCategories = currentCategories.slice();
                currentCategories = [];
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
                    count += currentCat.product_ids.split(',').length;
                  }
                  atBottomLevel = atBottomLevel && currentCat.product_ids != '';
                });
                //Filter out sub categories with product ids
                // and traverse next branch
                currentCategories.filter(function (currentCat) {
                  return currentCat.product_ids != '';
                });

              }
              //Update the count
              $scope.counts[category.uid] = count;
            }
          });
        });
      }


  }])


  .controller('videoCtrl', ['$scope', '$rootScope', '$sce', '$ionicSideMenuDelegate', 'appDataService', 'FirebaseService', 'FileService', '$ionicLoading', '$ionicPopup', 'localStorageService', 'DatabaseService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $rootScope, $sce, $ionicSideMenuDelegate, appDataService, FirebaseService, FileService, $ionicLoading, $ionicPopup, localStorageService, DatabaseService) {
    //Initialize empty array
  $scope.videos = [];

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
    DatabaseService.selectAllVideos(function (videos) {
      for (var x = 0; x < videos.rows.length; x++) {
        $scope.videos.push(videos.rows.item(x));
      }
      if ($rootScope.internet == false) {
        var vids = localStorageService.getAllVideoPaths();
        if (vids == null) {
          $ionicPopup.alert({
            title: 'Keine Videos heruntergeladen'
          });
        } else {
          for (var key in vids) {
            console.log('video path in local storage', vids[key].videofile_de);
            $scope.videos[key].videofile_de = vids[key].videofile_de;
            console.log('image video path in local storage', vids[key].startimage_de);
            $scope.videos[key].startimage_de = vids[key].startimage_de;
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
      $scope.goBack = function () {
        $ionicHistory.goBack();
      };

}])

.controller('countryselectCtrl', ['$scope', '$ionicSideMenuDelegate','localStorageService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $ionicSideMenuDelegate,localStorageService) {
  //Side Menu
  $ionicSideMenuDelegate.canDragContent(false);


  $scope.$on('$ionicView.afterEnter', function(){
    setTimeout(function(){
      document.getElementById("custom-overlay").style.display = "none";
    }, 3000);
  });


  $scope.selection = function (country) {
    localStorageService.setCountry(country);

  }

}])

  .controller('detailPageCtrl', ['$scope', '$state', '$rootScope', '$ionicPopover', '$ionicHistory', '$sce', 'FileService', 'FirebaseService', 'appDataService', 'localStorageService', 'DatabaseService', '$ionicSideMenuDelegate', '$ionicLoading', '$ionicPopup', '$cordovaInAppBrowser',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $state, $rootScope, $ionicPopover, $ionicHistory, $sce, FileService, FirebaseService, appDataService, localStorageService, DatabaseService, $ionicSideMenuDelegate, $ionicLoading, $ionicPopup, $cordovaInAppBrowser) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

      //The products to be show in collapsible list
      $scope.files = [];
      //Array of Bookmarked Products
      $scope.bookmarked = [];

      //Refresh page
      $scope.refreshItems = function () {
        loadProduct();
        $state.reload();
      };


      //Load the product information
      function loadProduct() {
        //Check for internet
        appDataService.checkInternet();
        //Load bookmarked products
        $scope.bookmarked = localStorageService.getBookmarkedProducts();

        //Set details
        $scope.details = appDataService.getCurrentProduct();

        //Whether this product has been downloaded
        $scope.productDownloaded = localStorageService.productDownloaded($scope.details.uid);

        if (!$rootScope.internet && $scope.productDownloaded) {
          //If no internet load these files
          $scope.details.image_landscape = localStorageService.getLandscapePath($scope.details.uid);
          $scope.details.technical_drawing_link = localStorageService.getTechnicalPath($scope.details.uid);
        }
        //Load Downloads and videos
        if ($scope.details.download_ids != '') {
          getFiles($scope.details.download_ids);
        }
        if ($scope.details.video_ids != '') {
          getVideos($scope.details.video_ids);
        }
      }

    //Function to load files
    function getFiles(download_ids) {
      DatabaseService.selectDownloads(download_ids, function (downloads) {
        for(var x = 0; x < downloads.rows.length; x++){
          $scope.files.push(downloads.rows.item(x));
        }
        //If no internet load local path
        if (!$rootScope.internet && localStorageService.productDownloaded($scope.details.uid)) {
          $scope.files.forEach(function (file, index) {
            file.thumbnail = localStorageService.getThumbnailPath($scope.detail.uid, index);
          });
        }
      })
    }

    function getVideos(video_ids) {
      //Videos for that corresponding product
      $scope.videos = [];

      DatabaseService.selectVideos(video_ids, function(videos){
        for(var x = 0; x < videos.rows.length; x++){
          $scope.videos.push(videos.rows.item(x));
          if (!$rootScope.internet && localStorageService.productDownloaded($scope.videos[x].uid)) {
            $scope.videos[x].videofile_de = localStorageService.getVideoPath($scope.videos[x].uid);
          }
        }

      });
    }

      function downloadPDFFiles(uid, url, filename) {
        //Check whether pdf or zip for PDF file
        switch (url.substr(url.length - 3)) {
          case 'pdf':
            FileService.originalDownload(url, filename.concat('_booklet.pdf'), 'pdfs', function (path) {
              console.log('downloading pdf uid', uid);
              console.log('to path', path);
              localStorageService.setPDFPath(uid, path);

            });
            break;
          case 'zip':
            FileService.originalDownload(url, filename.concat('_booklet.zip'), 'pdfs', function (path) {
              console.log('downloading pdf uid', uid);
              console.log('to path', path);
              localStorageService.setPDFPath(uid, path);
            });
            break;

          case 'jpg':
            FileService.originalDownload(url, filename.concat('_thumbnail.jpg'), 'pdfs', function (path) {
              console.log('downloading thumbnail uid', uid);
              console.log('to path', path);
              localStorageService.setThumbnailPath(uid, path);
            });
            break;

          case 'png':
            FileService.originalDownload(url, filename.concat('_booklet.png'), 'pdfs', function (path) {
              console.log('downloading thumbnail uid', uid);
              console.log('to path', path);
              localStorageService.setThumbnailPath(uid, path);
            });
            break;
        }
      }

      //Load the product
      loadProduct();

    //Get various labels
    $scope.title = appDataService.getCurrentTitle();
    $scope.prev = appDataService.getPreviousTitle();
    $scope.root = appDataService.getRootTitle();
    $scope.artikel = $scope.title;

    //Loading functions
    $scope.show = function() {
      $ionicLoading.show({
        template: '<p>Downloading Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop:true
      });
    };
    $scope.hide = function(){
      $ionicLoading.hide();
    };

      $scope.goBack = function () {
        appDataService.removeNavigatedCategory();
        $ionicHistory.goBack();
      };

    //Bookmark Function
    $scope.bookmark = function () {
      console.log('uid passed in', $scope.details.uid);
      if (!localStorageService.bookmarkProduct($scope.details)) {
        $ionicPopup.alert({
          title: 'bereits vorgemerkt',
          cssClass: 'bookmark-popup'
        });
      } else {
        $ionicPopup.alert({
          title: 'Seite bookmarkiert',
          cssClass: 'bookmark-popup'
        });
      }

    };

    //Download PDF
    $scope.showPDF = false;
      $scope.downloadPDF = function (file, index) {
      appDataService.checkInternet();
      if ($rootScope.internet) {
        $scope.pdfUrl = file.datei_de;
      } else {
        console.log('uid of file being accessed ', $scope.details.uid);
        console.log('index being passed', index);
        console.log('pdf file being passed ', localStorageService.getPDFPath($scope.details.uid, index, 'de'));
        $scope.pdfUrl = localStorageService.getPDFPath($scope.details.uid, 'de', index);
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
          show : false
        },
        {
          title : 'LIEFERUMFANG',
          show : false
        },
        {
          title : 'EINSATZBEREICH / TECHNISCHE DATEN',
          show : false
        },
        {
          title : 'DETAILS',
          show : false
        },
        {
          title : 'DOWNLOADS',
          downloads : '',
          show : false
        },
        {
          title : 'VARIANTEN',
          show : false
        },
        {
          title : 'EMPFOHLENE ZUGEHÖRIGE ARTIKEL',
          show : false
        },
        {
          title : 'VIDEO',
          show : false
        }

      ]);

      //Function to download product
      $scope.downloadProduct = function () {
        if ($rootScope.internet && !$scope.productDownloaded) {
          $ionicPopup.alert({
            title: 'downloading product',
            cssClass: 'download-popup',
            okText: 'Offline verfügbar machen'
          }).then(function () {
            FileService.originalDownload($scope.details.image_landscape, $scope.details.nummer.concat('_landscape.png'), 'img', function (path) {
              localStorageService.setLandscapePath($scope.details.uid, path);
            });
            FileService.originalDownload($scope.details.technical_drawing_link, $scope.details.nummer.concat('_technical_drawing.png'), 'img', function (path) {
              localStorageService.setTechnicalPath($scope.details.uid, path);
            });
            for (var y = 0; y < $scope.files.length; y++) {
              downloadPDFFiles($scope.details.uid, $scope.files[y].datei_de, $scope.details.nummer.concat(y));
              downloadPDFFiles($scope.details.uid, $scope.files[y].thumbnail, $scope.details.nummer.concat(y));
            }
            $state.reload();
          });
        } else if ($scope.productDownloaded) {
          $ionicPopup.alert({
            title: 'Bereits heruntergeladen'
          });
        } else {
          $ionicPopup.alert({
            title: 'keine Internetverbindung'
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
    var navigatedCategories = appDataService.getNavigatedCategories();
    var link = 'http://www.schell.eu/deutschland-de/produkte/';
    for (var x = 0; x < navigatedCategories.length; x++) {
      link = link.concat(navigatedCategories[x] + '/');
    }
    link = link.concat('details/artikel/' + $scope.details.nummer + '.html');

    var bodyText = 'Product nummer ' .concat($scope.details.nummer)
      + '  ' + 'Referenzartikel ' + '   '.concat($scope.details.referenzartikel)
      + ' '.concat($scope.details.differenzierung_de)
      + ' ' + 'Hier ist ein Link ' + '  ' + link;


    if(window.plugins && window.plugins.emailComposer) {
      window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
          console.log("Response -> " + result);
        },
        "Artikel Subject", // Subject
        bodyText,                      // Body
        ["test@example.com"],    // To
        null,                    // CC
        null,                    // BCC
        false,                   // isHTML
        null,                    // Attachments
        null);                   // Attachment Data
    }else{
      console.log('could not open');
    }
  };


}])

  .controller('productLinesCtrl', ['$scope', '$state', '$rootScope', '$ionicLoading', '$ionicHistory', '$ionicFilterBar', 'localStorageService', 'FileService', 'DatabaseService', 'appDataService', '$ionicPopover',
    function ($scope, $state, $rootScope, $ionicLoading, $ionicHistory, $ionicFilterBar, localStorageService, FileService, DatabaseService, appDataService, $ionicPopover) {
    //Set the titles and initialize empty array of filters
    $scope.title = appDataService.getCurrentTitle();
    $scope.root = appDataService.getRootTitle();
    $scope.filter_ids = [];

    //Array storing artikel counts for each category
    $scope.counts = {};

    //Whether to show the filter or not
    $scope.showFilter = false;



    //Loading functions
    $scope.show = function() {
      $ionicLoading.show({
        template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop: true
      });
    };

    //Hide function
    $scope.hide = function(){
      $ionicLoading.hide();
    };

      $scope.goBack = function () {
        appDataService.removeNavigatedCategory();
        $ionicHistory.goBack();
      };

      //Function to download Image file
      function downloadImage(uid, url, filename) {
        FileService.originalDownload(url, filename, 'imgs', function (path) {
          localStorageService.setBildPath(uid, path);
          console.log('bild path', localStorageService.getBildPath(uid));
        });
      }


    //Load SubCategories from database
    function loadSubCategories(child_ids) {
      //Initialize as empty
      $scope.categories = [];
      //Set title
      $scope.title = appDataService.getCurrentTitle();
      $scope.show();
      //Check for internet
      appDataService.checkInternet();
      //Load the child ids from db
      DatabaseService.selectChildCategories(child_ids,function (categories) {
        for(var x = 0; x < categories.rows.length; x++){
          $scope.categories.push(categories.rows.item(x));
          //Grab the images or load them in offline mode
          var uid = $scope.categories[x].uid;
          if ($scope.categories[x].bild != '') {
            if (!$rootScope.internet && localStorageService.categoryDownloaded(uid)) {
              $scope.categories[x].bild = localStorageService.getBildPath(uid);
            } else if ($rootScope.internet) {
              downloadImage(uid, $scope.categories[x].bild, $scope.categories[x].title_de.concat('_bild.png'));
            }
          }
        }
        //Add up the artikels
        countArtikels();
        $scope.hide();
      }, function (error) {
        //Handle error
        console.log('ERROR',error);
      });
    }

    //Function to count the total number of artikels in category below
    function countArtikels() {
      //all Categories
      var allCategories = [];

      //Get all categories
      DatabaseService.selectAllCategories(function (results) {
        for (var x = 0; x < results.rows.length; x++) {
          allCategories.push(results.rows.item(x));
        }
        $scope.categories.forEach(function (category) {
          //Initialize count to 0
          var count = 0;
          //If we are at bottom level
          var atBottomLevel = category.product_ids != '';
          // 2. If we are at the bottom level category
          // Get the products and sum the #
          if (atBottomLevel) {
            $scope.counts[category.uid] = category.product_ids.split(',').length;
          } else {
            var currentCategories = [category];
            // 3. If we aren't at the bottom level,
            // query all the child_ids until we get to the bottom level.
            while (!atBottomLevel) {
              // We copy over the current categories so we can reuse currentCategories
              var tempCurrentCategories = currentCategories.slice();
              currentCategories = [];
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
                  count += currentCat.product_ids.split(',').length;
                }
                atBottomLevel = atBottomLevel && currentCat.product_ids != '';
              });
              //Filter out sub categories with product ids
              // and traverse next branch
              currentCategories.filter(function (currentCat) {
                return currentCat.product_ids != '';
              });

            }
            //Update the count
            $scope.counts[category.uid] = count;
            $scope.hide();
          }
        });
      });
    }

    //Function to apply the filter
    function applyFilter(applied_filters) {
      //Initialize totals to empty
      $scope.total_filter = 0;
      $scope.total_products = 0;
      //Re-set array
      $scope.counts = {};

      //Product ids to download for check
      var product_ids_to_download = [];

      // If empty then just add products
      if (applied_filters.length == 0) {
        countArtikels();
      } else {
        //all Categories
        var allCategories = [];

        //Get all categories
        DatabaseService.selectAllCategories(function (results) {
          for (var x = 0; x < results.rows.length; x++) {
            allCategories.push(results.rows.item(x));
          }
          $scope.categories.forEach(function (category) {
            //Store the products and then crosscheck with filters
            var products = [];

            var atBottomLevel = category.product_ids != '';
            // 2. If we are at the bottom level category
            // Get the products and sum the #
            if (atBottomLevel) {
              DatabaseService.selectProducts(category.product_ids, function (results) {
                for (var x = 0; x < results.rows.length; x++) {
                  products.push(results.rows.item(x));
                }
                //Filtered products
                var filteredProducts = products.slice();
                //Loop over filters
                applied_filters.forEach(function (filter) {
                  //Filter the products
                  filteredProducts = filteredProducts.filter(function (product) {
                    return product.filter_ids.split(',').indexOf(filter) != -1;
                  });
                });
                //Push in the lengths
                $scope.counts[category.uid] = filteredProducts.length;

                //Add them up
                $scope.total_filter += filteredProducts.length;
                $scope.total_products += products.length;
              });
            } else {
              var currentCategories = [category];
              // 3. If we aren't at the bottom level,
              // query all the child_ids until we get to the bottom level.
              while (!atBottomLevel) {
                // We copy over the current categories so we can reuse currentCategories
                var tempCurrentCategories = currentCategories.slice();
                currentCategories = [];
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
                    product_ids_to_download = product_ids_to_download.concat(currentCat.product_ids.split(','));
                  }
                  atBottomLevel = atBottomLevel && currentCat.product_ids != '';
                });
                //Filter out sub categories with product ids
                // and traverse next branch
                currentCategories.filter(function (currentCat) {
                  return currentCat.product_ids != '';
                });
              }
              currentCategories.forEach(function (category) {
                product_ids_to_download = product_ids_to_download.concat(category.product_ids);
              });
              DatabaseService.selectProducts(product_ids_to_download, function (results) {
                for (var x = 0; x < results.rows.length; x++) {
                  products.push(results.rows.item(x));
                }
                //Filtered products
                var filteredProducts = products.slice();
                //Loop over filters
                applied_filters.forEach(function (filter) {
                  //Filter the products
                  filteredProducts = filteredProducts.filter(function (product) {
                    return product.filter_ids.split(',').indexOf(filter) != -1;
                  });
                });
                //Push in the lengths
                $scope.counts[category.uid] = filteredProducts.length;
                //Loading
                $scope.hide();
                //Add them up
                $scope.total_filter += filteredProducts.length;
                $scope.total_products += products.length;
              });
            }
          });
        });
      }

    }

    //Get the correct childIds and then load them from database
    var child_ids = appDataService.getCurrentCategoryIds();
    //Load the sub categories to display
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
        appDataService.setCurrentTitle(title);
        appDataService.addNavigatedCategory(title);
        loadSubCategories(child_ids);
        $state.reload();
      };

      //Product Choice
      $scope.choice_product = function (product_ids, title) {
        // If user chooses something with product_ids
        appDataService.setCurrentTitle(title);
        appDataService.setCurrentCategoryIds(product_ids);
        appDataService.setPreviousTitle(title);
        appDataService.addNavigatedCategory(title);
        $state.go('product_overview');
      };


      $scope.myEvent = function () {
        $state.go('start-screen');
      };

      $scope.goBack = function () {
        $ionicHistory.goBack();
      };


    //When user selects new filter
    $scope.$on('new-filter-uid', function () {
      $scope.showFilter = true;
      //Get the filter ids for current category
      var filter_ids = appDataService.getCurrentSelectedFilterIds();
      //Apply the filter
      applyFilter(filter_ids);
    });

}])

  .controller('bookmarkCtrl', ['$scope', '$state', '$ionicPopup', '$ionicHistory', '$ionicSideMenuDelegate', 'localStorageService', 'appDataService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $state, $ionicPopup, $ionicHistory, $ionicSideMenuDelegate, localStorageService, appDataService) {

  //Side Menu
  $ionicSideMenuDelegate.canDragContent(false);


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
      appDataService.setCurrentTitle(product.nummer);
      $state.go('detailPage');
    };

    $scope.email = function (bookmark) {
      var link = bookmark.email_link;
      var bodyText = 'Product nummer ' .concat($scope.details.nummer)
        + ' ' + 'Referenzartikel ' + ' ' .concat($scope.details.referenzartikel)
        + ' ' .concat($scope.details.de_data.differenzierung)
        + '' + 'Hier ist ein Link' + ' ' + link;


      if(window.plugins && window.plugins.emailComposer) {
        window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
            console.log("Response -> " + result);
          },
          "Artikel Subject", // Subject
          bodyText,                      // Body
          ["test@example.com"],    // To
          null,                    // CC
          null,                    // BCC
          false,                   // isHTML
          null,                    // Attachments
          null);                   // Attachment Data
      }else{
        console.log('could not open');
      }
    };

    $scope.deleteBookmark = function (bookmark) {
      localStorageService.removeBookmarkedProduct(bookmark);
      $ionicPopup.alert({
        title: 'Artikel Entfernt'
      });
      $state.reload();
    };
}])

  .controller('offlineStorageCtrl', ['$scope', '$rootScope', '$ionicLoading', '$ionicHistory', 'FirebaseService', 'localStorageService', 'DatabaseService', 'FileService', '$ionicSideMenuDelegate', '$ionicPopup',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $rootScope, $ionicLoading, $ionicHistory, FirebaseService, localStorageService, DatabaseService, FileService, $ionicSideMenuDelegate, $ionicPopup) {

    //Disable Side Menu
    $ionicSideMenuDelegate.canDragContent(false);


    //Video File size
    $scope.total_video_size = 0;

    //Initialize as empty
    $scope.videos = [];

    //Preferences as empty
    $scope.preferences = [];

    //Category file sizes
    $scope.fileSizes = {};


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
        today = mm + '/' + dd + '/' + yyyy;
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
      //Product ids to download
      var product_ids_toDownload = [];
      //Actual products to download
      var products = [];
      //All categories
      var allCategories = [];
      //Sum the file sizes
      var filesize = 0;
      //Download ids for category
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
          if (categoryWithProductIds.download_ids != '') {
            categoryDownloadIds = categoryDownloadIds.concat(categoryWithProductIds.download_ids.split(','));
          }

        });
        //Get the products with the info to download
        DatabaseService.selectProducts(product_ids_toDownload, function (results) {
          for (var x = 0; x < results.rows.length; x++) {
            products.push(results.rows.item(x));
          }
          products.forEach(function (product) {
            var downloads = [];
            var videos = [];

            //Add images and technical drawings
            filesize += product.image_landscape_filesize;
            filesize += product.image_portrait_filesize;
            filesize += product.technical_drawing_filesize;

            //Get associated downloads
            if (product.download_ids != '') {
              DatabaseService.selectDownloads(product.download_ids, function (results) {
                for (var x = 0; x < results.rows.length; x++) {
                  downloads.push(results.rows.item(x));
                }

                downloads.forEach(function (file) {
                  filesize += file.filesize;
                });

                //If product has videos
                if (product.video_ids != '') {
                  DatabaseService.selectVideos(product.video_ids, function (results) {
                    for (var x = 0; x < results.rows.length; x++) {
                      videos.push(results.rows.item(x));
                    }

                    videos.forEach(function (file) {
                      filesize += file.filesize;
                    });

                    DatabaseService.selectDownloads(categoryDownloadIds, function (results) {
                      for (var x = 0; x < results.rows.length; x++) {
                        filesize += results.rows.item(x).filesize;
                      }
                      //Push in the file size
                      $scope.fileSizes[category.uid] = filesize;
                      $scope.hide();
                    });
                  });
                } else {
                  DatabaseService.selectDownloads(categoryDownloadIds, function (results) {
                    for (var x = 0; x < results.rows.length; x++) {
                      filesize += results.rows.item(x).filesize;
                    }
                    //Push in the file size
                    $scope.fileSizes[category.uid] = filesize;
                    $scope.hide();
                  });
                }
              });
            }
          });

        });
      });

    }


      function downloadPDFFiles(uid, url, filename) {
        //Check whether pdf or zip for PDF file
        switch (url.substr(url.length - 3)) {
          case 'pdf':
            FileService.originalDownload(url, filename.concat('_booklet.pdf'), 'pdfs', function (path) {
              localStorageService.setPDFPath(uid, path);
              console.log('downloading pdf uid', uid);
              console.log('to path', path);
            });
            break;
          case 'zip':
            FileService.originalDownload(url, filename.concat('_booklet.zip'), 'pdfs', function (path) {
              localStorageService.setPDFPath(uid, path);
              console.log('downloading pdf uid', uid);
              console.log('to path', path);
            });
            break;

          case 'jpg':
            FileService.originalDownload(url, filename.concat('_thumbnail.jpg'), 'pdfs', function (path) {
              localStorageService.setThumbnailPath(uid, path);
              console.log('downloading pdf uid', uid);
              console.log('to path', path);
            });
            break;

          case 'png':
            FileService.originalDownload(url, filename.concat('_booklet.png'), 'pdfs', function (path) {
              localStorageService.setThumbnailPath(uid, path);
              console.log('downloading pdf uid', uid);
              console.log('to path', path);
            });
            break;
        }
      }

    //Download the files for the respective category and store the file paths in local storage
    function downloadCategoryFiles(category) {
      //Product ids to download
      var product_ids_toDownload = [];
      //Actual products to download

      var products = [];
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
             products.push(results.rows.item(x));
           }
           products.forEach(function (product) {
             var downloads = [];
             //Store images and technical drawings
             FileService.originalDownload(product.image_landscape, product.nummer.concat('_landscape.png'), 'images', function (path) {
               console.log('setting landscape path', path);
               localStorageService.setLandscapePath(product.uid, path);
             });
             FileService.originalDownload(product.technical_drawing_link, product.nummer.concat('_technical_drawing.png'), 'images', function (path) {
               localStorageService.setTechnicalPath(product.uid, path);
             });
             //Get associated downloads
             if (product.download_ids != '') {
               DatabaseService.selectDownloads(product.download_ids, function (results) {
                 for (var x = 0; x < results.rows.length; x++) {
                   downloads.push(results.rows.item(x));
                 }
                 downloads.forEach(function (file, index) {
                   //#TODO:Check for other languages later on
                   downloadPDFFiles(product.uid, file.datei_de, product.nummer.concat(index));
                   downloadPDFFiles(product.uid, file.thumbnail, product.nummer.concat(index));
                 });
               });
             }
           });
         });
      });

    }

    //Call the function on startup
    loadData();

      function downloadVideo(uid, url, filename) {
        switch (url.substr(url.length - 3)) {
          case 'mp4':
            FileService.originalDownload(url, filename.concat('_video.mp4'), 'videos', function (result) {
              localStorageService.setVideoPath(uid, result);
            });
            break;
          case '.zip':
            FileService.originalDownload(url, filename.concat('_video.zip'), 'videos', function (result) {
              localStorageService.setVideoPath(uid, result);
            });
            break;
        }
      }

      function downloadVideoImage(uid, url, filename) {
        switch (url.substr(url.length - 3)) {
          case 'jpg':
            FileService.originalDownload(url, filename.concat('_startimage.jpg'), 'imgs', function (result) {
              localStorageService.setVideoImagePath(uid, result);
            });
            break;

          case 'png':
            FileService.originalDownload(url, filename.concat('_startimage.png'), 'imgs', function (result) {
              localStorageService.setVideoImagePath(uid, result);
            });
            break;
        }
      }

    //Function to download videos
    $scope.downloadVideos = function () {
      //If checked
      if ($scope.preferences[3].download_videos) {
        $scope.preferences.last_updated = getDate();
        for (var x = 0; x < $scope.videos.length; x++) {
          downloadVideo($scope.videos[x].uid, $scope.videos[x].videofile_de, $scope.videos[x].title);
          downloadVideoImage($scope.videos[x].uid, $scope.videos[x].startimage_de, $scope.videos[x].title);
        }
        localStorageService.updatePreferences($scope.preferences);
      } else {
        localStorageService.updatePreferences($scope.preferences);
      }
    };

    //Check to download selected category
    $scope.downloadCategory = function (category, check) {
      //Download details based on check
      if (check == true) {
        $scope.preferences.last_updated = getDate();
        //Update preferences
        //The product ids to download
        downloadCategoryFiles(category);
      }
      //Update preference at selected preference
      $scope.preferences[2].downloaded_categories[$scope.preferences[2].downloaded_categories.indexOf(category)].checked = check;
      localStorageService.updatePreferences($scope.preferences);
    };



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

  .controller('regionCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicHistory', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $ionicSideMenuDelegate, $ionicHistory) {
      //Side Menu deactivated
      $ionicSideMenuDelegate.canDragContent(false);

      $scope.goBack = function () {
        $ionicHistory.goBack();
      };

}])

  .controller('MenuCtrl', ['$scope', '$rootScope', '$ionicHistory', 'FirebaseService', 'localStorageService', 'appDataService',
    function ($scope, $rootScope, $ionicHistory, FirebaseService, localStorageService, appDataService) {

      $scope.goBack = function () {
        appDataService.removeNavigatedCategory();
        $ionicHistory.goBack();
      };

      function getFilterGroups(filter_headings, filter_ids) {
        var groups = [];


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
                checked: false
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
      $scope.$on('$stateChangeSuccess',function () {
        var filters = localStorageService.getFilters();
        $scope.groups = getFilterGroups(filters, appDataService.getFilterIds().split(','));
        }
      );

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
}]);
