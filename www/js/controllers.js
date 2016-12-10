angular.module('app.controllers', [])

.controller('start_screenCtrl', ['$scope','$state','$ionicPopover','$rootScope', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $state, $ionicPopover,$rootScope) {

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
  });

  $scope.openPopover = function ($event) {
    $scope.popover.show($event);
  };


  $scope.goSettings = function () {
    $state.go('settings');
    $scope.popover.hide();
  };
}])

  .controller('productOverviewCtrl', ['$scope', '$ionicFilterBar', '$state', 'StorageService','DataService',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope, $ionicFilterBar,$state,StorageService,DataService) {
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
      $state.go('detailPage');
    };

  }])

.controller('product_areasCtrl', ['$scope', '$state','$ionicFilterBar','StorageService',
  function ($scope, $state,$ionicFilterBar,StorageService) {

    $scope.products = [];

    //Load products for local storage
    function getProducts() {
      $scope.products = StorageService.getProductCategories();
    }
    //Loading products
    getProducts();

    $scope.choice = function (child_ids, title) {
      StorageService.storeSubCategories(child_ids);
      StorageService.storeTitle(title);
      $state.go('product_lines');
    };

    $scope.showFilterBar = function () {
      var filterBarInstance = $ionicFilterBar.show({
        items: $scope.products,
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

.controller('videoCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('settingsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('countryselectCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {
  $scope.$on('$ionicView.afterEnter', function(){
    setTimeout(function(){
      document.getElementById("custom-overlay").style.display = "none";
    }, 3000);
  });

}])

  .controller('detailPageCtrl', ['$scope', '$ionicPopover', '$sce','DataService', 'StorageService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $ionicPopover, $sce,DataService,StorageService) {

    $scope.title = StorageService.getTitle();

    //The products to be show in collapsable list
    $scope.details = [];
    $scope.products = [];

    function getDetails() {
      $scope.details = StorageService.getDetails();
    }

    //Load Details
    getDetails();
    $scope.products = ([
        {
          title : 'TECHNISCHE ZEICHNUNG',
          drawing : $scope.details.media.technical_drawing_link,
          show : false
        },
        {
          title : 'LIEFERUMFANG',
          list1 : $scope.details.lieferumfang,
          show : false
        },
        {
          title : 'EINSATZBEREICH / TECHNISCHE DATEN',
          list2 : $scope.details.einsatzbereich,
          show : false
        },
        {
          title : 'DETAILS',
          details : $scope.details.werkstoff,
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
    document.body.classList.add('platform-ios');
  });




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
        StorageService.storeTitle(title);
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

.controller('offlineStorageCtrl', ['$scope','$ionicLoading', 'DataService', 'StorageService', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope,$ionicLoading,DataService,StorageService) {
    // Sync option automatically enabled
    $scope.mobileSync = false;
    $scope.autoSync = true;

    //Loading functions
    $scope.show = function() {
      $ionicLoading.show({
        template: '<p>Loading Data...</p><ion-spinner></ion-spinner>',
        animation:'fade-in',
        showBackdrop:true
      });
    };
    $scope.hide = function(){
      $ionicLoading.hide();
    };
    //#TODO: Check if mobile sync is deactivated first
    $scope.show();
    StorageService.storeAll(DataService.downloadProductData());
    StorageService.storeProductCategories(DataService.downloadProductCategories());
    $scope.hide();


}])

.controller('regionCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams) {

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
