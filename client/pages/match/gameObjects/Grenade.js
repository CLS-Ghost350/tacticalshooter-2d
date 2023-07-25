export default class Grenade extends Phaser.GameObjects.Image {
    constructor(game, msg) {
        super(game, 0, 0, "demoCircleImg");
        game.add.existing(this);

        game.grenades[msg.id] = this;

        this.game = game;

        this.setDepth(1000)
        this.setScale(0.5);

        this.handleServerUpdate(msg);
    }


    preUpdate(time,delta) {
    
    }

    handleServerUpdate(msg) {
        this.setPosition(msg.x,msg.y);
        this.angle = msg.angle;
    }

    handleServerDestroy(msg) {
        delete this.game.grenades[msg.id];
        this.destroy();
    }
}