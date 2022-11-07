
import Phaser from "phaser";
import socket from "../socket";

import keyHandler from "../keyHandler";
import CONFIG from "../phaserConfig";

import Player from "../gameObjects/Player"

export default class GameScene extends Phaser.Scene {
    #gameInited = false;
    #players = {};

    constructor() { super("GameScene"); }

    init() {
        console.groupEnd();
        console.group("Game Scene");
        console.info({ "GAME SCENE STARTED": {} });
    }

    create() {
        this.backgroundImg = this.add.image(0,0,"backgroundImg");
        this.backgroundImg.setOrigin(0,0);
        this.backgroundImg.displayWidth = 2000;
        this.backgroundImg.displayHeight = 2000;
        this.backgroundImg.setDepth(-100);

        this.#handleSocket();

        socket.emit("joinGame");
    }

    update(time,delta) {
        if (!this.#gameInited) {
            if (this.#players[socket.id]) {
                this.#gameInited = true;
                this.#players.main = this.#players[socket.id];
                this.cameras.main.startFollow(this.#players.main); // add a tiny bit of camera lag
            } else return;
        }

        const keyStates = keyHandler.keyStates;

        const targetAngle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(
            CONFIG.width / 2,
            CONFIG.height / 2,
            this.input.activePointer.x,
            this.input.activePointer.y
        ));

        socket.emit("updateData",{ 
            targetAngle: targetAngle,
            keyStates: Array.from(keyStates)
        });
    }

    #handleSocket() {
        socket.removeAllListeners();

        socket.on("player",msg => {
            console.debug("test")
            const player = this.#players[msg.id];

            if (!player) {
                console.info({ "PLAYER JOINED": msg });
                this.#players[msg.id] = new Player(this,msg.x,msg.y,msg.angle,msg.id == socket.id);
            } else {
                player.setPosition(msg.x,msg.y);
                player.angle = msg.angle;
            }
        });

        socket.on("playerLeft", msg => {
            console.info({ "PLAYER LEFT": msg });
            if (this.#players[msg.id].mainPlayer) {
                setTimeout(() => window.location.reload(), 2000);
            }
            this.#players[msg.id].kill();
            delete this.#players[msg.id];
        });

        socket.on("bowDraw",msg => {
            this.#players[msg.playerID]?.bow.playAnimation();
        });

        socket.on("bowDrawStop",msg => {
            this.#players[msg.playerID]?.bow.stopAnimation();
        });
    }
};