export const MessageTopics = {
    location_update: "location_update",
    initiate_scan: "initiate_scan",
    scan_complete: "scan_complete",
    get_ssid: "get_ssid",
    list_networks: "list_networks",
    connect: "connect",
    disconnect: "disconnect",
};
export const MessageTypes = {
    gps: "gps",
    barcode_scanner: "barcode_scanner",
    wifi: "wifi",
};

export const topicsToNotSendToWebview = [MessageTopics.initiate_scan];
