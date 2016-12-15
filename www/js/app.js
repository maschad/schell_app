// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'jett.ionic.filter.bar', 'ngSanitize', 'ngStorage','ion-floating-menu', 'ksSwiper','ngCordova', 'app.controllers', 'app.routes', 'app.directives', 'app.services'])

.config(function($ionicConfigProvider, $sceDelegateProvider,$ionicFilterBarConfigProvider){
  $ionicConfigProvider.backButton.previousTitleText(false).text('');
  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);
  $ionicFilterBarConfigProvider.theme('light');

})

.run(function($ionicPlatform,$ionicPopup,$rootScope,$state,StorageService) {
  //Set internet to true
  $rootScope.internet = true;


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    //Check for internet
    if(window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: "Internet Disconnected",
          content: "The internet is disconnected on your device. Settings will be disabled"
        })
          .then(function (result) {
            if (!result) {
              $rootScope.internet = false;
            }
          });
      }
    }

    if(StorageService.checkCountry()){
      $state.go('start-screen');
    }



  });
});
