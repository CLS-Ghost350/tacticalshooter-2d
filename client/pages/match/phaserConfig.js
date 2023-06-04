import Phaser from 'phaser';

import LoadScene from "./scenes/LoadScene";
import GameScene from "./scenes/GameScene";

const CONFIG = {
    type: Phaser.AUTO,
    parent: "gameArea",
    width: window.innerWidth,
    height: window.innerHeight,
    //backgroundColor: "#fc00f8",
    scene: [LoadScene,GameScene]
}

export default CONFIG;