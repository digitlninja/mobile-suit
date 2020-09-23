/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import * as GPSAdapter from "./adapters/GPSAdapter";

GPSAdapter.initialize();

AppRegistry.registerComponent(appName, () => App);
