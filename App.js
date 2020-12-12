import React, { useEffect, useRef } from 'react';
import { Button } from 'react-native';
import { WebView } from 'react-native-webview';
import * as NativePigeon from './native-pigeon';
import BackgroundGeolocation from 'react-native-background-geolocation';
import * as GPSAdapter from './adapters/GPSAdapter';
import * as CameraAdapter from './adapters/CameraAdapter';
import CameraScreen from './components/CameraScreen';
import { Context } from './store/store.js';
import Store from './store/store';

import { useContext } from 'react';
import * as FileSystemAdapter from './adapters/FileSystemAdapter';

const AppContainer = () => (
    <Store>
        <App/>
    </Store>
);

const App = () => {
    const [globalState, dispatch, enableCamera, disableCamera] = useContext(Context);

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

    const initializeAdapters = async () => {
        await GPSAdapter.initialize();
        await CameraAdapter.initialize((photoData) => enableCamera(photoData));
        await FileSystemAdapter.initialize();
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
            debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
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
        initializeAdapters();
        return () => BackgroundGeolocation.removeListeners();
    }, []);

    let webviewRef = useRef();

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
            <Button onPress={disableCamera} title="Close cam"/>
            {globalState.showCamera &&
            <CameraScreen webviewRef={webviewRef}/>
            }
            <WebView
                ref={webview => webviewRef.current = webview}
                source={{ uri: 'http://localhost:8082' }}
                style={{ marginTop: 20 }}
                onMessage={(event) => NativePigeon.receiver(event, webviewRef)}
                allowUniversalAccessFromFileURLs={true}
                allowFileAccess={true}
            />
        </>
    );
};

export default AppContainer;
