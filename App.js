import React, { useContext, useEffect, useRef } from "react";
import { Alert, Button, PermissionsAndroid, Platform } from "react-native";
import { WebView } from "react-native-webview";
import Geolocation from "react-native-geolocation-service";
import * as WifiManager from "react-native-wifi-reborn";
import { MessageTopics, MessageTypes } from "./constants";
import BarcodeScanScreen from "./components/BarcodeScanner";
import Store, { Context } from "./store/Store";
import { getUUID } from "./helpers";
import * as BarcodeScannerAdapter from "./adapters/BarcodeScannerAdapter";
import * as BiometricsAdapter from "./adapters/BiometricsAdapter";
import * as MessageRouter from "./webview-pigeon";
import * as WiFiAdapter from "./adapters/WiFiAdapter";
import messaging from "@react-native-firebase/messaging";
import BiometricPopup from "./components/BiotmetricPopup/BiometricPopup";

const AppContainer = () => (
    <Store>
        <App/>
    </Store>
);

const App = () => {
    // eslint-disable-next-line
    const [globalState, dispatch, enableBarcodeScanner, disableBarcodeScanner, enableBiometricScanner] = useContext(Context);
    let webviewRef = useRef();

    useEffect(() => {
        BarcodeScannerAdapter.initialize(showBarcodeScanner);
        BiometricsAdapter.initialize(enableBiometricScanner);
        WiFiAdapter.initialize();
        const unsubscribeToFirebase = messaging().onMessage(async remoteMessage => {
            Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
        });
        return unsubscribeToFirebase;
    }, []);

    const getLocationPermission = async (type) => {
        if (Platform.OS === "android") {
            return await PermissionsAndroid.request(type);
        }
        // Perhaps parameterize these values
        Geolocation.setRNConfiguration({
            skipPermissionRequests: false,
            authorizationLevel: "whenInUse",
        });
        return await Geolocation.requestAuthorization();
    };

    const rationale = {
        title: "Location permission is required for WiFi connections",
        message: "This app needs location permission to scan for wifi networks.",
        buttonNegative: "DENY",
        buttonPositive: "ALLOW",
    };

    const showBarcodeScanner = async () => {
        let cameraAllowed = true;
        if (Platform.OS === "android") {
            cameraAllowed = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        }
        if (cameraAllowed) {
            enableBarcodeScanner();
        }
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
        } catch (error) {
            console.log("Cannot get current SSID!", error);
        }
    };

    const connectToNetwork = async (SSID = "Sirocco", password = "123@Sir@2020", isWep = false) => {
        try {
            if (Platform.OS === "android") {
                const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, rationale);
                if (permission !== "granted") {
                    console.log("Permission not granted");
                    return;
                }
                if (!await WifiManager.isEnabled()) {
                    await WifiManager.setEnabled(true);
                }
            }
            await WifiManager.connectToProtectedSSID(SSID, password, isWep);
            console.log("Connected successfully!");
        } catch (error) {
            console.error(error);
            console.log("Connection failed!");
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
                return (await WifiManager.loadWifiList()).map(({ SSID }) => SSID);
            }
        } catch (error) {
            console.log(error);
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
            }
            if (Platform.OS === "ios") {
                const SSID = await WifiManager.getCurrentWifiSSID();
                return await WifiManager.disconnectFromSSID(SSID);
            }
        } catch (error) {
            console.log("Error", error);
        }
    };

    const sendLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const id = getUUID();
                MessageRouter.sendMessageToWebview(id, MessageTypes.gps, MessageTopics.location_update, webviewRef.current, position);
            },
            (error) => {
                Alert.alert("IoT app needs location permissions to continue.");
                console.error(error.code, error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 10000
            }
        );
    };

    // This is purely a proof of work of executing a send of data in react native to webview
    const publishLocation = async () => {
        try {
            if (Platform.OS === "android") {
                const permission = await getLocationPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if (permission !== "granted") {
                    console.log("Permission not granted");
                    return;
                }
            }
            await sendLocation();
        } catch (error) {
            console.error({ error });
        }
    };
    return (
        <>
            <Button onPress={() => publishLocation()} title="Get Location"/>
            <Button onPress={() => showBarcodeScanner()} title="Scan Barcode"/>
            <Button onPress={() => getNetwork()} title="Get Network"/>
            <Button onPress={() => connectToNetwork()} title="Connect to network"/>
            <Button onPress={() => listNetworks()} title="List networks"/>
            <Button onPress={() => disconnectFromNetwork()} title="Disconnect"/>
            {globalState.showBiometricScanner &&
            <BiometricPopup
                onAuthenticate={() => console.log("Auth'd")}
                webviewRef={webviewRef}/>
            }
            {globalState.showBarcodeScanner && <BarcodeScanScreen webviewRef={webviewRef}/>}
            <WebView
                ref={webview => webviewRef.current = webview}
                source={{ uri: "http://localhost:8080" }}
                style={{ marginTop: 20 }}
                onMessage={(event) => MessageRouter.router(event, webviewRef)}
            />
        </>
    );
};

export default AppContainer;

