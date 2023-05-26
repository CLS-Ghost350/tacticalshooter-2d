import Phaser from 'phaser';

import LoadScene from "./scenes/LoadScene";
import GameScene from "./scenes/GameScene";

const CONFIG = {
    type: Phaser.AUTO,
    parent: "gameArea",
    width: Math.round(1.333333333333333*(window.innerHeight-20)),
    height: window.innerHeight-20,
    //backgroundColor: "#fc00f8",
    scene: [LoadScene,GameScene]
}

export default CONFIG;