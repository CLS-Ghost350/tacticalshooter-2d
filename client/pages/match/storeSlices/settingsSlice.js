import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    zoomedViewCone: false,
    zoomCurve: false,
    alwaysZooming: false,
    toggledZoom: false,

    keybinds: {
        "moveUp": ["KeyW", "ArrowUp"],
        "moveDown": ["KeyS", "ArrowDown"],
        "moveLeft": ["KeyA", "ArrowLeft"],
        "moveRight": ["KeyD", "ArrowRight"],
        "drawBow": ["MouseLeft", "Space"],
        "zoom": ["ShiftLeft", "ShiftRight"],
        "debugTest": ["KeyP", "KeyP"]
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
            state.keybinds[action.payload.type][action.payload.slot] = action.payload.key;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setSetting, setKeybind } = settingsSlice.actions

export default settingsSlice.reducer