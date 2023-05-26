import CONFIG from "../phaserConfig";

export default class Shadows extends Phaser.GameObjects.Image {
    constructor(game) {
        super(game, 0, 0, "shadowImg");
        game.add.existing(this);
        
        this.game = game;

        this.setScale(10000, 10000); // size of the map
        this.setDepth(100);
        this.setAlpha(0.65);
    }

    preUpdate(time,delta) {
        
    }

    kill() {
        this.destroy();
    }
}