// Schell App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

// Initialize db to
var db = null;


angular.module('app', ['ionic', 'jett.ionic.filter.bar', 'ngSanitize', 'ngStorage','ion-floating-menu', 'ksSwiper','ngCordova', 'app.controllers', 'app.filters', 'app.routes', 'app.directives', 'app.services'])

.config(function($ionicConfigProvider, $sceDelegateProvider,$ionicFilterBarConfigProvider){
  $ionicConfigProvider.backButton.previousTitleText(false).text('');
  $ionicConfigProvider.views.swipeBackEnabled(false);
  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);
  $ionicFilterBarConfigProvider.theme('light');

})

.run(function($ionicPlatform, $cordovaSQLite,$ionicPopup,$rootScope,$state,localStorageService) {
  //Set internet to true
  $rootScope.internet = true;
  $rootScope.showDownload = false;

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      //Make the app full screen
      // org.apache.cordova.statusbar required
      // StatusBar.styleDefault();
      // StatusBar.overlaysWebView(false);
      ionic.Platform.fullScreen(true, false);
    }

    //Check for internet
    if(window.Connection) {
      if (navigator.connection.type == Connection.NONE) {
        //Set internet Variable to false
        $rootScope.internet = false;
        $ionicPopup.alert({
          title: "Es besteht keine Verbindung zum Internet. Produktinformationen sind nur Offline verfügbar und ggf. nicht aktuell."
        });
        //#TODO: Handle DB loading.
      }else{
        //Update all of DB
        db = $cordovaSQLite.openDB({"name" : "schell.db", "location" : "default"});
        var lastUpdated = localStorageService.getLastUpdated();
        if (lastUpdated) {
          var shouldUpdate = (Date.now() - lastUpdated) > 86400000 //We should update if we haven't in more than 24 hours..
        } else {
          var shouldUpdate = true;
        }
        if (shouldUpdate) {
          clearDatabase(db, $cordovaSQLite);
          createTables(db, $cordovaSQLite);
        }
      }
    }

    if(localStorageService.getCountry()){
      $state.go('start-screen');
    }


  });
});

function clearDatabase(db, $cordovaSQLite) {
  console.log("Deleting tables...");
  $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS products");
  $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS product_categories");
  $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS awards");
  $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS downloads");
  $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS videos");
  $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS video_categories");
  $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS b_artikel_zubehoer");
  $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS c_language");
}
function createTables(db, $cordovaSQLite) {
  console.log("Creating tables...");
  $cordovaSQLite.execute(db, "CREATE TABLE products (uid INTEGER PRIMARY KEY, nummer TEXT, referenzartikel TEXT, produktbezeichnung_de TEXT, zusatz1_de TEXT, zusatz2_de TEXT, beschreibung_de TEXT, differenzierung_de TEXT,lieferumfang_de TEXT, einsatzbereich_de TEXT, werkstoff_de TEXT, geraeuschklasse_de TEXT, pruefzeichen_de TEXT, dimension_de TEXT,oberflaeche_de TEXT, verpackungseinheit TEXT, gewicht TEXT, image_landscape TEXT, image_landscape_filesize INTEGER, image_portrait TEXT, image_portrait_filesize INTEGER, technical_drawing_link TEXT, technical_drawing_filesize INTEGER, filter_ids TEXT, download_ids TEXT, video_ids TEXT, produktbezeichnung_en TEXT, zusatz1_en TEXT, zusatz2_en TEXT, beschreibung_en TEXT, differenzierung_en TEXT, lieferumfang_en TEXT, einsatzbereich_en TEXT, werkstoff_en TEXT, geraeuschklasse_en TEXT,pruefzeichen_en TEXT,dimension_en TEXT, oberflaeche_en TEXT , varianten TEXT, designpreis TEXT, b_artikel_id INTEGER, permalink TEXT, hinweise_notes TEXT)");

  $cordovaSQLite.execute(db, "CREATE TABLE product_categories (uid INTEGER PRIMARY KEY,	title_de TEXT, elternelement INTEGER, produkte TEXT, bild TEXT, downloads TEXT, child_ids TEXT, sorting INTEGER, product_ids TEXT, filter_ids TEXT, download_ids TEXT, title_en TEXT)");

  $cordovaSQLite.execute(db, "CREATE TABLE downloads (uid INTEGER PRIMARY KEY, thumbnail TEXT, 	artikelnummer_de TEXT, broschurentitel_de TEXT, zusatzinformation_de TEXT, datei_de TEXT,	produziert_bis TEXT, artikelnummer_en TEXT, broschurentitel_en TEXT, zusatzinformation_en TEXT, datei_en TEXT, filesize INTEGER, title TEXT, category TEXT)");

  $cordovaSQLite.execute(db, "CREATE TABLE videos (uid INTEGER PRIMARY KEY, title TEXT, startimage_de TEXT, videofile_de TEXT, information_de TEXT, startimage_en TEXT,	videofile_en TEXT, information_en TEXT, filesize INTEGER, youtube_de TEXT, youtube_en TEXT, category INTEGER)");

  $cordovaSQLite.execute(db, "CREATE TABLE video_categories (uid INTEGER PRIMARY KEY, title_de TEXT, title_en TEXT)");

  $cordovaSQLite.execute(db, "CREATE TABLE awards (uid INTEGER PRIMARY KEY, titel TEXT,	logo TEXT)");

  $cordovaSQLite.execute(db, "CREATE TABLE b_artikel_zubehoer (b_artikel_zubehoer_id INTEGER PRIMARY KEY,  b_artikel_id INTEGER, lfdnr INTEGER, status INTEGER, recordstatus INTEGER, pos_b_artikel_id INTEGER , verknuepfung INTEGER , data TEXT)");

  $cordovaSQLite.execute(db, "CREATE TABLE c_language (c_language_id INTEGER PRIMARY KEY, recordstatus INTEGER, table_id INTEGER, tablename TEXT, fieldname TEXT, langcode TEXT, content TEXT)")
}
