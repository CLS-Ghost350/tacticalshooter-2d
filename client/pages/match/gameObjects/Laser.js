import util from "@shared/util";

export default class Laser extends Phaser.GameObjects.Sprite {

    constructor(game, x, y, angle) {
        super(game, x, y, "laserSpritesheet");
        game.add.existing(this);

        this.game = game;

        this.setAngle(angle)
        this.setScale(10000, 1);
        this.setDepth(-1)

        this.setOrigin(0, 0.5);

        //this.handleServerUpdate(msg);
        this.playAnimation();

        //console.log("create")
    }

    preUpdate(time,delta) {
        super.preUpdate(time,delta);

        if (!this.visible) this.destroy();
    }

    playAnimation() {
        this.play("laserAnimation");
    }

    stopAnimation() {
        this.setVisible(false);
    }

    // handleServerUpdate(msg) {
    //     this.setPosition(msg.x,msg.y);
    //     this.angle = msg.angle;
    // }

    // handleServerDestroy(msg) {
    //     //delete this.game.grenades[msg.id];
    //     //console.log("test")
    //     this.destroy();
    // }
}