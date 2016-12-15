angular.module('app.controllers', [])

.controller('start_screenCtrl', ['$scope','$state','$ionicPopover','$rootScope','$ionicSideMenuDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $state, $ionicPopover,$rootScope,$ionicSideMenuDelegate) {
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

  .controller('productOverviewCtrl', ['$scope', '$ionicFilterBar', '$state', 'StorageService','DataService','$ionicPopover',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope, $ionicFilterBar,$state,StorageService,DataService,$ionicPopover) {

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

    //Popover function
    $ionicPopover.fromTemplateUrl('templates/breadcrumb.html', {
      scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
        //Ensure popover is ios
        document.body.classList.remove('platform-ios');
        document.body.classList.add('platform-android');
    });



    $scope.products = [];

    function getProducts() {
      $scope.products = DataService.downloadProducts(StorageService.getProductInfo());
      $scope.title = StorageService.getTitle();
      $scope.root = StorageService.getRoot();
      $scope.prev = $scope.title;
    }

    //load Products
    getProducts();

    $scope.choice = function (product,title) {
      StorageService.detailDisplay(product);
      StorageService.storeTitle(title);
      StorageService.storePrev($scope.title);
      StorageService.setLink(title + '/');
      $state.go('detailPage');
    };

  }])

.controller('product_areasCtrl', ['$scope', '$state','$ionicFilterBar','StorageService','$ionicPopover','$ionicSideMenuDelegate',
  function ($scope, $state,$ionicFilterBar,StorageService,$ionicPopover,$ionicSideMenuDelegate) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.products = [];

    //Popover function
    $ionicPopover.fromTemplateUrl('templates/breadcrumb.html', {
      scope: $scope
    }).then(function (popover) {
      $scope.popover = popover;
      //Ensure popover is android
      document.body.classList.remove('platform-ios');
      document.body.classList.add('platform-android');
    });

    //Load products for local storage
    function getProducts() {
      $scope.products = StorageService.getProductCategories();
    }
    //Loading products
    getProducts();


    $scope.choice = function (child_ids, title,filter_ids) {
      StorageService.storeSubCategories(child_ids);
      StorageService.storeTitle(title);
      StorageService.storeRoot(title);
      StorageService.storeFilterIds(filter_ids);
      StorageService.setLink(title + '/');
      $state.go('product_lines');
    };

    $scope.showFilterBar = function () {
      var filterBarInstance = $ionicFilterBar.show({
        items: $scope.products,
        cancelText: 'Abrechen',
        update: function (filteredItems, filterText) {
          $scope.products = filteredItems;
        }
      });
    };


  }])


.controller('videoCtrl', ['$scope', '$sce','$ionicSideMenuDelegate', 'DataService','FileService','$ionicLoading','$ionicPopup','StorageService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $sce,$ionicSideMenuDelegate, DataService,FileService,$ionicLoading,$ionicPopup,StorageService) {


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
  if(DataService.downloadVideos() != null){
    $scope.videos = DataService.downloadVideos();
    $scope.hide();
  }else{
    $scope.videos = StorageService.loadVideos();
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

.controller('countryselectCtrl', ['$scope', '$ionicSideMenuDelegate','StorageService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $ionicSideMenuDelegate,StorageService) {
  //Side Menu
  $ionicSideMenuDelegate.canDragContent(false);


  $scope.$on('$ionicView.afterEnter', function(){
    setTimeout(function(){
      document.getElementById("custom-overlay").style.display = "none";
    }, 3000);
  });


  $scope.selection = function (country) {
    StorageService.setCountry(country);

  }

}])

  .controller('detailPageCtrl', ['$scope', '$rootScope','$ionicPopover', '$sce','DataService', 'StorageService', '$ionicSideMenuDelegate','$cordovaFileTransfer', '$ionicLoading','$ionicPopup',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope,$rootScope, $ionicPopover, $sce,DataService,StorageService,$ionicSideMenuDelegate, $cordovaFileTransfer,$ionicLoading,$ionicPopup) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.title = StorageService.getTitle();
    $scope.prev = StorageService.getPrev();
    $scope.root = StorageService.getRoot();
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

    //The products to be show in collapsable list
    $scope.details = [];
    $scope.products = [];
    $scope.files = [];

    function getDetails() {
      $scope.details = StorageService.getDetails();
      if($scope.details.media.download_ids){
        $scope.files = DataService.downloadFiles($scope.details.media.download_ids);
      }
      if($rootScope.internet == false){
        if($scope.details.media.download_ids) {
          $scope.files = StorageService.getFile($scope.details.media.download_ids);
        }
      }

    }

    //Bookmark Function
    $scope.bookmark = function () {
      StorageService.bookmark($scope.details);
      $ionicPopup.alert({
        title: 'Seite bookmarkiert'
      });
    };

    //Download PDF
    $scope.showPDF = false;
    $scope.downloadPDF = function (f) {
      $scope.pdfUrl = f.de_data.datei;
      $scope.showPDF = true;
      window.open($scope.pdfUrl, '_blank');
    };

    //Load Details
    getDetails();

    //Build up link
    StorageService.setLink('details/artikel/' + $scope.details.nummer + '.html');


      $scope.products = ([
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
    var link = StorageService.getLink();
    var bodyText = 'Product nummer' .concat($scope.details.nummer)
                    + ' ' + 'Referenzartikel' + ' ' .concat($scope.details.referenzartikel)
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
    }
    console.log(bodyText);
  };


}])

