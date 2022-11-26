import CONFIG from "../phaserConfig";
import util from "@shared/util";
import Bow from "./Bow.js";

export default class Player extends Phaser.GameObjects.Image {
    ROTATION_SPEED = 1;

    constructor(game,x,y,angle,mainPlayer) {
        super(game,x,y,"playerImg");
        game.add.existing(this);
        
        this.game = game;
        this.mainPlayer = mainPlayer;

        this.setAngle(angle);
        this.setScale(0.75);

        this.bow = new Bow(game,this);
    }

    preUpdate(time,delta) {
        //console.log(this.angle);
    }

    kill() {
        this.bow.destroy();
        this.destroy();
    }
};