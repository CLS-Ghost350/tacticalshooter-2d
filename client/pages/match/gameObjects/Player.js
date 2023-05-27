import CONFIG from "../phaserConfig";
import util from "@shared/util";
import Bow from "./Bow.js";

export default class Player extends Phaser.GameObjects.Image {

    constructor(game,x,y,angle,mainPlayer, team) {
        super(game,x,y,"playerImg");
        game.add.existing(this);
        
        this.game = game;
        this.mainPlayer = mainPlayer;

        this.setAngle(angle);
        this.setScale(0.75);

        this.bow = new Bow(game,this);
        this.team = team;
    }

    preUpdate(time,delta) {
        //console.log(this.angle);

        if (this.team != this.game.players?.main?.team)
            this.setTint(0xff0000);
        else
            this.clearTint();
    }

    kill() {
        this.bow.destroy();
        this.destroy();
    }
};