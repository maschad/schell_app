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
      console.log('slide start');
    });

    swiper.on('onSlideChangeEnd', function () {
      console.log('slide end');
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

  .controller('productsCtrl', ['$scope', '$ionicFilterBar', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $ionicFilterBar) {

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

      console.log($scope.products);


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

  .controller('detailPageCtrl', ['$scope', '$ionicPopover', '$sce',  // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $ionicPopover, $sce) {

      //The products to be show in collapsable list
  $scope.products = [
    {
      name: 'TECHNISCHE ZEICHNUNG',
      data: '<img src="img/technical-drawing.png">',
      show: false
    },
    {
      name: 'LIEFERUMFANG',
      data: ['Paneel mit vormontierter LINUS ' +
      'Duscharmatur mit integrerter Selbstschlusskartusche SC' +
      ' inklusive Verrohrung zwischen' +
      ' Armatur und Duschkopfanschluss',
        'Betätigungsknopf SC',
        '2 Rückflussverhinderer (RV, DIN EN 1717: EB)',
        'Duschkopf: Durchfluss 9 l/min druckunabhängig',
        'Befestigungsmaterial',
        'Anschlusszubehör'],
      show: false
    },
    {
      name: 'EINSATZBEREICH / TECHNISCHE DATEN:',
      data: ['Durchfluss Armatur: ' +
      '≤ 10,0 l/min bei 3bar Fließdruck',
        'Fließdruck: 1,5 - 5,0 bar',
        'Warmwassertemperatur max. 70 °C (Kurzzeitnutzung)',
        'Laufzeiteinstellung: 5 - 30 s',
        'Abmessung: 1200 mm x 226 mm x 115 mm'],
      show: false
    },
    {
      name: 'DETAILS',
      data: ['Werkstoff: Paneel aus Alu / Wasserstrecke aus entzinkungsbeständigem ' +
      'Messing konform TrinkwV /' +
      ' Betätigung aus Messing verchromt',
        'Oberfläche: Alu-eloxiert'],
      show: false
    },
    {
      name: 'DOWNLOADS',
      data: ['download data'],
      show: false
    },
    {
      name: 'VARIANTEN',
      data: ['item body'],
      show: false
    },
    {
      name: 'EMPFOHLENE ZUGEHÖRIGE ARTIKEL',
      data: '',
      show: false
    },
    {
      name: 'VIDEO',
      data: 'https://www.youtube.com/v/yDvws-yl_Ew',
      show: false
    }

  ];
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

.controller('productLinesCtrl', ['$scope' , '$state', function ($scope,$state) {
      $scope.content = {
        title: 'DUSCHE'
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
