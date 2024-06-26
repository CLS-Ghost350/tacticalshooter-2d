import util from "@shared/util";

export default class Bow extends Phaser.GameObjects.Sprite {
    FRAME_RATE = 16;

    constructor(game,player) {
        super(game,player.x,player.y,"bowSpritesheet");
        game.add.existing(this);

        this.game = game;
        this.player = player;

        this.setScale(1.8);
        this.setDepth(-1)
        this.setVisible(false);
    }

    preUpdate(time,delta) {
        super.preUpdate(time,delta);
        
        if (this.visible) {
            this.setAngle(util.angleOverflowCheck(this.player.angle + 90));
            this.x = this.player.x
            this.y = this.player.y 
            this.x += Math.cos(util.angleOverflowCheck(this.rotation - Math.PI/2,false)) * 19;
            this.y += Math.sin(util.angleOverflowCheck(this.rotation - Math.PI/2,false)) * 19;
        }
    }

    playAnimation() {
        this.setVisible(true);
        this.play("bowAnimation");
    }

    stopAnimation() {
        this.setVisible(false);
    }
}