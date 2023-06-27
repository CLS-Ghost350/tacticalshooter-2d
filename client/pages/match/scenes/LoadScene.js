import Phaser from "phaser";

export default class LoadScene extends Phaser.Scene {
    constructor() { super("LoadScene"); }

    preload() {
        const asset = path => "/assets/" + path;
        const loadingText = this.add.text(100,100,"Loading - 0%");

        this.load.on("progress",percentage => {
            loadingText.setText("Loading - " + (percentage * 100).toString() + "%");
        })

        this.load.image("backgroundImg", asset("backgroundDemo.png"));
        this.load.image("playerImg",asset("playerDemo.png"));
        this.load.image("demoCircleImg",asset("ballThingy.png"));
        this.load.image("arrowImg", asset("arrowDemo.png"));
        this.load.image("shadowImg", asset("shadow.png"));

        this.load.image("minimapImg", asset("minimapDemo.png"));
        //this.load.svg("minimapImg", asset("minimap.svg"), { scale: 0.1 });
        this.load.image("minimapShadowsImg", asset("minimapShadows.png"));

        this.load.spritesheet("bowSpritesheet",asset("bowDemoSpritesheet.png"),{
            frameWidth: 21,
            frameHeight: 26,
            margin: 0,
            spacing: 0
        })
    }

    create() {
        this.scene.start("GameScene");
    }
};
