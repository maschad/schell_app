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
      controller: 'start_screenCtrl'
    })

    .state('products', {
      url: '/product_areas',
      templateUrl: 'templates/product_areas.html',
      controller: 'product_areasCtrl'
    })
    .state('product_overview', {
      url: '/product_overview',
      templateUrl: 'templates/product_overview.html',
      controller: 'productOverviewCtrl'
    })

  .state('video', {
    url: '/video',
    templateUrl: 'templates/video.html',
    controller: 'videoCtrl'
  })

    .state('videoCategories', {
      url: '/video_categories',
      templateUrl: 'templates/video_categories.html',
      controller: 'videoCategoriesCtrl'
    })

  .state('settings', {
    cache: false,
    url: '/settings',
    templateUrl: 'templates/settings.html',
    controller: 'settingsCtrl'
  })

  .state('countryselect', {
    url: '/country_select',
    templateUrl: 'templates/countryselect.html',
    controller: 'countryselectCtrl'
  })

  .state('product_lines', {
    url: '/product_lines',
    templateUrl: 'templates/product_lines.html',
    controller: 'productLinesCtrl'
  })


  .state('detailPage', {
    cache: false,
    url: '/detail_page',
    templateUrl: 'templates/detailPage.html',
    controller: 'detailPageCtrl'

  })

    .state('searchPage', {
      url: '/search_page',
      templateUrl: 'templates/search_page.html',
      controller: 'searchPageCtrl'
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
    cache: false,
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