.controller('productLinesCtrl', ['$scope','$ionicFilterBar', '$state', 'StorageService','$ionicPopover',function ($scope,$ionicFilterBar,$state,StorageService,$ionicPopover) {

      //Popover function
      $ionicPopover.fromTemplateUrl('templates/breadcrumb.html', {
        scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
        //Ensure popover is android
        document.body.classList.remove('platform-ios');
        document.body.classList.add('platform-android');
      });
      $scope.products = [];

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
        StorageService.storeSubCategories(child_ids);
        StorageService.storeTitle(title);
        StorageService.storePrev(title);
      };

      //Product Choice
      $scope.choice_product = function (product_ids, title) {
        StorageService.storeProductInfo(product_ids);
        StorageService.storeTitle(title);
        StorageService.setLink(title + '/');
        $state.go('product_overview');
      };

      //Load the products
      function getProducts() {
        $scope.products = StorageService.loadSubCategories();
        $scope.title = StorageService.getTitle();
        //For breadcrumb
        $scope.root = $scope.title;
      }

      //Load the products
      getProducts();


    $scope.content = {
        title: $scope.title
    };

    $scope.myEvent = function () {
      $state.go('start-screen');
    };

}])

.controller('bookmarkCtrl', ['$scope', '$ionicSideMenuDelegate','StorageService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $ionicSideMenuDelegate, StorageService) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);


  //Download bookmarks
    $scope.bookmarks = StorageService.getBookmarks();
    if($scope.bookmarks == null){
      $ionicPopup.alert({
        title: 'No Artikels'
      });
    }

    $scope.deleteBookmark = function (bookmark) {
      StorageService.removeBookmark(bookmark);
      $ionicPopup.alert({
        title: 'Artikel Entfernt'
      });
    };
}])

.controller('offlineStorageCtrl', ['$scope','$ionicLoading', 'DataService', 'StorageService', '$ionicSideMenuDelegate','$ionicPopup','FileService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope,$ionicLoading,DataService,StorageService,$ionicSideMenuDelegate,$ionicPopup,FileService) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    //Product Categories
    $scope.categories = [];
    //Videos
    $scope.videos = [];

    //Whether to download videos
    $scope.videoCheck = StorageService.getVideoCheck();

    //Load Settings from local storage
    function downloadInfo() {
      var items = DataService.downloadProductCategories();
      setTimeout(function () {
        for(var i = 0; i < items.length; i++){
          if($scope.categories.length < items.length){
            $scope.categories.push({item: items[i], checked: false});
          }
        }
        StorageService.setCategories($scope.categories);
      }, 10000);

      //Store data for browsing
      StorageService.storeAll(DataService.downloadProductData());
      StorageService.storeProductCategories(DataService.downloadProductCategories());
      $scope.videos = DataService.downloadVideos();
    }

    //Download Videos
    function storeVideos() {
      $scope.videos.forEach(function (video) {
        console.log('video',video);
      })
    }

    $scope.downloadVideos = function () {
      StorageService.updateVideoCheck($scope.videoCheck);
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
                StorageService.storeFile(doc);
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
    $scope.preferences = StorageService.loadOffline();
    $scope.categories = StorageService.getCategories();

    //#TODO: Check if product info updated

    if($scope.preferences[0].checked == false){
      $scope.show();
      downloadInfo();
    }

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
      StorageService.updatePreferences($scope.preferences);
    };

    //Checkbox function
    $scope.downloadCategory = function (product,check) {

      //Download details based on check
      if(check){
        var files = [];
        $scope.downloadShow();
        StorageService.checkCategory(product,check);
        var items = StorageService.getAll();
        setTimeout(function () {
          for(var i = 0; i < product.item.child_ids.length; i++) {
            for(var j = 0; j < items.length; j++){
              if (items[j].elternelement == product.item.child_ids[i] && items[j].hasOwnProperty('product_ids')) {
                //Store files for download
                files.push(DataService.downloadFiles(items[j].product_ids));
              }
            }
          }
          //Download the files
          setTimeout(function () {
            downloadFiles(files);
          },1000);
        }, 15000);


      }else {
        StorageService.checkCategory(product,check);
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

.controller('MenuCtrl', ['$scope','DataService','StorageService',
    function ($scope,DataService,StorageService) {

      var filter_headings = DataService.downloadProuctFilters();
      $scope.$on('$stateChangeSuccess',function () {
          $scope.groups = StorageService.getFilterGroups(filter_headings);
        }
      );

      $scope.toggleGroup = function (group) {
        group.show = !group.show;
      };
      $scope.isGroupShown = function (group) {
        return group.show;
      };
}]);
