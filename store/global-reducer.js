import {
    DISABLE_CAMERA, ENABLE_CAMERA
} from './types';

const GlobalReducer = (globalState, action) => {
    switch (action.type) {
        case ENABLE_CAMERA:
            return {
                ...globalState,
                showCamera: true,
                photoData: action.data && action.data.fileName ? { fileName: action.data.fileName } : {}
            };
        case DISABLE_CAMERA:
            return {
                ...globalState,
                showCamera: false
            };
        default:
            return globalState;
    }
};

export default GlobalReducer;
