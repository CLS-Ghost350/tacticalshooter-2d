export default class Arrow extends Phaser.GameObjects.Image {
    constructor(game,x,y,angle) {
        super(game,x,y,"arrowImg");
        game.add.existing(this);

        this.setAngle(angle);
        this.game = game;
        this.setDepth(1000)
    }


    preUpdate(time,delta) {
    
    }
}