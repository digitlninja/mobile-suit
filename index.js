import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import * as GPSAdapter from "./adapters/GPSAdapter";
import messaging from "@react-native-firebase/messaging";

GPSAdapter.initialize();
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log("Message handled in the background!", remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
