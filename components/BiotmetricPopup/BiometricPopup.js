import React, { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
    Alert,
    Image,
    Text,
    TouchableOpacity,
    View,
    ViewPropTypes,
    Platform,
} from "react-native";

import FingerprintScanner from "react-native-fingerprint-scanner";
import styles from "./styles";
import ShakingText from "./ShakingText";
import { Context } from "../../store/Store";
import * as BiometricsAdapter from "../../adapters/BiometricsAdapter";
import { v4 as uuidv4 } from "uuid";
// import ShakingText from "./ShakingText.component";


// - this example component supports both the
//   legacy device-specific (Android < v23) and
//   current (Android >= 23) biometric APIs
// - your lib and implementation may not need both
const BiometricPopup = (props) => {
    // eslint-disable-next-line
    const [globalState, dispatch, enableBarcodeScanner, disableBarcodeScanner, enableBiometricScanner, disableBiometricScanner] = useContext(Context);

    const [errorMessageLegacy, setErrorMessageLegacy] = useState("");
    const [biometricLegacy, setBiometricLegacy] = useState("");
    let description = useRef();

    const handleUnmount = () => {
        FingerprintScanner.release();
        disableBiometricScanner();
    };

    useEffect(() => {
        if (requiresLegacyAuthentication()) {
            authLegacy();
        } else {
            authCurrent();
        }
        return handleUnmount;
    }, []);

    const requiresLegacyAuthentication = () => {
        return Platform.Version < 23;
    };

    const authCurrent = () => {
        FingerprintScanner.authenticate({ title: "Log in with Biometrics" })
            .then(() => {
                const result = props.onAuthenticate();
                BiometricsAdapter.sendScanResult(uuidv4(), {
                    status: "success",
                    result: result || {}
                }, props.webviewRef.current);
                disableBiometricScanner();
            })
            .catch((error) => {
                console.error({ error });
                BiometricsAdapter.sendScanResult(uuidv4(), {
                    status: "error",
                    result: error
                }, props.webviewRef.current);
                disableBiometricScanner();
            });
    };

    const authLegacy = () => {
        FingerprintScanner
            .authenticate({ onAttempt: handleAuthenticationAttemptedLegacy })
            .then(() => {
                props.handlePopupDismissedLegacy();
                Alert.alert("Fingerprint Authentication", "Authenticated successfully");
                BiometricsAdapter.sendScanResult(uuidv4(), { result: "dismissed" }, props.webviewRef.current);
                disableBiometricScanner();
            })
            .catch((error) => {
                setErrorMessageLegacy(error.message);
                setBiometricLegacy(error.biometric);
                description.shake();
                BiometricsAdapter.sendScanResult(uuidv4(), {
                    status: "error",
                    result: error
                }, props.webviewRef.current);
                disableBiometricScanner();
            });
    };

    const handleAuthenticationAttemptedLegacy = (error) => {
        setErrorMessageLegacy(error.message);
        description.shake();
    };

    const renderLegacy = () => {
        const { style, handlePopupDismissedLegacy } = props;

        return (
            <View style={styles.container}>
                <View style={[styles.contentContainer, style]}>
                    <Image style={styles.logo} source={require("./finger_print.png")}/>
                    <Text style={styles.heading}>Biometric{"\n"}Authentication</Text>
                    <ShakingText
                        ref={(instance) => {
                            description = instance;
                        }} style={styles.description(!!errorMessageLegacy)}>
                        {errorMessageLegacy || `Scan your ${biometricLegacy} on the\ndevice scanner to continue`}
                    </ShakingText>
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        onPress={handlePopupDismissedLegacy}
                    >
                        <Text style={styles.buttonText}>
                            BACK TO MAIN
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (requiresLegacyAuthentication()) {
        return renderLegacy();
    }

    // current API UI provided by native BiometricPrompt
    return null;
};

BiometricPopup.propTypes = {
    webviewRef: PropTypes.any,
    onAuthenticate: PropTypes.func.isRequired,
    handlePopupDismissedLegacy: PropTypes.func,
    style: ViewPropTypes.style,
};

export default BiometricPopup;
