import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "react-native-geolocation-service";
import * as WebviewPigeon from "../webview-pigeon";
import { MessageTopics, MessageTypes } from "../constants";

const _getCurrentPositionPromisified = () => new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
        (position) => {
            resolve(position);
        },
        (error) => {
            reject(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 10000
        }
    );
});

const _getPermissionStatus = async (type) => {
    if (Platform.OS === "android") {
        return await PermissionsAndroid.request(type);
    }
    const permissionStatus = await Geolocation.requestAuthorization("always");
    Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: "always",
    });
    return permissionStatus;
};

export const getLocation = async () => {
    try {
        const permission = await _getPermissionStatus(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (permission !== "granted") {
            console.error("Permission not granted");
            alert("Please ensure Location permissions are allowed for this app.");
            return;
        }
        const position = await _getCurrentPositionPromisified();
        return position;
    } catch (error) {
        console.error({ error });
        alert("getLocation() error:", error);
    }
};

export const initialize = () => {
    WebviewPigeon.subscribe(MessageTypes.gps, MessageTopics.location_update, getLocation);
};
