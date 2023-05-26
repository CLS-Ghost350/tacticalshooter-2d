import React from "react";
import { useState, useEffect } from "react";

import Home from "./Home.jsx";
import HostMatch from "./HostMatch.jsx"

export default function Main(props) {
    const [ appState, setAppState ] = useState("home")

    switch (appState) {
        case "home":
            return <Home setAppState={setAppState}/>
        case "hostMatch":
            return <HostMatch setAppState={setAppState}/>
    }
}