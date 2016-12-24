angular.module('app.controllers', [])

.controller('start_screenCtrl', ['$scope','$state','DatabaseService','FirebaseService','$ionicPopup','$ionicPopover','$rootScope','$ionicSideMenuDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $state,DatabaseService,FirebaseService,$ionicPopup, $ionicPopover,$rootScope,$ionicSideMenuDelegate) {
 //Remove splash screen
  $scope.$on('$ionicView.afterEnter', function(){
    setTimeout(function(){
      document.getElementById("custom-overlay").style.display = "none";
    }, 3000);
  });


  //Side Menu
  $ionicSideMenuDelegate.canDragContent(false);


  //Whether to allow settings based on network connection
  $scope.show = $rootScope.internet;

  //If there is internet, populate the DB with latest data, else, work with what is in database
  if($rootScope.internet){
    DatabaseService.populateProductCategories(FirebaseService.getAllProductCategories());
    DatabaseService.populateProducts(FirebaseService.downloadAllProducts());
  }else{
    //#TODO: Handle DB offline
  }

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

}])

  .controller('productOverviewCtrl', ['$scope', '$ionicFilterBar', '$state','appDataService','DatabaseService','$ionicPopover',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope, $ionicFilterBar,$state,appDataService,DatabaseService,$ionicPopover) {
    //Get Titles
    $scope.title = appDataService.getCurrentTitle();
    $scope.prev = appDataService.getPreviousTitle();
    $scope.root = appDataService.getRootTitle();

    //Function to load the products for this category
    function getProducts(product_ids) {
      //Load the various products
      DatabaseService.selectProducts(product_ids,function (products) {
        for(var x = 0; x < products.rows.length; x++){
          $scope.products.push(products.rows.item(x));
        }
      }, function (error) {
        //Handle error
        console.log('ERROR',error);
      });
    }

    //Initialize products to empty
    $scope.products = [];

    //load Products
    getProducts(appDataService.getCurrentCategoryIds());


    //Search bar
    $scope.showFilterBar = function () {
      var filterBarInstance = $ionicFilterBar.show({
        items: $scope.products,
        cancelText: 'Abrechen',
        update: function (filteredItems, filterText) {
          $scope.products = filteredItems;
        }
      });
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

      $state.go('detailPage');
    };

  }])

.controller('product_areasCtrl', ['$scope', '$state','$ionicFilterBar','FirebaseService','appDataService','DatabaseService','localStorageService','$ionicPopover','$ionicSideMenuDelegate',
  function ($scope, $state,$ionicFilterBar,FirebaseService,appDataService,DatabaseService,localStorageService,$ionicPopover,$ionicSideMenuDelegate) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    //Initialize as null
    $scope.categories = [];

    //Call the function to populate categories
    loadCategories();

    //Load Categories from Database.
    function loadCategories() {
      DatabaseService.selectTopCategories(function (categories) {
        for(var x = 0; x < categories.rows.length; x++){
          $scope.categories.push(categories.rows.item(x));
        }
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
      appDataService.setRootTitle(title);
      appDataService.setCurrentTitle(title);
      appDataService.setCurrentCategoryIds(child_ids);
      localStorageService.setFilters(filter_ids);
      $state.go('product_lines');
    };

    //The filter/search bar using ionic filter bar plugin
    $scope.showFilterBar = function () {
      var filterBarInstance = $ionicFilterBar.show({
        items: $scope.categories,
        cancelText: 'Abrechen',
        update: function (filteredItems, filterText) {
          $scope.categories = filteredItems;
        }
      });
    };


  }])


.controller('videoCtrl', ['$scope', '$sce','$ionicSideMenuDelegate', 'FirebaseService','FileService','$ionicLoading','$ionicPopup','localStorageService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $sce,$ionicSideMenuDelegate, FirebaseService,FileService,$ionicLoading,$ionicPopup,localStorageService) {


  //Loading functions
  $scope.show = function() {
    $ionicLoading.show({
      template: '<p>Downloading Videos...</p><ion-spinner></ion-spinner>',
      animation:'fade-in',
      showBackdrop:true,
      duration: 3000
    });
  };
  $scope.hide = function(){
    $ionicLoading.hide();
  };

  //Load Videos
  $scope.show();
  //#TODO: Check internet for videos
  if(FirebaseService.downloadVideos() != null){
    $scope.videos = FirebaseService.downloadVideos();
    $scope.hide();
  }else{
    //$scope.videos = localStorageService.loadVideos();
  }


  //return trusted external links
  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };


}])

