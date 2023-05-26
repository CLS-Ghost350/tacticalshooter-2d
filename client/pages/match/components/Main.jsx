import React from "react";
import { useState, useEffect } from "react";

import styles from "@/styles/match.module.css"

import SettingsMenu from "./SettingsMenu.jsx";

export default function Main(props) {
    const [ settingsOpen, setSettingsOpen ] = useState(false);

    return <>
        <img className={styles.settingsIcon} src="/assets/settingsIcon.png" onClick={ () => setSettingsOpen(!settingsOpen) }/>
        <SettingsMenu open={settingsOpen} close={ () => setSettingsOpen(false) }/>
    </>
}