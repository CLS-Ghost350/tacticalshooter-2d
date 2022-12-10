import Main from "./components/Main.jsx"

import ReactDOM from "react-dom/client"
import React from "react"

import { store } from './store'
import { Provider } from 'react-redux'

import Phaser from "phaser";
import CONFIG from "./phaserConfig";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Provider store={store}><Main/></Provider>);

const phaserGame = new Phaser.Game(CONFIG);