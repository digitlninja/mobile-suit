import React, { useEffect, useRef } from 'react';
import { Button, PermissionsAndroid, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import * as NativePigeon from './native-pigeon';
import { MessageTopics, MessageTypes } from './constants';
import BackgroundGeolocation from 'react-native-background-geolocation';
import * as GeolocationAdapter from './adapters/GPSAdapter';

const App = () => {
    const onLocation = (location) => {
        console.log('[location] -', location);
    };
    const onError = (error) => {
        console.warn('[location] ERROR -', error);
    };
    const onActivityChange = (event) => {
        console.log('[activitychange] -', event);  // eg: 'on_foot', 'still', 'in_vehicle'
    };
    const onProviderChange = (provider) => {
        console.log('[providerchange] -', provider.enabled, provider.status);
    };
    const onMotionChange = (event) => {
        console.log('[motionchange] -', event.isMoving, event.location);
    };

    const initializeGeoLocation = async () => {
        await GeolocationAdapter.initialize();
    };

    const initializeBgGeo = () => {
        BackgroundGeolocation.onLocation(onLocation, onError);
        BackgroundGeolocation.onMotionChange(onMotionChange);
        BackgroundGeolocation.onActivityChange(onActivityChange);
        BackgroundGeolocation.onProviderChange(onProviderChange);
        BackgroundGeolocation.ready({
            // geolocation Config
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 10,
            // Activity Recognition
            stopTimeout: 1,
            // Application config
            debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
            startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
            // HTTP / SQLite config
            url: 'http://yourserver.com/locations',
            batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
            autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
            headers: {              // <-- Optional HTTP headers
                'X-FOO': 'bar'
            },
            params: {               // <-- Optional HTTP params
                'auth_token': 'maybe_your_server_authenticates_via_token_YES?'
            }
        }, (state) => {
            console.log('- BackgroundGeolocation is configured and ready: ', state.enabled);
            if (!state.enabled) {
                BackgroundGeolocation.start(function () {
                    console.log('- Start success');
                });
            }
        });
    };

    useEffect(() => {
        initializeBgGeo();
        initializeGeoLocation();
        return () => BackgroundGeolocation.removeListeners();
    }, []);

    let webviewRef = useRef(null);

    const publishLocation = async () => {
        if (Platform.OS === 'android') {
            try {
                const permission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (permission === 'granted') {
                    Geolocation.getCurrentPosition(
                        (position) => {
                            NativePigeon.sendMessageToWebview(MessageTypes.gps, MessageTopics.location_update, webviewRef, position);
                        },
                        (error) => {
                            console.error(error.code, error.message);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 10000
                        }
                    );
                } else {
                    console.log('Location permission denied');
                }
            } catch (error) {
                console.error({ error });
            }
        }
        if (Platform.OS === 'ios') {
            const permissionStatus = await Geolocation.requestAuthorization();
            Geolocation.setRNConfiguration({
                skipPermissionRequests: false,
                authorizationLevel: 'whenInUse',
            });
            return permissionStatus;
        }
    };

    const setTrackingState = () => BackgroundGeolocation.changePace(true, function () {
        console.log('- plugin is now tracking');
    });

    const setStationaryState = () => BackgroundGeolocation.changePace(true, function () {
        console.log('- plugin is now tracking');
    });

    return (
        <>
            <Button onPress={setTrackingState} title="Tracking"/>
            <Button onPress={setStationaryState} title="Stationary"/>
            <WebView
                ref={webview => webviewRef = webview}
                source={{ uri: 'http://localhost:8082' }}
                style={{ marginTop: 20 }}
                onMessage={(event) => NativePigeon.router(event, webviewRef)}
            />
        </>
    );
};

export default App;

