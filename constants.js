import RNFS from 'react-native-fs';

export const olarmDirectoryPath = `${RNFS.DocumentDirectoryPath}/Olarm`;

export const MessageTypes = {
    camera: 'camera',
    file_system: 'file_system',
    geolocation_background: 'geolocation_background',
    barcode_scanner: 'barcode_scanner',
    wifi: 'wifi',
    biometrics: 'biometrics',
};

export const MessageTopics = {
    start: 'start',
    take_photo: 'take_photo',
    stop: 'stop',
    capture_complete: 'capture_complete',
    save_photo: 'save_photo',
    read_photos: 'read_photos',
    location_update: 'location_update',
    initiate_scan: 'initiate_scan',
    scan_complete: 'scan_complete',
    get_ssid: 'get_ssid',
    list_networks: 'list_networks',
    connect: 'connect',
    disconnect: 'disconnect',
    scan_fingerprint: 'scan_fingerprint',
};
