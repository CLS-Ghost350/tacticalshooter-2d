import React from "react";
import { useState, useEffect } from "react";

import styles from "@/styles/home.module.css"

import { getMatchURL } from "@/pages/home/utils.jsx"

export default function Home(props) {
    const [ showMatchList, setShowMatchList ] = useState(false)

    return <div className={styles.outerDiv}>
        <h1>Bow Game</h1>

        {showMatchList? (<MatchList goBack={() => setShowMatchList(false)}/>) : 
            (<>
                <button type="button" onClick={() => props.setAppState("hostMatch")}>Host Match</button>
                <button type="button" onClick={() => setShowMatchList(true)}>Match List</button>
            </>)
        }
    </div>
}

function MatchList(props) {
    const [ matches, setMatches ] = useState({})
    const [ selectedMatch, setSelectedMatch ] = useState(null)

    useEffect(() => {
        const getMatches = () => fetch("/matches").then(res => res.json().then(data => setMatches(data.matches)));
        getMatches()
        const getMatchesInterval = setInterval(getMatches, 1000);
        return () => clearInterval(getMatchesInterval)
    }, [])

    const noSelectedMatch = selectedMatch == null;

    return <>
        <button type="button" onClick={props.goBack}>Back</button>
        
        <table className={styles.matchList}>
            <tbody>
                {Object.entries(matches).map(([ matchID, match ], i) => <MatchListEntry 
                    key={matchID} 
                    match={match} 
                    selected={selectedMatch==matchID} 
                    selectThis={() => setSelectedMatch(matchID)}
                />)}
            </tbody>
        </table>

        <button type="button" 
            onClick={() => window.location.href = getMatchURL(selectedMatch)} 
            disabled={noSelectedMatch || matches[selectedMatch].full}> Join </button>
    </>
}

function MatchListEntry(props) {
    return <tr className={`${styles.matchListEntryDiv} ${props.selected ? styles.selectedMatch : ""}`} onClick={props.selectThis}>
        <td className={styles.matchTD}>{props.match.description}</td>
        <td className={styles.matchTD}>{props.match.time} Minutes</td>
        <td className={styles.matchTD}>{props.match.players}/6 Players</td>
    </tr>
}