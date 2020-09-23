import React, { useRef } from "react";
import { Button, PermissionsAndroid, Platform } from "react-native";
import { WebView } from "react-native-webview";
import Geolocation from "react-native-geolocation-service";
import * as MessageRouter from "./WebviewPigeon";
import { MessageTopics, MessageTypes } from "./constants";

const App = () => {

    let webviewRef = useRef(null);

    const publishLocation = async () => {
        if (Platform.OS === "android") {
            try {
                const permission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (permission === "granted") {
                    Geolocation.getCurrentPosition(
                        (position) => {
                            MessageRouter._sendMessageToWebview(MessageTypes.gps, MessageTopics.location_update, webviewRef, position);
                        },
                        (error) => {
                            console.error(error.code, error.message);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 10000
                        }
                    );
                } else {
                    console.log("Location permission denied");
                }
            } catch (error) {
                console.error({ error });
            }
        }
        if (Platform.OS === "ios") {
            const permissionStatus = await Geolocation.requestAuthorization();
            Geolocation.setRNConfiguration({
                skipPermissionRequests: false,
                authorizationLevel: "whenInUse",
            });
            return permissionStatus;
        }
    };

    return (
        <>
            <Button onPress={publishLocation} title="Get Location"/>
            <WebView
                ref={webview => webviewRef = webview}
                source={{ uri: "http://localhost:3000" }}
                style={{ marginTop: 20 }}
                onMessage={(event) => MessageRouter.router(event, webviewRef)}
            />
        </>
    );
};

export default App;

