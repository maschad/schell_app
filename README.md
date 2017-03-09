Setup
Test your app
Change the Server Url
Change the app name
Change AdMob setting
Change App Icon and Splash Screen
Change side menus
Use tab version
App showcase
Rating
A) Setup - top

First you will need to have Ionic installed in your environment. Please refer to the Ionic offical installation documentation in order to install Ionic and cordova: http://ionicframework.com/docs/guide/installation.html
Run npm install in order to install all the node modules required by the app.
Run bower install in order to install all the javascript libraries required by the app.
This project uses Sass so make sure you setup your project to use Sass by running ionic setup sass, more detail here.
Run ionic state restore --plugins in order to install all cordova plugins 
(NOTE: The app used cordova-plugin-facebook4 plugin to work with facebook API, you should change APP_ID & APP_NAME in package.json to your facebook app then run restore plugin command)
B) Test your app - top

Now we have everything installed, we can test the app.

Run ionic serve to start a local dev server and watch/compile Sass to CSS. This will start a live-reload server for your project. When changes are made to any HTML, CSS, or JavaScript files, the browser will automatically reload when the files are saved. 

Go here to learn how to test your app like a Native app on iOS and Android devices or emulators.

C) Change the server URL - top

Open www > js > config.js
Change apiUrl in appConfig
D) Change the app name - top

To change the app name:

Go to config.xml
Find the line
<name>yovideo-ionic</name>
and change the name of the app by replacing the default "YoVideo" with your desired name.
E) Change AdMob setting - top

To change the AdMob id:

Go to www > js > app.js
Change admobid_ios and admobid_android in appConfig
You can find an example how to use admob at www > js > controllers.js line 539
F) Change App Icon and Splash Screen - top

Go to resources folder.
Replace icon.png to change app icon.
Replace splash.png to change splash screen.
Run ionic resources in order to recreate app icon and splash screen.
More detail check here
G) Change side menus - top

Go to www > templates > menu.html.
You can change or add new item to side menu (Support App Link: About us, Term and Conditions. Share app function. Rate app function).
H) Use tab version - top

You can use tab layout instead of side menu layout. The code is in tab_version folder.

I) App Showcase - top

Once you will publish your app to Google Play or any other Android store, send us your app link. We will happy to showcase your app into our website & CodeCanyon page.

J) Rating - top

If you like our app, we will highly appreciate if you can provide us a rating of 5. You can rate us from your CodeCanyon Menu > Download page.

Once again, thank you so much for purchasing this app. As We said at the beginning, We will be glad to help you if you have any questions relating to this app. Please go to our help center at http://inspius.com/envato and create a ticket, our technical will help you.

Inspius Singapore Pte. Ltd

Go To Table of Contents