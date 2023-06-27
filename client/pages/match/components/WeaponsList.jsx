import React from "react";
import { useEffect } from "react";

import styles from "@/styles/match.module.css"

import socket from "../socket";
import keyHandler from "../keyHandler";

import { store } from "../store";

import { useSelector, useDispatch } from 'react-redux';
import { setGameState } from '../storeSlices/gameSlice';
import { useState } from "react";

const weapons = [
    { id: "knives", display: "Throwing Knives", img: "settingsIcon.png", max: 8 },
    { id: "fireballs", display: "Fireballs", img: "settingsIcon.png", max: 5 },
    { id: "bow", display: "Bow", img: "settingsIcon.png", max: -1 }
]

keyHandler.onInputDown("nextWeapon", () => {
    const curWeapon = store.getState().game.weaponSelected;
    let i = weapons.findIndex(weapon => weapon.id == curWeapon);

    i++;
    if (i >= weapons.length) i = 0; // potentially disable looping?
    const newWeapon = weapons[i].id;

    store.dispatch({ type: setGameState.toString(), payload : { key: "weaponSelected", value: newWeapon } });
})

keyHandler.onInputDown("prevWeapon", () => {
    const curWeapon = store.getState().game.weaponSelected;
    let i = weapons.findIndex(weapon => weapon.id == curWeapon);

    i--;
    if (i < 0) i = weapons.length - 1; // potentially disable looping?
    const newWeapon = weapons[i].id;

    store.dispatch({ type: setGameState.toString(), payload : { key: "weaponSelected", value: newWeapon } });
})

export default function WeaponsList() {
    const dispatch = useDispatch();

    const weaponCounts = useSelector(state => state.game.weaponCounts);
    const weaponSelected = useSelector(state => state.game.weaponSelected)

    // const join = team => {
    //     socket.emit("joinTeam", { team });
    //     dispatch(setGameState({ key: "team", value: team }))

    //     close();
    // }

    return <ul className={styles.weaponsList}>
        { weapons.map(weapon => 
            (weapon.max == -1 || weaponCounts[weapon.id] != 0) &&

                <li key={weapon.id} className={weapon.id == weaponSelected? styles.selectedWeapon : ""}>
                    <img src={`/assets/${weapon.img}`} width={50} height={50} />
                    { weapon.max == -1? "\u221E" : `${weaponCounts[weapon.id]}/${weapon.max}` }
                </li>
        ) }
    </ul>
}