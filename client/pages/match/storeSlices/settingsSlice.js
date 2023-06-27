import { createSlice } from '@reduxjs/toolkit'

const defaultSettings = {
    zoomedViewCone: false,
    zoomCurve: false,
    alwaysZooming: true,
    toggledZoom: false,
}

const defaultKeybinds = {
    "moveUp": ["KeyW", "ArrowUp"],
    "moveDown": ["KeyS", "ArrowDown"],
    "moveLeft": ["KeyA", "ArrowLeft"],
    "moveRight": ["KeyD", "ArrowRight"],
    "drawBow": ["MouseLeft", "Space"],
    "zoom": ["ShiftLeft", "ShiftRight"],
    "prevWeapon": ["KeyQ", "ScrollUp"],
    "nextWeapon": ["KeyE", "ScrollDown"],
    "debugTest": ["KeyP", "KeyP"]
}

for (const [ setting, val ] of Object.entries(defaultSettings)) {
    defaultSettings[setting] = localStorage.getItem(`settings-${setting}`) ?? val;
    if (defaultSettings[setting] !== val) defaultSettings[setting] = JSON.parse(defaultSettings[setting]).val;
}

for (const [ keybind, vals ] of Object.entries(defaultKeybinds)) {
    vals.forEach((val, i) => {
        defaultKeybinds[keybind][i] = localStorage.getItem(`settings-keybinds-${keybind}-${i}`) ?? val;
    })
}

const initialState = {
    keybinds: defaultKeybinds,
    ...defaultSettings
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSetting: (state, action) => {
            state[action.payload.key] = action.payload.value;
            localStorage.setItem(`settings-${action.payload.key}`, JSON.stringify({ val: action.payload.value }));
        },

        setKeybind: (state, action) => {
            state.keybinds[action.payload.type][action.payload.slot] = action.payload.key;
            localStorage.setItem(`settings-keybinds-${action.payload.type}-${action.payload.slot}`, action.payload.key);
        }
    },
})

// Action creators are generated for each case reducer function
export const { setSetting, setKeybind } = settingsSlice.actions

export default settingsSlice.reducer