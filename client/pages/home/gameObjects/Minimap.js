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
        this.setPosition(CONFIG.width - 20, 20);
        this.setScrollFactor(0);
        this.setDepth(200);
        //this.setScale(0.1);

        this.graphics = this.game.add.graphics();
        this.graphics.setPosition(CONFIG.width - 20 - this.displayWidth, 20);
        //this.graphics.setOrigin(1, 0);
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(202);

        /*
        const mapImg = this.game.add.image(0, 0, "minimapImg");
        mapImg.setOrigin(0,0)
        mapImg.setScale(mapScale * 6)
        mapImg.setVisible(false);
        this.imgMask = mapImg.createBitmapMask();
        */

        /*
        this.shadowImg = this.game.add.image(0,0, "shadowImg");
        this.shadowImg.setOrigin(0,0);
        //this.shadowImg.setVisible(false);
        this.shadowImg.setScale(this.displayWidth, this.displayHeight); // size of minimap
        //this.shadowImg.setScale(2000,2000)
        this.shadowImg.setDepth(100000)
        //this.shadowImg.setAlpha(0.65);
        this.shadowImg.setMask(this.imgMask);

        console.log({left: this.shadowImg.x, top: this.shadowImg.y, right: this.shadowImg.x + this.shadowImg.displayWidth, bottom: this.shadowImg.y + this.shadowImg.displayHeight})

        this.shadowsTexture = this.game.textures.addDynamicTexture("shadowsTexture", this.displayWidth * 1, this.displayHeight * 1);
        this.shadowsTexture.fill(0x0000ff, 0.5, 0, 100, 50, 50)
        this.shadowsTexture.draw(this.shadowImg, 0,);
        */

        this.shadows = this.game.add.image(CONFIG.width - 20, 20, "minimapShadowsImg");//"shadowsTexture");
        this.shadows.setOrigin(1,0);
        this.shadows.setScrollFactor(0);
        this.shadows.setDepth(201);

        this.shadows.setScale(this.displayWidth, this.displayHeight); // size of minimap
        this.shadows.setAlpha(0.65);

        console.log({left: this.shadows.x, top: this.shadows.y, right: this.shadows.x + this.shadows.displayWidth, bottom: this.shadows.y + this.shadows.displayHeight})
        
        //this.shadows.setVisible(false);

        //this.container = this.game.add.container(0, 0);
        //this.container.add(this.shadows);
        //this.container.setDepth(201)
        //this.container.setMask(this.createBitmapMask())

        //this.rt = this.game.add.renderTexture(CONFIG.width - 20 - this.displayWidth, 20, 1000, 1000);
        //this.rt.setOrigin(0,0);
        //this.rt.setScrollFactor(0);
        //this.rt.setDepth(201);
        //this.rt.setVisible(false);
        //this.rt.setMask(this.createBitmapMask());

        this.mapScale = mapScale;
        //this.mapImgScale = mapScale * 5;
    }

    preUpdate(time,delta) {
        this.graphics.clear();

        if (!this.game.players.main) return;

        //console.log({ x: this.game.input.activePointer.x, y: this.game.input.activePointer.y })

        const visibilityGraphics = Phaser.Utils.Objects.Clone(this.game.visibilityGraphics);
        visibilityGraphics.setPosition(CONFIG.width - 20 - this.displayWidth, 20);
        visibilityGraphics.setScrollFactor(0);
        visibilityGraphics.setScale(this.#mapScale);

        const shadowsVisibilityMask = visibilityGraphics.createGeometryMask();
        shadowsVisibilityMask.setInvertAlpha();

        this.shadows.setMask(shadowsVisibilityMask);

        //this.rt.clear();
        //this.rt.draw(this.shadows, 0, 0);

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