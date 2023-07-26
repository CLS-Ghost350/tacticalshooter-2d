import CONFIG from "../phaserConfig";
import util from "@shared/util";
import Bow from "./Bow.js";

import socket from "../socket.js";
import { store } from "../store";
import { setScoreboardState, addPlayer, removePlayer } from "../storeSlices/scoreboardSlice";

export default class Player extends Phaser.GameObjects.Image {
    zoomDist = 0;

    constructor(game, msg) {
        super(game, 0, 0, "playerImg");
        game.add.existing(this);
        game.players[msg.id] = this;
        this.game = game;

        this.setScale(0.75);

        this.handleServerUpdate(msg);

        this.bow = new Bow(game, this);

        this.mainPlayer = msg.socketId == socket.id;

        if (this.mainPlayer) {
            game.players.main = this;
            game.cameras.main.startFollow(this, false, 0.9, 0.9);
        }

        store.dispatch(addPlayer({ player: { team: this.team } })); // the 'player' connections aren't linked w/ the physical players
    }

    preUpdate(time,delta) {
        //console.log(this.angle);

        if (this.team != this.game.players?.main?.team)
            this.setTint(0xff0000);
        else
            this.clearTint();
    }

    handleServerUpdate(msg) {
        this.setPosition(msg.x,msg.y);
        this.angle = msg.angle;

        this.team = msg.team;
        this.zoomDist = msg.zoomDist;

        this.setVisible(true);
    }

    handleServerDestroy(msg) {
        store.dispatch(removePlayer({ player: { team: this.team } }));
        delete this.game.players[msg.id];

        if (this.mainPlayer)
            delete this.game.players.main;

        this.kill()
    }

    kill() {
        this.bow.destroy();
        this.destroy();
    }
};