angular.module('app.controllers', [])

.controller('start_screenCtrl', ['$scope','$state','$ionicPopover', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $state, $ionicPopover,$stateParams) {

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

.controller('productsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


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

.controller('detailPageCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('bookmarkCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

}])

  .controller('MenuCtrl', ['$scope',
    function ($scope) {

      $scope.show = false;
      $scope.toggleGroup = function (group) {
        $scope.show = !$scope.show;
      };
      $scope.isGroupShown = function (group) {
        return $scope.show;
      };
}]);
