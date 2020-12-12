import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import * as NativePigeon from '../native-pigeon';
import { MessageTopics, MessageTypes } from '../constants';
import BackgroundGeolocation from 'react-native-background-geolocation';

const bgGeoStartPromisified = (userIndex, accessToken) => new Promise(function (fulfilled, rejected) {
    BackgroundGeolocation.setConfig({
            url: 'https://api.olarm.co/api/v3/users/' + userIndex + '/patrol',
            params: {
                'access_token': accessToken,
            },
        },
        function (state) {
            console.log('[setConfig] success: ', state);
            BackgroundGeolocation.start(function (state) {
                console.log('[start] success - ', state);
                fulfilled(true);
            });
        },
        (error) => {
            console.log('[start] success - ', error);
            rejected(error);
        }
    );
});

const bgGeoStart = async ({ userIndex, accessToken }) => {
    const result = await bgGeoStartPromisified(userIndex, accessToken);
    return result;
};
const bgGeoStop = async () => {
    BackgroundGeolocation.stop(function (state) {
        console.log('[stop] -> ', state);
    });
};

const _getCurrentPositionPromisified = () => new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
        (position) => {
            console.log('in _getCurrentPositionPromisified.getCurrentPosition', { position });
            resolve(position);
        },
        (error) => {
            reject(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 10000
        }
    );
});

const _getGPSPermissionStatus = async () => {
    try {
        if (Platform.OS === 'android') {
            return await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
        }
        if (Platform.OS === 'ios') {
            const permissionStatus = await Geolocation.requestAuthorization();
            Geolocation.setRNConfiguration({
                skipPermissionRequests: false,
                authorizationLevel: 'whenInUse',
            });
            return permissionStatus;
        }
    } catch (error) {
        console.error('Error: _getGPSPermissionStatus()', { error });
        throw error;
    }
};

export const getLocation = async () => {
    let permissionStatus = await _getGPSPermissionStatus();
    if (permissionStatus !== 'granted') {
        throw new Error('Location permission denied');
    }
    const position = await _getCurrentPositionPromisified();
    return position;
};

export const initialize = async () => {
    await NativePigeon.subscribe(MessageTypes.geolocation_background, MessageTopics.start, (payload) => bgGeoStart(payload));
    await NativePigeon.subscribe(MessageTypes.geolocation_background, MessageTopics.stop, bgGeoStop);
};