.controller('settingsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


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

  .controller('detailPageCtrl', ['$scope', '$rootScope','$ionicPopover', '$sce','FirebaseService','appDataService', 'localStorageService', '$ionicSideMenuDelegate', '$ionicLoading','$ionicPopup', '$cordovaInAppBrowser',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope,$rootScope, $ionicPopover, $sce,FirebaseService,appDataService,localStorageService,$ionicSideMenuDelegate,$ionicLoading,$ionicPopup,$cordovaInAppBrowser) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    //The products to be show in collapsible list
    $scope.details = [];
    $scope.files = [];

    //To load the details about a product
    function getProductDetails(product_id) {
        //#TODO: Load details of specific product
      DatabaseService.selectProducts(product_id,function (categories) {
        for(var x = 0; x < categories.rows.length; x++){
          $scope.details.push(categories.rows.item(x));
        }
      }, function (error) {
        //Handle error
        console.log('ERROR',error);
      });

    }

    //Load Details
    getProductDetails(appDataService.getCurrentCategoryIds());


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


    //Bookmark Function
    $scope.bookmark = function () {
      $ionicPopup.alert({
        title: 'Seite bookmarkiert'
      });
      localStorageService.bookmarkProduct($scope.details);
    };

    //Download PDF
    $scope.showPDF = false;
    $scope.downloadPDF = function (f) {
      $scope.pdfUrl = f.de_data.datei;
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


    //Build up link
    appDataService.appendEmailLink('details/artikel/' + $scope.details.nummer + '.html');


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
          varianten : '',
          show : false
        },
        {
          title : 'EMPFOHLENE ZUGEHÖRIGE ARTIKEL',
          varianten : '',
          show : false
        },
        {
          title : 'VIDEO',
          varianten : '',
          show : false
        }

      ]);



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
    var link = localStorageService.getLink();
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


}])

.controller('productLinesCtrl', ['$scope','$ionicFilterBar', '$state', 'localStorageService','DatabaseService','appDataService','$ionicPopover',
  function ($scope,$ionicFilterBar,$state,localStorageService,DatabaseService,appDataService,$ionicPopover) {
    //Set the titles
    $scope.title = appDataService.getCurrentTitle();
    $scope.root = appDataService.getRootTitle();

    //Load SubCategories from database
    function loadSubCategories(child_ids) {
      DatabaseService.selectChildCategories(child_ids,function (categories) {
        for(var x = 0; x < categories.rows.length; x++){
          $scope.categories.push(categories.rows.item(x));
        }
      }, function (error) {
        //Handle error
        console.log('ERROR',error);
      });
    }
    //Initalize as empty
    $scope.categories = [];

    //Get the correct childIds and then load them from database
    var child_ids = appDataService.getCurrentCategoryIds();
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

    //Search
    $scope.showFilterBar = function () {
      var filterBarInstance = $ionicFilterBar.show({
        items: $scope.products,
        cancelText: 'Abrechen',
        update: function (filteredItems, filterText) {
          $scope.products = filteredItems;
        }
      });
    };



      //Child choice
      $scope.choice = function (child_ids, title) {
        //#TODO if user chooses something with child_ids
        console.log('has child ids');
      };

      //Product Choice
      $scope.choice_product = function (product_ids, title) {
        //#TODO: If user chooses something with product_ids
        console.log('product_ids', product_ids);
        appDataService.setCurrentTitle(title);
        appDataService.setCurrentCategoryIds(product_ids);
        appDataService.setPreviousTitle(title);
        $state.go('product_overview');
      };


      $scope.myEvent = function () {
        $state.go('start-screen');
      };

}])

.controller('bookmarkCtrl', ['$scope', '$ionicSideMenuDelegate','localStorageService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $ionicSideMenuDelegate, localStorageService) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);


  //Download bookmarks
    $scope.bookmarks = localStorageService.getBookmarkedProducts();
    if($scope.bookmarks == null){
      $ionicPopup.alert({
        title: 'No Artikels'
      });
    }

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
    };
}])

