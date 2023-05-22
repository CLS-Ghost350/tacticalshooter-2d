import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    zoomedViewCone: false,
    zoomCurve: false,
    alwaysZooming: false,
    toggledZoom: false,

    keybinds: {
        "moveUp": "KeyW",
        "moveDown": "KeyS",
        "moveLeft": "KeyA",
        "moveRight": "KeyD",
        "drawBow": "MouseRight",
        //"hit": "MouseLeft",
        "zoom": "ShiftLeft",
        "debugTest": "KeyP"
    }
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSetting: (state, action) => {
            state[action.payload.key] = action.payload.value;
        },

        setKeybind: (state, action) => {
            state.keybinds[action.payload.type] = action.payload.key;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setSetting, setKeybind } = settingsSlice.actions

export default settingsSlice.reducer