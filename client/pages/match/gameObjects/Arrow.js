export default class Arrow extends Phaser.GameObjects.Image {
    LENGTH = 18;
    FADE_OUT_LENGTH = 100;

    fadeOutTime = -1;

    constructor(game,x,y,angle) {
        super(game,x,y,"arrowImg");
        game.add.existing(this);

        this.setAngle(angle);
        this.game = game;
        this.setDepth(1000)
    }

    // arrow's tip points to position
    setPosition(x, y) {
        this.x = x - Math.cos(this.rotation) * this.LENGTH/2;
        this.y = y - Math.sin(this.rotation) * this.LENGTH/2;
    }

    preUpdate(time,delta) {
        if (this.fadeOutTime != -1) {
            this.fadeOutTime -= delta;

            if (this.fadeOutTime <= 0)
                this.destroy();

            this.setAlpha(this.fadeOutTime / this.FADE_OUT_LENGTH);
        }
    }

    fadeOutDestroy() {
        this.fadeOutTime = this.FADE_OUT_LENGTH;
    }
}