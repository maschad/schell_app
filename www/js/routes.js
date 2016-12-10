angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('start-screen', {
      url: '/start-screen',
      templateUrl: 'templates/start_screen.html',
      controller: 'start_screenCtrl',
      ncyBreadcrumb: {
        label: 'Home'
      }
    })

    .state('products', {
      url: '/product_areas',
      templateUrl: 'templates/product_areas.html',
      controller: 'product_areasCtrl',
      ncyBreadcrumb: {
        label: 'Products'
      }
    })
    .state('product_overview', {
      url: '/product_overview',
      templateUrl: 'templates/product_overview.html',
      controller: 'productOverviewCtrl',
      ncyBreadcrumb: {
        label: 'Overview'
      }
    })

  .state('video', {
    url: '/video',
    templateUrl: 'templates/video.html',
    controller: 'videoCtrl',
    ncyBreadcrumb: {
      label: 'video'
    }
  })

  .state('settings', {
    url: '/settings',
    templateUrl: 'templates/settings.html',
    controller: 'settingsCtrl',
    ncyBreadcrumb: {
      label: 'settings'
    }
  })

  .state('countryselect', {
    url: '/country_select',
    templateUrl: 'templates/countryselect.html',
    controller: 'countryselectCtrl',
    ncyBreadcrumb: {
      label: 'Country'
    }
  })

  .state('product_lines', {
    url: '/product_lines',
    templateUrl: 'templates/product_lines.html',
    controller: 'productLinesCtrl',
    ncyBreadcrumb: {
      label: 'Lines'
    }
  })


  .state('detailPage', {
    url: '/detail_page',
    templateUrl: 'templates/detailPage.html',
    controller: 'detailPageCtrl',
    ncyBreadcrumb: {
      label: 'Details'
    }

  })

  .state('bookmark', {
    url: 'bookmark',
    templateUrl: 'templates/bookmark.html',
    controller: 'bookmarkCtrl',
    ncyBreadcrumb: {
      label: 'Bookmark'
    }
  })

  .state('offline_storage', {
    url: 'offlineStorage',
    templateUrl: 'templates/offline_storage.html',
    controller: 'offlineStorageCtrl',
    ncyBreadcrumb: {
      label: 'Offline Settings'
    }
   })

  .state('region', {
    url: 'region',
    templateUrl: 'templates/region.html',
    controller: 'regionCtrl',
    ncyBreadcrumb: {
      label: 'Regional Settings'
    }
  });

$urlRouterProvider.otherwise('/country_select')



});
