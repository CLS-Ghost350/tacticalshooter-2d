import React from "react";
import { useState, useEffect } from "react";

import styles from "@/styles/match.module.css"

import SettingsMenu from "./SettingsMenu.jsx";
import Scoreboard from "./Scoreboard.jsx";
import WeaponsList from "./WeaponsList.jsx";

import socket from "../socket";

export default function Main(props) {
    const [ settingsOpen, setSettingsOpen ] = useState(false);
    const [ scoreboardOpen, setScoreboardOpen ] = useState(true);

    useEffect(() => {
        const listener = msg => {
            if (msg.socketId == socket.id) {
                setTimeout(() => setScoreboardOpen(true), 1500);
            }
        }

        socket.on("playerLeft", listener);

        return () => socket.off('playerLeft', listener);
    });


    return <>
        <img className={styles.settingsIcon} src="/assets/settingsIcon.png" onClick={ () => setSettingsOpen(!settingsOpen) }/>
        <SettingsMenu open={settingsOpen} close={ () => setSettingsOpen(false) }/>
        <Scoreboard open={scoreboardOpen} close={ () => setScoreboardOpen(false) }/>
        <WeaponsList/>
    </>
}