import {
    ENABLE_BARCODE_SCANNER,
    DISABLE_BARCODE_SCANNER,
    ENABLE_BIOMETRIC_SCANNER,
    DISABLE_BIOMETRIC_SCANNER
} from "./types";

const GlobalReducer = (globalState, action) => {
    switch (action.type) {
        case ENABLE_BARCODE_SCANNER:
            return {
                ...globalState,
                showBarcodeScanner: true
            };
        case DISABLE_BARCODE_SCANNER:
            return {
                ...globalState,
                showBarcodeScanner: false
            };
        case ENABLE_BIOMETRIC_SCANNER:
            return {
                ...globalState,
                showBiometricScanner: true
            };
        case DISABLE_BIOMETRIC_SCANNER:
            return {
                ...globalState,
                showBiometricScanner: false
            };
        default:
            return globalState;
    }
};

export default GlobalReducer;
