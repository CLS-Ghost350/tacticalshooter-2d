import React from "react";
import { useState, useEffect } from "react";

import styles from "@/styles/hostMatch.module.css"

import { getMatchURL } from "@/pages/home/utils.jsx"

export default function HostMatch(props) {
    const [ description, setDescription ] = useState("")
    const [ time, setTime ] = useState(15)

    const onSubmit = e => {
        e.preventDefault();

        fetch('/createMatch', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description, time })
        }).then(res => {
            res.json().then(data => window.location.href = getMatchURL(data.ID))
        })
    }

    return <div className={styles.outerDiv}>
        <form onSubmit={onSubmit} className={styles.form}>
            <button type="button" onClick={() => props.setAppState("home")}>Back</button>

            <h1>Host New Match</h1>
            <h2 className={styles.label}>Description:</h2>
            <input className={styles.input} type="text" maxLength="40" value={description} onChange={e => setDescription(e.target.value)}/>
            <h2 className={styles.label}>Time: {time} Minutes</h2>
            <input className={styles.input} type="range" min="3" max="30" value={time} onChange={e => setTime(e.target.value)}/>
            <input className={styles.input} type="submit" value="Host Game!"/>
        </form>
    </div>
}