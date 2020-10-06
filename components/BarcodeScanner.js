"use strict";
import React, { useContext } from "react";
import {
    Text,
    View,
    StyleSheet,
    Button
} from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { Context } from "../store/Store";
import { getUUID } from "../helpers";
import * as BarcodeScannerAdapter from "../adapters/BarcodeScannerAdapter";

const BarcodeScanScreen = ({ webviewRef }) => {
    // eslint-disable-next-line
    const [globalState, dispatch, enableBarcodeScanner, disableBarcodeScanner] = useContext(Context);
    const onSuccess = async (event) => {
        const id = getUUID();
        await BarcodeScannerAdapter.sendScanResult(id, event, webviewRef.current);
        disableBarcodeScanner();
    };
    return (
        <View style={styles.center}>
            <QRCodeScanner
                onRead={onSuccess}
                permissionDialogMessage="Please ensure this app has permission to use your camera."
                checkAndroid6Permissions={true}
                flashMode={RNCamera.Constants.FlashMode.torch}
                topContent={
                    <Text style={styles.centerText}>
                        Scan the barcode on your device.
                        (make sure this app has camera permissions)
                    </Text>
                }
                bottomContent={
                    <Button title="Go back" onPress={() => disableBarcodeScanner()} style={styles.buttonTouchable}/>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    center: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    centerText: {
        flex: 1,
        fontWeight: "600",
        fontSize: 18,
        padding: 32,
        color: "#222"
    },
    textBold: {
        padding: 20,
        color: "#000"
    },
    buttonText: {
        fontSize: 21,
        color: "rgb(0,122,255)"
    },
    buttonTouchable: {
        borderRadius: 10
    }
});

export default BarcodeScanScreen;
