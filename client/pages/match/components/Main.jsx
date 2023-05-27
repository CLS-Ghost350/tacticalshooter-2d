import React from "react";
import { useState, useEffect } from "react";

import styles from "@/styles/match.module.css"

import SettingsMenu from "./SettingsMenu.jsx";
import Scoreboard from "./Scoreboard.jsx";

export default function Main(props) {
    const [ settingsOpen, setSettingsOpen ] = useState(false);
    const [ scoreboardOpen, setScoreboardOpen ] = useState(true);

    return <>
        <img className={styles.settingsIcon} src="/assets/settingsIcon.png" onClick={ () => setSettingsOpen(!settingsOpen) }/>
        { settingsOpen? <SettingsMenu open={settingsOpen} setOpen={ val => setSettingsOpen(val) }/> : null }
        { scoreboardOpen? <Scoreboard open={scoreboardOpen} setOpen={ val => setScoreboardOpen(val) }/> : null }
    </>
}