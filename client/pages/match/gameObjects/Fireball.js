import util from "@shared/util";

export default class Fireball extends Phaser.GameObjects.Sprite {

    constructor(game, msg) {
        super(game, 0, 0, "fireballSpritesheet");
        game.add.existing(this);

        this.game = game;

        this.setScale(1.5);
        this.setDepth(-1)

        this.setOrigin(0.78, 0.5)

        this.handleServerUpdate(msg);
        this.playAnimation();

        //console.log("create")
    }

    preUpdate(time,delta) {
        super.preUpdate(time,delta);
    }

    playAnimation() {
        this.play("fireballAnimation");
    }

    stopAnimation() {
        this.setVisible(false);
    }

    handleServerUpdate(msg) {
        this.setPosition(msg.x,msg.y);
        this.angle = msg.angle;
    }

    handleServerDestroy(msg) {
        //delete this.game.grenades[msg.id];
        //console.log("test")
        this.destroy();
    }
}