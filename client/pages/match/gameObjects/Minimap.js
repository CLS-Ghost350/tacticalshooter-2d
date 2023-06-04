import CONFIG from "../phaserConfig";
//import Bow from "./Bow.js";

export default class Minimap extends Phaser.GameObjects.Image {
    #mapScale = 0.1;

    set mapScale(scale) {
        this.#mapScale = scale;
        this.setScale(scale * 6);
        this.shadows.setScale(this.scale);
    }

    get mapScale() { return this.#mapScale; }

    constructor(game, mapScale) {
        super(game, 0, 0, "minimapImg");
        game.add.existing(this);

        this.game = game;
        
        this.setOrigin(1, 0);
        this.setScrollFactor(0);
        this.setDepth(200);

        this.graphics = this.game.add.graphics();
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(202);

        this.shadows = this.game.add.image(CONFIG.width - 20, 20, "minimapShadowsImg");//"shadowsTexture");
        this.shadows.setOrigin(1,0);
        this.shadows.setScrollFactor(0);
        this.shadows.setDepth(201);
        this.shadows.setAlpha(0.55);

        this.mapScale = mapScale;
    }

    preUpdate(time,delta) {
        this.setPosition(this.game.cameras.main.width - 20, 20);
        this.graphics.setPosition(this.game.cameras.main.x + this.game.cameras.main.width - 20 - this.displayWidth, 20);
        this.shadows.setPosition(this.game.cameras.main.width - 20, 20)

        this.graphics.clear();

        if (!this.game.players.main) return;

        const visibilityGraphics = Phaser.Utils.Objects.Clone(this.game.visibilityGraphics);
        visibilityGraphics.setPosition(this.game.cameras.main.width - 20 - this.displayWidth, 20);
        visibilityGraphics.setScrollFactor(0);
        visibilityGraphics.setScale(this.#mapScale);

        const shadowsVisibilityMask = visibilityGraphics.createGeometryMask();
        shadowsVisibilityMask.setInvertAlpha();

        this.shadows.setMask(shadowsVisibilityMask);

        for (const player of Object.values(this.game.players)) {
            if (player.team != this.game.players.main.team)
                continue;

            if (player.mainPlayer)
                this.graphics.fillStyle(0x0000FF, 1);
            else
                this.graphics.fillStyle(0x00ff00, 1);

            const playerMapPos = this.worldCoordsToMinimap(player.x, player.y);
            this.graphics.fillCircle(playerMapPos[0], playerMapPos[1], 3);
        }
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