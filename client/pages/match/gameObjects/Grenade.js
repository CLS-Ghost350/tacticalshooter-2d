export default class Grenade extends Phaser.GameObjects.Image {
    constructor(game,x,y,angle) {
        super(game,x,y,"demoCircleImg");
        game.add.existing(this);

        this.setAngle(angle);
        this.game = game;
        this.setDepth(1000)
    }


    preUpdate(time,delta) {
    
    }
}