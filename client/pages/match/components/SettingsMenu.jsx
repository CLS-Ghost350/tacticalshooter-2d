import React from "react";
import { useState, useEffect } from "react";

import { useSelector, useDispatch } from 'react-redux';
import { setSetting, setKeybind } from '../settingsSlice';

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

const MOUSE_BUTTONS = ["MouseLeft", "MouseMiddle", "MouseRight"];

const keybindTypes = [
    ["Move Up", "moveUp"],
    ["Move Left", "moveLeft"],
    ["Move Down", "moveDown"],
    ["Move Right", "moveRight"],
    ["Draw Bow", "drawBow"],
    ["Zoom", "zoom"]
]

function KeybindsTab(props) {
    const [ focusedOption, setFocused ] = useState(null);

    const dispatch = useDispatch();
    const keybinds = useSelector(state => state.settings.keybinds);

    const dispatchKey = (type, key) => {
        dispatch(setKeybind({ type, key }));
        setFocused(null);
    }

    useEffect(() => {
        if (!focusedOption) return;

        const keyDownHandler = e => dispatchKey(focusedOption, e.code);
        const mouseDownHandler = e => dispatchKey(focusedOption, MOUSE_BUTTONS[e.button]);

        window.addEventListener("keydown", keyDownHandler);
        setTimeout(() => window.addEventListener("mousedown", mouseDownHandler), 1);

        return () => {
            window.removeEventListener("keydown", keyDownHandler);
            window.removeEventListener("mousedown", mouseDownHandler);
        }
    }, [focusedOption]);

    return <>
        { keybindTypes.map(kbType => 
            <li key={kbType[1]} className={styles.settingsOption}>
                {kbType[0]}:

                <div className={`${styles.keyInput} ${focusedOption == kbType[1]? styles.focusedKeyInput : ""}`} 
                    onMouseDown={e => focusedOption == kbType[1] || setFocused(kbType[1])}>

                    {focusedOption == kbType[1]? "Press a Key" : keybinds[kbType[1]]}
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