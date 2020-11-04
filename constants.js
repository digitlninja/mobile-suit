export const MessageTypes = {
    gps: "gps",
    barcode_scanner: "barcode_scanner",
    wifi: "wifi",
    biometrics: "biometrics",
};

export const MessageTopics = {
    location_update: "location_update",
    initiate_scan: "initiate_scan",
    scan_complete: "scan_complete",
    get_ssid: "get_ssid",
    list_networks: "list_networks",
    connect: "connect",
    disconnect: "disconnect",
    scan_fingerprint: "scan_fingerprint",
};


export const topicsToNotSendToWebview = [MessageTopics.initiate_scan];
