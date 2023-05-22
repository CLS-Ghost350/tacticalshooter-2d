import CONFIG from "../phaserConfig";
//import Bow from "./Bow.js";

export default class Minimap extends Phaser.GameObjects.Image {
    #mapScale = 0.1;

    set mapScale(scale) {
        this.#mapScale = scale;
        this.setScale(scale * 6);
        this.shadows.setScale(this.scale);
        this.graphics.setPosition(CONFIG.width - 20 - this.displayWidth, 20);
    }

    get mapScale() { return this.#mapScale; }

    constructor(game, mapScale) {
        super(game, 0, 0, "minimapImg");
        game.add.existing(this);

        this.game = game;
        
        this.setOrigin(1, 0);
        this.setPosition(CONFIG.width - 20, 20);
        this.setScrollFactor(0);
        this.setDepth(200);

        this.graphics = this.game.add.graphics();
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(202);


        this.shadows = this.game.add.image(CONFIG.width - 20, 20, "minimapShadowsImg");//"shadowsTexture");
        this.shadows.setOrigin(1,0);
        this.shadows.setScrollFactor(0);
        this.shadows.setDepth(201);
        this.shadows.setAlpha(0.65);

        this.mapScale = mapScale;
    }

    preUpdate(time,delta) {
        this.graphics.clear();

        if (!this.game.players.main) return;

        const visibilityGraphics = Phaser.Utils.Objects.Clone(this.game.visibilityGraphics);
        visibilityGraphics.setPosition(CONFIG.width - 20 - this.displayWidth, 20);
        visibilityGraphics.setScrollFactor(0);
        visibilityGraphics.setScale(this.#mapScale);

        const shadowsVisibilityMask = visibilityGraphics.createGeometryMask();
        shadowsVisibilityMask.setInvertAlpha();

        this.shadows.setMask(shadowsVisibilityMask);

        const playerMapPos = this.worldCoordsToMinimap(this.game.players.main.x, this.game.players.main.y);
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillCircle(playerMapPos[0], playerMapPos[1], 3);
    }

    worldCoordsToMinimap(x, y) {
        return [ x * this.#mapScale, y * this.#mapScale ];
    }

    minimapCoordsToWorld(x, y) {
        return [ x / this.#mapScale, y / this.#mapScale ];
    }

    kill() {
        //this.bow.destroy();
        this.destroy();
    }
};