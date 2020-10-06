import * as WebviewPigeon from "../webview-pigeon";
import { MessageTopics, MessageTypes } from "../constants";

export const sendScanResult = async (id, data, webviewRef) => {
    await WebviewPigeon.publish({
        id,
        type: MessageTypes.barcode_scanner,
        topic: MessageTopics.scan_complete,
        payload: data
    }, webviewRef);
};

export const onScanComplete = (barCodeData) => (barCodeData);

export const initialize = (showScannerFunction) => {
    if (!showScannerFunction) console.error("showScannerFunction not passed.");

    WebviewPigeon.subscribe(MessageTypes.barcode_scanner, MessageTopics.initiate_scan, showScannerFunction);
    WebviewPigeon.subscribe(MessageTypes.barcode_scanner, MessageTopics.scan_complete, onScanComplete);
};