.controller('offlineStorageCtrl', ['$scope','$ionicLoading', 'FirebaseService', 'localStorageService', '$ionicSideMenuDelegate','$ionicPopup','FileService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope,$ionicLoading,FirebaseService,localStorageService,$ionicSideMenuDelegate,$ionicPopup,FileService) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    //Product Categories
    $scope.categories = [];
    //Videos
    $scope.videos = [];

    //Whether to download videos
    $scope.videoCheck = localStorageService.getVideoCheck();

    //Load Settings from local storage
    function downloadInfo() {
      var items = FirebaseService.downloadProductCategories();
      setTimeout(function () {
        for(var i = 0; i < items.length; i++){
          if($scope.categories.length < items.length){
            $scope.categories.push({item: items[i], checked: false});
          }
        }
        localStorageService.setCategories($scope.categories);
      }, 10000);

      //Store data for browsing
      localStorageService.storeAll(FirebaseService.downloadProductData());
      localStorageService.storeProductCategories(FirebaseService.downloadProductCategories());
      $scope.videos = FirebaseService.downloadVideos();
    }

    //Download Videos
    function storeVideos() {
      $scope.videos.forEach(function (video) {
        console.log('video',video);
      })
    }

    $scope.downloadVideos = function () {
      localStorageService.updateVideoCheck($scope.videoCheck);
      if($scope.videoCheck){
        storeVideos();
      }
    };

    //Actually download Files
    function downloadFiles(files) {
      var count = 0;

      //Get urls, imgs, number , zusatzinfromation , thumbnail
      $scope.show();
      files.forEach(function (j) {
        if(j != null){
          j.forEach(function (i) {
            if(i != null){
              for(k in i){
                var url = i[k].de_data.datei;
                var filename = i[k].de_data.broschurentitel;
                var path = FileService.download(url,filename,'pdfs');
                console.log(path);
                var imgUrl = i[k].de_data.datei;
                var imgFilename = count.toString() + '.jpg';
                count++;
                var thumbnail = FileService.download(imgUrl,imgFilename,'thumbnails');
                var doc = {
                  de_data : {
                    artikelnummer : i[k].de_data.artikelnummer,
                    broschurentitel : i[k].de_data.broschurentitel,
                    datei: path,
                    zusatzinformation : i[k].de_data.zusatzinformation
                  },
                  en_data: {
                    artikelnummer : i[k].en_data.artikelnummer,
                    broschurentitel : i[k].en_data.broschurentitel,
                    datei: path,
                    zusatzinformation : i[k].en_data.zusatzinformation
                  },
                  produziert_bis : i[k].produziert_bis,
                  thumbnail: thumbnail,
                  title : i[k].title
                };
                localStorageService.storeFile(doc);
              }
            }
          })
        }
      });
      $scope.hide();

    }

    //Loading functions
    $scope.show = function() {
      $ionicLoading.show({
        template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop:true,
        duration: 10000
      });
    };
    $scope.hide = function(){
      $ionicLoading.hide();
    };

    //Loading functions
    $scope.downloadShow = function() {
      $ionicLoading.show({
        template: '<p>Downloading Artikel Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop:true,
        duration: 15000
      });
    };
    $scope.downloadHide = function(){
      $ionicLoading.hide();
    };

    //Load Preferences
    $scope.preferences = localStorageService.loadOffline();
    $scope.categories = localStorageService.getCategories();

    //#TODO: Check if product info updated
    $scope.show();
    downloadInfo();

    $scope.doRefresh = function() {
      if($scope.preferences[0].checked == true) {
        $ionicPopup.alert({
            title: 'Bitte aktivieren Sie die Offline-Synchronisation'
        });
      }else {
        $scope.show();
        downloadInfo();
        // Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
      }
    };


    //Update preferences
    $scope.update = function () {
      localStorageService.updatePreferences($scope.preferences);
    };

    //Checkbox function
    $scope.downloadCategory = function (product,check) {

      //Download details based on check
      if(check){
        var files = [];
        $scope.downloadShow();
        localStorageService.checkCategory(product,check);
        var items = localStorageService.getAll();
        setTimeout(function () {
          for(var i = 0; i < product.item.child_ids.length; i++) {
            for(var j = 0; j < items.length; j++){
              if (items[j].elternelement == product.item.child_ids[i] && items[j].hasOwnProperty('product_ids')) {
                //Store files for download
                files.push(FirebaseService.downloadFiles(items[j].product_ids));
              }
            }
          }
          //Download the files
          setTimeout(function () {
            downloadFiles(files);
          },1000);
        }, 15000);


      }else {
        localStorageService.checkCategory(product,check);
      }
    };

}])

.controller('regionCtrl', ['$scope', '$ionicSideMenuDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $ionicSideMenuDelegate) {
      //Side Menu deactivated
      $ionicSideMenuDelegate.canDragContent(false);

}])

.controller('MenuCtrl', ['$scope','FirebaseService','localStorageService',
    function ($scope,FirebaseService,localStorageService) {

      var filter_headings = FirebaseService.downloadProuctFilters();
      $scope.$on('$stateChangeSuccess',function () {
          //#TODO: Get the filter groups
        }
      );

      $scope.toggleGroup = function (group) {
        group.show = !group.show;
      };
      $scope.isGroupShown = function (group) {
        return group.show;
      };
}]);
