export default class Arrow extends Phaser.GameObjects.Image {
    LENGTH = 18;
    FADE_OUT_LENGTH = 100;

    fadeOutTime = -1;

    constructor(game, msg) {
        super(game, 0, 0, "arrowImg");
        game.add.existing(this);

        game.arrows[msg.id] = this;

        this.game = game;

        this.setDepth(1000);
        this.setOrigin(0.9, 0.5); // arrow's tip points to position

        this.handleServerUpdate(msg);
    }

    preUpdate(time,delta) {
        if (this.fadeOutTime != -1) {
            this.fadeOutTime -= delta;

            if (this.fadeOutTime <= 0)
                this.destroy();

            this.setAlpha(this.fadeOutTime / this.FADE_OUT_LENGTH);
        }
    }

    handleServerUpdate(msg) {
        this.setPosition(msg.x,msg.y);
        this.angle = msg.angle;
    }

    handleServerDestroy(msg) {
        this.fadeOutDestroy();
        delete this.game.arrows[msg.id];
    }

    fadeOutDestroy() {
        this.fadeOutTime = this.FADE_OUT_LENGTH;
    }
}