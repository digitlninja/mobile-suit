export const MessageTopics = {
    location_update: "location_update",
    initiate_scan: "initiate_scan",
    scan_complete: "scan_complete",
};
export const MessageTypes = {
    gps: "gps",
    barcode_scanner: "barcode_scanner",
};

export const topicsToNotSendToWebview = [MessageTopics.initiate_scan];
