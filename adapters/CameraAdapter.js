import * as NativePigeon from '../native-pigeon';
import { MessageTopics, MessageTypes } from '../constants';

export const initialize = (showCameraFunction) => {
    if (!showCameraFunction) console.error('showCameraFunction not passed.');
    NativePigeon.subscribe(MessageTypes.camera, MessageTopics.take_photo, showCameraFunction);
};
