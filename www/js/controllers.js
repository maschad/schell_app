angular.module('app.controllers', [])

  .controller('start_screenCtrl', ['$scope', '$state', 'DatabaseService', 'FirebaseService', 'localStorageService', '$ionicLoading', '$ionicPopup', '$ionicPopover', '$rootScope', '$ionicSideMenuDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $state, DatabaseService, FirebaseService, localStorageService, $ionicLoading, $ionicPopup, $ionicPopover, $rootScope, $ionicSideMenuDelegate) {
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


  //Whether to allow settings based on network connection
  $scope.show = $rootScope.internet;

  //If there is internet, populate the DB with latest data, else, work with what is in database
  if($rootScope.internet){
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
      DatabaseService.selectProducts(product_ids, function (products) {
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
      appDataService.setCurrentTitle(title);
      appDataService.setCurrentProduct(product);
      appDataService.appendEmailLink('details/artikel/'.concat(title + '.html'));
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
      appDataService.appendEmailLink(title + '/');
      appDataService.setFilterIds(filter_ids);
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


.controller('videoCtrl', ['$scope', '$rootScope','$sce','$ionicSideMenuDelegate', 'FirebaseService','FileService','$ionicLoading','$ionicPopup','localStorageService','DatabaseService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope,$rootScope, $sce,$ionicSideMenuDelegate, FirebaseService,FileService,$ionicLoading,$ionicPopup,localStorageService,DatabaseService) {
    //Initialize empty array
  $scope.videos = [];

  //Loading functions
  $scope.show = function() {
    $ionicLoading.show({
      template: '<p>Downloading Videos...</p><ion-spinner></ion-spinner>',
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
    DatabaseService.selectAllVideos(function (videos) {
      for (var x = 0; x < videos.rows.length; x++) {
        $scope.videos.push(videos.rows.item(x));
      }
      $scope.hide();
    });
    if (!$rootScope.internet) {
      var vids = localStorageService.getAllVideoPaths();
      if (vids == null) {
        $ionicPopup.alert({
          title: 'Keine Videos heruntergeladen'
        });
      } else {
        for (var x = 0; x < $scope.videos.length; x++) {
          $scope.videos[x].videofile_de = vids[x];
        }
      }
    }
  }

  //Load Videos
  loadVideos();


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

  .controller('detailPageCtrl', ['$scope', '$rootScope','$ionicPopover', '$sce','FirebaseService','appDataService', 'localStorageService','DatabaseService', '$ionicSideMenuDelegate', '$ionicLoading','$ionicPopup', '$cordovaInAppBrowser',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope,$rootScope, $ionicPopover, $sce,FirebaseService,appDataService,localStorageService, DatabaseService,$ionicSideMenuDelegate,$ionicLoading,$ionicPopup,$cordovaInAppBrowser) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    //The products to be show in collapsible list
    $scope.files = [];

    //Videos for that corresponding product
    $scope.videos = [];

    //Set details
    $scope.details = appDataService.getCurrentProduct();

    //Function to load files
    function getFiles(download_ids) {
      DatabaseService.selectDownloads(download_ids, function (downloads) {
        for(var x = 0; x < downloads.rows.length; x++){
          $scope.files.push(downloads.rows.item(x));
        }
      })
    }

    function getVideos(video_ids) {
      //#TODO: Check for internet, if no internet, get video paths from local storage
      DatabaseService.selectVideos(video_ids, function(videos){
        for(var x = 0; x < videos.rows.length; x++){
          $scope.videos.push(videos.rows.item(x));
        }
      })
    }

    //Load Downloads and videos
    if($scope.details.download_ids != ''){
      getFiles($scope.details.download_ids);
    }
    if($scope.details.video_ids != ''){
      getVideos($scope.details.video_ids);
    }

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
    $scope.bookmark = function ($event) {
      $ionicPopup.alert({
        title: 'Seite bookmarkiert'
      });
      localStorageService.bookmarkProduct($scope.details);
    };

    //Download Function
    $scope.download = function ($event) {
      $ionicPopup.alert({
        title: 'Möchten Sie diesen Artikel offline speichern?',
        cssClass: 'download-popup',
        okText: 'Offline verfügbar machen'
      });
      // localStorageService.downloadProduct($scope.details);
    };

    //Download PDF
    $scope.showPDF = false;
    $scope.downloadPDF = function (file) {
      $scope.pdfUrl = file.datei_de;
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
          url : '',
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
    var link = appDataService.getEmailLink();
    console.log('website link', link);
    var bodyText = 'Product nummer ' .concat($scope.details.nummer)
                    + ' ' + 'Referenzartikel ' + ' ' .concat($scope.details.referenzartikel)
                    + ' ' .concat($scope.details.differenzierung)
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

.controller('productLinesCtrl', ['$scope','$ionicLoading','$ionicFilterBar', '$state', 'localStorageService','DatabaseService','appDataService','$ionicPopover',
  function ($scope,$ionicLoading,$ionicFilterBar,$state,localStorageService,DatabaseService,appDataService,$ionicPopover) {
    //Set the titles and initialize empty array of filters
    $scope.title = appDataService.getCurrentTitle();
    $scope.root = appDataService.getRootTitle();
    $scope.filter_ids = [];

    //Loading functions
    $scope.show = function() {
      $ionicLoading.show({
        template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop:true,
        duration: 2000
      });
    };
    //Hide function
    $scope.hide = function(){
      $ionicLoading.hide();
    };


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

    //Initialize as empty
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
        //If user chooses something with child ids
        $scope.categories = [];
        loadSubCategories(child_ids);
        appDataService.setCurrentTitle(title);
        appDataService.appendEmailLink(title.concat('/'));
        $scope.title = title;
        $state.reload();
      };

      //Product Choice
      $scope.choice_product = function (product_ids, title) {
        // If user chooses something with product_ids
        appDataService.setCurrentTitle(title);
        appDataService.setCurrentCategoryIds(product_ids);
        appDataService.setPreviousTitle(title);
        appDataService.appendEmailLink(title.concat('/'));
        $state.go('product_overview');
      };


      $scope.myEvent = function () {
        $state.go('start-screen');
      };


    //When user selects new filter
    $scope.$on('new-filter-uid', function () {
      var all_product_ids = [];
      $scope.filter_ids = appDataService.getCurrentSelectedFilterIds();
      var at_bottom_level = false;

      $scope.categories.forEach(function (category) {
        at_bottom_level = category.hasOwnProperty('product_ids');
        //iterate to bottom level, get products then filters,
        // correspond those filters with the current selected filters, then subtract
        // artikel length from the category based on that.


      })

    });

}])

.controller('bookmarkCtrl', ['$scope', '$state','$ionicPopup', '$ionicSideMenuDelegate','localStorageService', 'appDataService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope,$state, $ionicPopup, $ionicSideMenuDelegate, localStorageService,appDataService) {

  //Side Menu
  $ionicSideMenuDelegate.canDragContent(false);


  //Download bookmarks
    $scope.bookmarks = localStorageService.getBookmarkedProducts();
    if($scope.bookmarks == null){
      $ionicPopup.alert({
        title: 'No Artikels'
      });
    }

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
      console.log('calling delete');
      localStorageService.removeBookmarkedProduct(bookmark);
      $ionicPopup.alert({
        title: 'Artikel Entfernt'
      });
      $state.reload();
    };
}])

.controller('offlineStorageCtrl', ['$scope','$ionicLoading', 'FirebaseService', 'localStorageService', 'DatabaseService','FileService','$ionicSideMenuDelegate','$ionicPopup',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope,$ionicLoading,FirebaseService,localStorageService,DatabaseService,FileService,$ionicSideMenuDelegate,$ionicPopup) {

    //Disable Side Menu
    $ionicSideMenuDelegate.canDragContent(false);


    //Video File size
    $scope.total_video_size = 0;

    //Initialize as empty
    $scope.videos = [];

    //Preferences as empty
    $scope.preferences = [];


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

    //Loading functions
    $scope.downloadShow = function() {
      $ionicLoading.show({
        template: '<p>Downloading Artikel Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop:true
      });
    };
    //Hide
    $scope.downloadHide = function(){
      $ionicLoading.hide();
    };


    //Function to load the data on the screen
    function loadData() {
      $scope.show();
      DatabaseService.selectAllVideos(function (videos) {
        var mbTotal = 0;
        for (var x = 0; x < videos.rows.length; x++) {
          $scope.videos.push(videos.rows.item(x));
          mbTotal += videos.rows.item(x).filesize;
        }
        $scope.total_video_size = mbTotal / 100000000;
      });
      //Assign preferences
      $scope.preferences = localStorageService.getOfflinePreferences();
      //Product Categories
      var items = [];
      DatabaseService.selectTopCategories(function (categories) {
        for(var x = 0; x < categories.rows.length; x++){
          items.push(categories.rows.item(x));
        }
        $scope.hide();
        //Compare against local storage and most recent update of storage to remember what user checked
        if ($scope.preferences[2].downloaded_categories.length < items.length) {
          for (var i = 0; i < items.length; i++) {
            $scope.preferences[2].downloaded_categories.push({item: items[i], checked: false});
          }
        }
      }, function (error) {
        //#TODO:Handle error
        console.log('ERROR',error);
      });

      //Update to show selected categories
      localStorageService.updatePreferences($scope.preferences);
    }

    //Call the function on startup
    loadData();

    function getProductIds(child_ids, product_ids) {

      DatabaseService.selectChildCategories(child_ids, function (children) {
        for (var x = 0; x < children.rows.length; x++) {
          if (children.rows.item(x).hasOwnProperty('product_ids')) {
            product_ids.push(children.rows.item(x).product_ids);
          } else {
            return getProducts(children.rows.item(x).child_ids, product_ids);
          }
        }
      });
      console.log('product ids', product_ids);
      return product_ids;
    }

    //Function to download videos
    $scope.downloadVideos = function () {
      //If checked
      if ($scope.preferences[3].download_videos) {
        for (var x = 0; x < $scope.videos.length; x++) {
          $scope.downloadShow();
          console.log('video title', $scope.videos[x].title);
          var uid = $scope.videos[x].uid;
          FileService.download($scope.videos[x].videofile_de, $scope.videos[x].title, 'videos', function (file_path) {
            console.log('filepath', file_path);
            console.log('uid', uid);
            localStorageService.setVideoPath(uid, file_path);
            $scope.downloadHide();
          });
        }
        localStorageService.updatePreferences($scope.preferences);
      } else {
        localStorageService.updatePreferences($scope.preferences);
      }
    };

    //Check to download selected category
    $scope.downloadCategory = function (category, check) {

      //Download details based on check
      if (check) {
        //#TODO: Download files for that category

        // The product Ids to download
        var product_ids = [];
        product_ids = getProductIds(category.item.child_ids, product_ids);
        console.log('child_ids  of category', category.item.child_ids);
        localStorageService.updatePreferences($scope.preferences);

      } else {
        localStorageService.updatePreferences($scope.preferences);
      }
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

.controller('regionCtrl', ['$scope', '$ionicSideMenuDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $ionicSideMenuDelegate) {
      //Side Menu deactivated
      $ionicSideMenuDelegate.canDragContent(false);

}])

  .controller('MenuCtrl', ['$scope', '$rootScope', 'FirebaseService', 'localStorageService', 'appDataService',
    function ($scope, $rootScope, FirebaseService, localStorageService, appDataService) {

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
