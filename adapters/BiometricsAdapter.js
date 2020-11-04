import * as WebviewPigeon from "../webview-pigeon";
import { MessageTopics, MessageTypes } from "../constants";

export const sendScanResult = async (id, data, webviewRef) => {
    await WebviewPigeon.publish({
        id,
        type: MessageTypes.biometrics,
        topic: MessageTopics.scan_complete,
        payload: data || {}
    }, webviewRef);
};

export const onScanComplete = (fingerPrintData) => {
    return fingerPrintData;
};

export const initialize = (showScannerFunction) => {
    if (!showScannerFunction) console.error("showScannerFunction not passed.");
    WebviewPigeon.subscribe(MessageTypes.biometrics, MessageTopics.initiate_scan, showScannerFunction);
    WebviewPigeon.subscribe(MessageTypes.biometrics, MessageTopics.scan_complete, onScanComplete);
};
