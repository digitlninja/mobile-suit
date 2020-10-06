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

const _getGPSPermissionStatus = async () => {
    try {
        if (Platform.OS === "android") {
            return await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
        }
        if (Platform.OS === "ios") {
            const permissionStatus = await Geolocation.requestAuthorization();
            Geolocation.setRNConfiguration({
                skipPermissionRequests: false,
                authorizationLevel: "whenInUse",
            });
            return permissionStatus;
        }
    } catch (error) {
        console.error("Error: _getGPSPermissionStatus()", { error });
        throw error;
    }
};

export const getLocation = async () => {
    let permissionStatus = await _getGPSPermissionStatus();
    if (permissionStatus !== "granted") {
        throw new Error("Location permission denied");
    }
    const position = await _getCurrentPositionPromisified();
    return position;
};

export const initialize = () => {
    WebviewPigeon.subscribe(MessageTypes.gps, MessageTopics.location_update, getLocation);
};
