import React, { useContext, useEffect, useRef } from "react";
import { Button, PermissionsAndroid, Platform } from "react-native";
import { WebView } from "react-native-webview";
import Geolocation from "react-native-geolocation-service";
import * as MessageRouter from "./webview-pigeon";
import { MessageTopics, MessageTypes } from "./constants";
import BarcodeScanScreen from "./components/BarcodeScanner";
import Store, { Context } from "./store/Store";
import * as BarcodeScannerAdapter from "./adapters/BarcodeScannerAdapter";
import { getUUID } from "./helpers";

const AppContainer = () => {
    return (
        <Store>
            <App/>
        </Store>
    );
};

const App = () => {
    // eslint-disable-next-line
    const [globalState, dispatch, enableBarcodeScanner] = useContext(Context);
    let webviewRef = useRef();

    const showBarcodeScanner = async () => {
        const cameraAllowed = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (cameraAllowed) {
            enableBarcodeScanner();
        }
    };

    useEffect(() => {
        BarcodeScannerAdapter.initialize(showBarcodeScanner);
    }, []);

    const publishLocation = async () => {
        if (Platform.OS === "android") {
            try {
                const permission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (permission === "granted") {
                    Geolocation.getCurrentPosition(
                        (position) => {
                            const id = getUUID();
                            MessageRouter.sendMessageToWebview(id, MessageTypes.gps, MessageTopics.location_update, webviewRef.current, position);
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
            {globalState.showBarcodeScanner &&
            <BarcodeScanScreen webviewRef={webviewRef}/>}
            <WebView
                ref={webview => webviewRef.current = webview}
                source={{ uri: "http://localhost:3000" }}
                style={{ marginTop: 20 }}
                onMessage={(event) => MessageRouter.router(event, webviewRef)}
            />
        </>
    );
};

export default AppContainer;

