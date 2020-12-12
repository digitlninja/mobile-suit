import { RNCamera } from 'react-native-camera';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useRef } from 'react';
import { Context } from '../store/store';
import * as FileSystemAdapter from '../adapters/FileSystemAdapter';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
});

const TakePicture = ({ webviewRef }) => {
        const [globalState, dispatch, enableCamera, disableCamera] = useContext(Context);
        let cameraRef = useRef();

        const takePicture = async () => {
            try {
                const { uri } = await cameraRef.takePictureAsync({ quality: 10 });
                const { photoData: { fileName } } = globalState;
                console.log(`Photo captured, uri: ${uri}`);
                await FileSystemAdapter.saveAndSendPhotos(uri, fileName, webviewRef);
                await disableCamera();
            } catch (error) {
                console.log('takePicture() error: ', error);
                await disableCamera();
                alert('Something went wrong, Please try again');
            }
        };

        return (
            <View style={styles.container}>
                <RNCamera
                    ref={cam => {
                        cameraRef = cam;
                    }}
                    style={styles.preview}
                    captureAudio={false}
                >
                    <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={takePicture} style={styles.capture}>
                            <Text style={{ fontSize: 14 }}> Take Photo </Text>
                        </TouchableOpacity>
                    </View>
                </RNCamera>

                <View style={styles.space}/>
            </View>
        );
    }
;

export default TakePicture;
