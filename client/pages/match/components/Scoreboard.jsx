import React from "react";
import { useEffect } from "react";

import styles from "@/styles/match.module.css"

import socket from "../socket";

import { useSelector, useDispatch } from 'react-redux';
import { setGameState } from '../gameSlice';

export default function Scoreboard({ open, close }) {
    const dispatch = useDispatch();

    const join = team => {
        socket.emit("joinTeam", { team });
        dispatch(setGameState({ key: "team", value: team }))

        close();
    }

    return <dialog open={open} className={`${styles.scoreboard} ${styles.dialogModal}`}> 
        <header className={styles.scoreboardHeader}>AAA</header>

        <div className={styles.scoreboardTeamsContainer}>
            <div className={styles.scoreboardTeamOuter}>
                <h1 className={styles.scoreboardTeamHeading}>Team A</h1>
                <button type="button" onClick={() => join("a")}>Join Team A</button>
            </div>

            <div className={styles.scoreboardTeamOuter}>
                <h1 className={styles.scoreboardTeamHeading}>Team B</h1>
                <button type="button" onClick={() => join("b")}>Join Team B</button>
            </div>
        </div>
    </dialog>;
}