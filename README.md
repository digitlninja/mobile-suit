# Description

The ReactNative Wrapper for Olarm mobile app.

Built with React Native

##Setup

Follow the steps in this walkthrough:
https://app.tettra.co/teams/threesprints/pages/setup

Install ios packages.
From root directory run
```
$ cd ios && pod install && cd ..
```
Install npm packages.

```
$ npm install
```

## Running the app

####Run the web app and api first

####IOS
```
$ npm run ios
```
####Android
```
$ npm run android
```

## Debugging

####ReactNative
If you want to enable debugging ReactNative in the browser for android: (if its not there)

```
import android.webkit.WebView;
   @Override
   public void onCreate() {
     super.onCreate();
     ...
     WebView.setWebContentsDebuggingEnabled(true);
   }
```
1. Insert ^ this into `MainApplication.java onCreate()`, don't forget the import at the top.
2. Enabling browser debugging: From the android emulator push cmd+m on Mac or ctrl+m on Windows, or on your device shake the phone to open the debug menu and click debug.
3. Navigate to the debugger url. (This is for debugging React Native JS code specifically)
    
    http://localhost:8081/debugger-ui/
    
    If you want to debug from console instead, remove the above snippet.
####Webview

Navigate to the url below in Chrome. Click inspect on the running app. (This is for debugging Webview code.)

chrome://inspect/#devices


## Helpful commands
Kill metro process

`kill $(lsof -t -i:8081)`

Reset android permissions

`adb shell pm reset-permissions`
