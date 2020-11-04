import React, { createContext, useReducer } from "react";
import GlobalReducer from "./global-reducer";
import {
    DISABLE_BARCODE_SCANNER,
    ENABLE_BARCODE_SCANNER,
    ENABLE_BIOMETRIC_SCANNER,
    DISABLE_BIOMETRIC_SCANNER
} from "./types";

const initialState = {
    showBarcodeScanner: false,
    showBiometricScanner: false
};

const Store = ({ children }) => {
    const [globalState, dispatch] = useReducer(GlobalReducer, initialState);

    const enableBarcodeScanner = async () =>
        await dispatch({ type: ENABLE_BARCODE_SCANNER });

    const disableBarcodeScanner = async () =>
        await dispatch({ type: DISABLE_BARCODE_SCANNER });

    const enableBiometricScanner = async () =>
        await dispatch({ type: ENABLE_BIOMETRIC_SCANNER });

    const disableBiometricScanner = async () =>
        await dispatch({ type: DISABLE_BIOMETRIC_SCANNER });

    return (
        <Context.Provider
            value={[globalState, dispatch, enableBarcodeScanner, disableBarcodeScanner, enableBiometricScanner, disableBiometricScanner]}
        >
            {children}
        </Context.Provider>
    );
};

export const Context = createContext([initialState]);
export default Store;
