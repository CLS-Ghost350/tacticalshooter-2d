import Main from "./components/Main.jsx"

import ReactDOM from "react-dom/client"
import React from "react"

import Phaser from "phaser";
import CONFIG from "./phaserConfig";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Main/>);

const phaserGame = new Phaser.Game(CONFIG);