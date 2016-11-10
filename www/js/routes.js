angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('tabsController.start-screen', {
    url: '/start-screen',
    views: {
      'start-screen': {
        templateUrl: 'templates/start_screen.html',
        controller: 'start_screenCtrl'
      }
    }
  })

  .state('tabsController.products', {
    url: '/product-areas',
    views: {
      'product-areas': {
        templateUrl: 'templates/products.html',
        controller: 'productsCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/tab',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('video', {
    url: '/video',
    templateUrl: 'templates/video.html',
    controller: 'videoCtrl'
  })

  .state('settings', {
    url: '/settings',
    templateUrl: 'templates/settings.html',
    controller: 'settingsCtrl'
  })

  .state('countryselect', {
    url: '/country_select',
    templateUrl: 'templates/countryselect.html',
    controller: 'countryselectCtrl'
  })

  .state('tabsController.detailPage', {
    url: '/detail_page',
    views: {
      'tab1': {
        templateUrl: 'templates/detailPage.html',
        controller: 'detailPageCtrl'
      }
    }
  })

  .state('tabsController.bookmark', {
    url: '/bookmark_list_detail',
    views: {
      'tab3': {
        templateUrl: 'templates/bookmark.html',
        controller: 'bookmarkCtrl'
      }
    }
  });

$urlRouterProvider.otherwise('/country_select')



});
