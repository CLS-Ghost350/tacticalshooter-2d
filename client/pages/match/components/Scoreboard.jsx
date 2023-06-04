import React from "react";
import { useEffect } from "react";

import styles from "@/styles/match.module.css"

import socket from "../socket";

import { useSelector, useDispatch } from 'react-redux';
import { setGameState } from '../storeSlices/gameSlice';
import { useState } from "react";

export default function Scoreboard({ open, close }) {
    const dispatch = useDispatch();

    // const [ teamAPlayers, setTeamAPlayers ] = useState(0);
    // const [ teamBPlayers, setTeamBPlayers ] = useState(0);

    // useEffect(() => {
    //     const updateScoreboard = msg => {
    //         let teamANum, teamBNum = 0;

    //         for (const player of msg.players) {
    //             if (player.team == "a") teamANum++;
    //             else if (player.team == "b") teamBNum++;
    //         }

    //         setTeamAPlayers(teamANum);
    //         setTeamBPlayers(teamBNum);
    //     }

    //     socket.on("scoreboard", updateScoreboard);
    //     return () => socket.off('scoreboard', updateScoreboard);
    // })

    const aTeamPlayers = useSelector(state => state.scoreboard.aTeamPlayers);
    const bTeamPlayers = useSelector(state => state.scoreboard.bTeamPlayers);

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
                <p className={styles.scoreboardTeamHeading}> Players: {aTeamPlayers}</p>
                <button type="button" onClick={() => join("a")}>Join Team A</button>
            </div>

            <div className={styles.scoreboardTeamOuter}>
                <h1 className={styles.scoreboardTeamHeading}>Team B</h1>
                <p className={styles.scoreboardTeamHeading}>Players: {bTeamPlayers}</p>
                <button type="button" onClick={() => join("b")}>Join Team B</button>
            </div>
        </div>
    </dialog>;
}