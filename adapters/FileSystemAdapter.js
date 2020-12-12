import * as NativePigeon from '../native-pigeon';
import { MessageTopics, MessageTypes, olarmDirectoryPath } from '../constants';
import RNFS from 'react-native-fs';
import { v4 as uuidv4 } from 'uuid';

const _isImage = (entry) => ['.jpg', '.jpeg', '.png'].some((imgType) => entry.path.includes(imgType));

const getFileExtension = (filePath) => filePath.substr(filePath.lastIndexOf('.') + 1);

export const getPhotoArray = async () => {
    const photoArray = [];
    try {
        const filesAndDirectories = await RNFS.readDir(olarmDirectoryPath);
        for (const entry of filesAndDirectories) {
            if (entry.isDirectory()) {
                console.log('Directory skipped:', entry);
                continue;
            }
            if (!_isImage(entry)) {
                console.log('Non-image file - skipped:', entry);
                continue;
            }
            const { path } = entry;
            console.log({ path });
            const encodedFile = await RNFS.readFile(entry.path, 'base64');
            console.log('Encoded file:', { encodedFile });
            const split = entry.name.split('_');

            // areas or zones
            const photoOf = split[0];
            const index = parseInt(split[1]);
            const deviceIndex = split[2].substr(0, split[2].length - 4);
            const extension = getFileExtension(entry.path);
            photoArray.push([deviceIndex, photoOf, index, encodedFile, extension]);
            console.log('Photo Array:', { photoArray });
        }
        return photoArray;
    } catch (error) {
        console.error('getPhotoArray() error', error);
        return error;
    }
};

export const loadAllPhotos = async () => {
    const photoArray = [];
    try {
        const olarmDirectoryExists = await RNFS.exists(olarmDirectoryPath);
        if (!olarmDirectoryExists) {
            await RNFS.mkdir(olarmDirectoryPath);
        }
        const filesAndDirectories = await RNFS.readDir(olarmDirectoryPath);
        for (const entry of filesAndDirectories) {
            if (entry.isDirectory()) {
                console.log('Directory skipped:', entry);
                continue;
            }
            if (!_isImage(entry)) {
                console.log('Non-image file - skipped:', entry);
                continue;
            }
            const { path } = entry;
            console.log({ path });
            const encodedFile = await RNFS.readFile(entry.path, 'base64');
            console.log('Encoded file:', { encodedFile });
            const split = entry.name.split('_');

            // areas or zones
            const photoOf = split[0];
            const index = parseInt(split[1]);
            const deviceIndex = split[2].substr(0, split[2].length - 4);
            const extension = getFileExtension(entry.path);
            photoArray.push([deviceIndex, photoOf, index, encodedFile, extension]);
            console.log('Photo Array:', { photoArray });
        }
        return { photoArray };
    } catch (error) {
        console.log('loadAllPhotos() error', error);
        return error;
    }
};

export const moveFile = async (uri, fileName, webviewRef, destination = olarmDirectoryPath) => {
    try {
        const olarmDirectoryExists = await RNFS.exists(olarmDirectoryPath);
        if (!olarmDirectoryExists) {
            await RNFS.mkdir(olarmDirectoryPath);
        }
        const filePath = `${destination}/${fileName}`;
        console.log(`Moving file to... ${filePath}`);
        await RNFS.moveFile(uri, filePath);
        console.log(`File moved successfully:`, filePath);
    } catch (error) {
        console.error('saveFile() error', error);
        window.alert('Something went wrong, please ensure this app has permission to read and write files and try again.');
    }
};

const photoResult = (result) => (result);
const photoArray = (result) => (result);

export const sendReadPhotosResult = async (webviewRef, photoArray) => {
    const id = uuidv4();
    try {
        await NativePigeon.publish({
            id,
            type: MessageTypes.camera,
            topic: MessageTopics.take_photo,
            payload: { success: true, photoArray }
        }, webviewRef.current);
    } catch (error) {
        await NativePigeon.publish({
            id,
            type: MessageTypes.camera,
            topic: MessageTopics.take_photo,
            payload: { success: false, error }
        }, webviewRef.current);
    }
};

export const saveAndSendPhotos = async (uri, fileName, webviewRef) => {
    await moveFile(uri, fileName, webviewRef);
    const photoArray = await getPhotoArray();
    await sendReadPhotosResult(webviewRef, photoArray);
};

export const initialize = () => {
    NativePigeon.subscribe(MessageTypes.camera, MessageTopics.take_photo, photoResult);
    NativePigeon.subscribe(MessageTypes.file_system, MessageTopics.read_photos, loadAllPhotos);
};

