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
  $scope.show = $rootScope.enableSettings;

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

  .controller('productOverviewCtrl', ['$scope', '$ionicFilterBar', '$state', 'StorageService','DataService','$ionicSideMenuDelegate',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope, $ionicFilterBar,$state,StorageService,DataService,$ionicSideMenuDelegate) {


    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.products = [];

    function getProducts() {
      $scope.products = DataService.downloadProducts(StorageService.getProductInfo());
      $scope.title = StorageService.getTitle();
    }

    //load Products
    getProducts();

    $scope.choice = function (product,title) {
      StorageService.detailDisplay(product);
      StorageService.storeTitle(title);
      StorageService.setLink(title + '/');
      $state.go('detailPage');
    };

  }])

.controller('product_areasCtrl', ['$scope', '$state','$ionicFilterBar','StorageService','$ionicPopover',
  function ($scope, $state,$ionicFilterBar,StorageService,$ionicPopover) {

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
    console.log($scope.products);



    $scope.choice = function (child_ids, title) {
      StorageService.storeSubCategories(child_ids);
      StorageService.storeTitle(title);
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

.controller('menuCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('videoCtrl', ['$scope', '$sce', '$ionicLoading','DataService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $sce, $ionicLoading, DataService) {

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
  $scope.videos = DataService.downloadVideos();

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

  .controller('detailPageCtrl', ['$scope', '$ionicPopover', '$sce','DataService', 'StorageService', '$ionicSideMenuDelegate','$cordovaFileTransfer', '$ionicLoading',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $ionicPopover, $sce,DataService,StorageService,$ionicSideMenuDelegate, $cordovaFileTransfer,$ionicLoading) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    $scope.title = StorageService.getTitle();
    StorageService.setLink('details/artikel/' + $scope.details.nummer + '.html');

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
    }


    //Load Details
    getDetails();

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
    //Ensure popover is ios
    document.body.classList.add('platform-ion');
  });

  function slugify(text)
  {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  $scope.sendEmail = function () {
    var link = StorageService.getLink();
    var bodyText = 'Product nummer' .concat($scope.details.nummer)
                    + ' ' + 'Referenzartikel' + ' ' .concat($scope.details.referenzartikel)
                    + ' ' .concat($scope.details.de_data.differenzierung)
                    + '' + 'Hier ist ein Link' + ' ' + link;


    window.plugin.email.open({
        to:          [''], // email addresses for TO field
        cc:          Array, // email addresses for CC field
        bcc:         Array, // email addresses for BCC field
        subject:    $scope.details.de_data.produktbezeichnung, // subject of the email
        body:       bodyText, // email body (for HTML, set isHtml to true)
        isHtml:    true // indicats if the body is HTML or plain text
      }, function () {
        console.log('email view dismissed');
      },
      this);
  };

  $scope.downloadPDF = function (url) {

    $scope.show();
    // File name only
    var filename = url.split("/").pop();

    // Save location
    var targetPath = cordova.file.externalRootDirectory + filename;

    $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
      console.log('Success');
    }, function (error) {
      console.log('Error');
    }, function (progress) {
      // PROGRESS HANDLING GOES HERE
    });
    $scope.hide();
  }


}])

.controller('productLinesCtrl', ['$scope' , '$state', 'StorageService',function ($scope,$state,StorageService) {
      $scope.products = [];

      //Child choice
      $scope.choice = function (child_ids, title) {
        StorageService.storeSubCategories(child_ids);
        StorageService.storeTitle(title);
      };

      //Product Choice
      $scope.choice_product = function (product_ids, title) {
        StorageService.storeProductInfo(product_ids);
        console.log(title);
        StorageService.storeTitle(title);
        StorageService.setLink(title + '/');
        $state.go('product_overview');
      };

      //Load the products
      function getProducts() {
        $scope.products = StorageService.loadSubCategories();
        $scope.title = StorageService.getTitle();
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

.controller('bookmarkCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

}])

.controller('offlineStorageCtrl', ['$scope','$ionicLoading', 'DataService', 'StorageService', '$ionicSideMenuDelegate','$ionicPopup','$cordovaFileTransfer',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope,$ionicLoading,DataService,StorageService,$ionicSideMenuDelegate,$ionicPopup,$cordovaFileTransfer) {

    //Side Menu
    $ionicSideMenuDelegate.canDragContent(false);

    //Product Categories
    $scope.categories = [];

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
    }

    //Actually download Files
    function downloadFiles(files) {

      //Get urls, imgs, number , zusatzinfromation , thumbnail
      files.forEach(function (j) {
        if(j != null){
          j.forEach(function (i) {
            if(i != null){
              for(k in i){
                var url = i[k].de_data.datei;

                // File name only
                var filename = url.split("/").pop();

                // Save location
                var targetPath = cordova.file.externalRootDirectory + filename;

                $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
                  console.log('Success');
                }, function (error) {
                  console.log('Error');
                }, function (progress) {
                  // PROGRESS HANDLING GOES HERE
                });

              }
            }
          })
        }
      });

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
    /**
    if($scope.preferences[0].checked == false){
      $scope.show();
      downloadInfo();
      $scope.hide();
    }**/

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

.controller('MenuCtrl', ['$scope',
    function ($scope) {
      $scope.groups = [
        {
          name: 'Funktion',
          items: [
            {name: 'Thermostat', checked: true},
            {name: 'Mischwasser', checked: false},
            {name: 'Kaltwasser', checked: false},
            {name: 'Mischwasser vorgemischt', checked: false},
            {name: 'Sensor', checked: false}
          ],
          show: false
        },
        {
          name: 'Temperatur',
          items: [
            {name: 'Thermostat', checked: true},
            {name: 'Mischwasser', checked: false},
            {name: 'Kaltwasser', checked: false},
            {name: 'Mischwasser vorgemischt', checked: false},
            {name: 'Sensor', checked: false}
          ],
          show: false
        },
        {
          name: 'Hygiene',
          items: [
            {name: 'Thermostat', checked: true},
            {name: 'Mischwasser', checked: false},
            {name: 'Kaltwasser', checked: false},
            {name: 'Mischwasser vorgemischt', checked: false},
            {name: 'Sensor', checked: false}
          ],
          show: false
        },
        {
          name: 'Energieversorgun',
          items: [
            {name: 'Thermostat', checked: true},
            {name: 'Mischwasser', checked: false},
            {name: 'Kaltwasser', checked: false},
            {name: 'Mischwasser vorgemischt', checked: false},
            {name: 'Sensor', checked: false}
          ],
          show: false
        },
        {
          name: 'Oberfläche',
          items: [
            {name: 'Thermostat', checked: true},
            {name: 'Mischwasser', checked: false},
            {name: 'Kaltwasser', checked: false},
            {name: 'Mischwasser vorgemischt', checked: false},
            {name: 'Sensor', checked: false}
          ],
          show: false
        },
        {
          name: 'Zertifizierung',
          items: [
            {name: 'Thermostat', checked: true},
            {name: 'Mischwasser', checked: false},
            {name: 'Kaltwasser', checked: false},
            {name: 'Mischwasser vorgemischt', checked: false},
            {name: 'Sensor', checked: false}
          ],
          show: false
        }];
      $scope.toggleGroup = function (group) {
        group.show = !group.show;
      };
      $scope.isGroupShown = function (group) {
        return group.show;
      };
}]);
