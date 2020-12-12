import React, { createContext, useReducer } from 'react';
import GlobalReducer from './global-reducer';
import { DISABLE_CAMERA, ENABLE_CAMERA } from './types';

const initialState = {
    showCamera: false,
    photoData: { fileName: '' }
};

const Store = ({ children }) => {
    const [globalState, dispatch] = useReducer(GlobalReducer, initialState);

    const enableCamera = async (photoData) =>
        await dispatch({ type: ENABLE_CAMERA, data: photoData });

    const disableCamera = async () =>
        await dispatch({ type: DISABLE_CAMERA });


    return (
        <Context.Provider
            value={[globalState, dispatch, enableCamera, disableCamera]}
        >
            {children}
        </Context.Provider>
    );
};

export const Context = createContext([initialState]);
export default Store;
