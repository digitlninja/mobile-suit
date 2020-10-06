import { ENABLE_BARCODE_SCANNER, DISABLE_BARCODE_SCANNER } from "./types";

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
        default:
            return globalState;
    }
};

export default GlobalReducer;
