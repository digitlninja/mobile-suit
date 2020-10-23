import * as WebviewPigeon from "../webview-pigeon";
import { MessageTopics, MessageTypes } from "../constants";
import WifiManager from "react-native-wifi-reborn";
import { PermissionsAndroid, Platform } from "react-native";

const rationale = {
    title: "Location permission is required for WiFi connections",
    message: "This app needs location permission to scan for wifi networks.",
    buttonNegative: "DENY",
    buttonPositive: "ALLOW",
};

const getNetwork = async () => {
    try {
        // if android, check permission, if not granted return
        if (Platform.OS === "android") {
            const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, rationale);
            if (permission !== "granted") {
                console.log("Permission not granted");
                return;
            }
        }
        const SSID = await WifiManager.getCurrentWifiSSID();
        console.log(`Your current connected wifi SSID is ${SSID}`);
        return SSID;
    } catch (error) {
        console.log("Cannot get current SSID!", error);
    }
};

const connectToNetwork = async ({ SSID = "Sirocco", password = "123@Sir@2020", isWep = false }) => {
    try {
        if (Platform.OS === "android") {
            const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, rationale);
            if (permission !== "granted") {
                console.error("Permission not granted");
                return;
            }
            if (!await WifiManager.isEnabled()) {
                await WifiManager.setEnabled(true);
            }
        }
        await WifiManager.connectToProtectedSSID(SSID, password, isWep);
        console.log("Connected successfully!");
    } catch (error) {
        if (error.code === "userDenied") {
            console.log({ error });
            return;
        }
        console.error("Connection failed!", error);
        alert("Please turn your WiFi on and try again.");
    }
};

const listNetworks = async () => {
    try {
        if (Platform.OS === "android") {
            const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, rationale);
            if (permission !== "granted") {
                console.log("Permission not granted");
                return;
            }
        }
        return (await WifiManager.loadWifiList()).map(({ SSID }) => SSID);
    } catch (error) {
        console.log("Connection failed!");
    }
};

const disconnectFromNetwork = async () => {
    try {
        if (Platform.OS === "android") {
            const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, rationale);
            if (permission !== "granted") {
                console.log("Permission not granted");
                return;
            }
            await WifiManager.disconnect();
            return { status: true };
        }
        if (Platform.OS === "ios") {
            const SSID = await WifiManager.getCurrentWifiSSID();
            return await WifiManager.disconnectFromSSID(SSID);
        }
    } catch (error) {
        console.log("Error", error);

    }
};

export const initialize = () => {
    WebviewPigeon.subscribe(MessageTypes.wifi, MessageTopics.get_ssid, getNetwork);
    WebviewPigeon.subscribe(MessageTypes.wifi, MessageTopics.list_networks, listNetworks);
    WebviewPigeon.subscribe(MessageTypes.wifi, MessageTopics.connect, (payload) => connectToNetwork(payload));
    WebviewPigeon.subscribe(MessageTypes.wifi, MessageTopics.disconnect, disconnectFromNetwork);
};
