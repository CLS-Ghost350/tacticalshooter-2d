import React from "react";
import { useState, useEffect } from "react";

import { useSelector, useDispatch } from 'react-redux';
import { setSetting, setKeybind } from '../storeSlices/settingsSlice';

import keyHandler from "../keyHandler";

import styles from "@/styles/match.module.css"

const PAGES = {
    "Keybinds": <KeybindsTab/>,
    "Dev": <DevTab/>
};

export default function SettingsMenu({ open, close }) {
    const [ page, setPage ] = useState("Keybinds");

    return <dialog open={open} className={`${styles.settingsMenu} ${styles.dialogModal}`}> 
        <nav className={styles.settingsNav}>
            { Object.keys(PAGES).map(name => 
                <div key={name} 
                    className={`${styles.settingsNavTab} ${name == page? styles.settingsNavTabSelected : ""}`} 
                    onClick={() => setPage(name)}>
                        <h1>{name}</h1>
                </div>) }
        </nav>
        
        <ul className={styles.settingsContent}>{ PAGES[page] }</ul>
    </dialog>
}

const keybindTypes = [
    ["Move Up", "moveUp"],
    ["Move Left", "moveLeft"],
    ["Move Down", "moveDown"],
    ["Move Right", "moveRight"],
    ["Shoot/Throw", "shoot"],
    ["Zoom", "zoom"],
    ["Previous Weapon", "prevWeapon"],
    ["Next Weapon", "nextWeapon"]
]

function KeybindsTab(props) {
    const [ focusedOption, setFocused ] = useState(null);

    const dispatch = useDispatch();
    const keybinds = useSelector(state => state.settings.keybinds);

    const dispatchKey = (type, key) => {
        dispatch(setKeybind({ type: type.slice(0, -1), key, slot: type.at(-1) }));
        setFocused(null);
    }

    useEffect(() => {
        if (!focusedOption) return;

        const keyDownHandler = e => dispatchKey(focusedOption, e.code);
        const mouseDownHandler = e => dispatchKey(focusedOption, keyHandler.MOUSE_BUTTONS[e.button]);

        const mouseWheelListener = e => {
            for (const [axis, amount] of Object.entries({ x: e.deltaX, y: e.deltaY, z: e.deltaZ })) {
                if (amount == 0) continue; // no change
                dispatchKey(focusedOption, keyHandler.MOUSE_WHEEL_ACTIONS[axis][amount > 0? 1 : 0])
                return;
            }
        };

        setTimeout(() => {
            window.addEventListener("keydown", keyDownHandler);
            window.addEventListener("mousedown", mouseDownHandler);
            window.addEventListener("wheel", mouseWheelListener);
        }, 1);

        return () => {
            window.removeEventListener("keydown", keyDownHandler);
            window.removeEventListener("mousedown", mouseDownHandler);
            window.removeEventListener("wheel", mouseWheelListener);
        }
    }, [focusedOption]);

    return <>
        { keybindTypes.map(kbType => 
            <li key={kbType[1]} className={styles.settingsOption}>
                {kbType[0]}:

                <div className={`${styles.keyInput} ${focusedOption == kbType[1]+"0"? styles.focusedKeyInput : ""}`} 
                    onMouseDown={e => focusedOption == kbType[1] || setFocused(kbType[1]+"0")}>

                    {focusedOption == kbType[1]+"0"? "Press a Key" : keybinds[kbType[1]][0] || "None"}
                </div>

                <div className={`${styles.keyInput} ${focusedOption == kbType[1]+"1"? styles.focusedKeyInput : ""}`} 
                    onMouseDown={e => focusedOption == kbType[1] || setFocused(kbType[1]+"1")}>

                    {focusedOption == kbType[1]+"1"? "Press a Key" : keybinds[kbType[1]][1]}
                </div>
            </li>
        )}
    </>;
}

function DevTab(props) {
    const settings = useSelector(state => state.settings);

    const dispatch = useDispatch();
    const dispatchCheckbox = (key, e) => dispatch(setSetting({ key, value: e.target.checked }));

    return <>
        <li className={styles.settingsOption}>
            <input type={"checkbox"} checked={settings.zoomedViewCone} onChange={e => dispatchCheckbox("zoomedViewCone", e)}/> Zoomed View Cone (WIP)</li>
        <li className={styles.settingsOption}>
            <input type={"checkbox"} checked={settings.zoomCurve} onChange={e => dispatchCheckbox("zoomCurve", e)}/> Zoom Curve</li>
        <li className={styles.settingsOption}>
            <input type={"checkbox"} checked={settings.toggledZoom} onChange={e => dispatchCheckbox("toggledZoom", e )}/> Toggled Zoom</li>
        <li className={styles.settingsOption}>
            <input type={"checkbox"} checked={settings.alwaysZooming} onChange={e => dispatchCheckbox("alwaysZooming", e )}/> Always Zooming</li>
    </>;
}