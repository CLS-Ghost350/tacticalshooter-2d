const GameObject = require("./GameObject.js");

const Player = require("./Player.js");
const util = require("../shared/util");
const collisions = require("../shared/collisions");
const BouncingThrowable = require("./BouncingThrowable.js");

module.exports = class Grenade extends BouncingThrowable {
    static RADIUS = 10;
    static FRICTION_SUB = 2000;
    static EXPLOSION_TIME = 1.5;

    #explosionTimer;

    constructor(match, x, y, angle, dist) {
        super(
            match, 
            "grenade", 
            Grenade.RADIUS,
            Grenade.FRICTION_SUB,
            x, 
            y,
            angle, 
            dist,
            Grenade.EXPLOSION_TIME,
        );

        this.#explosionTimer = Grenade.EXPLOSION_TIME;
    }

    update(TIME_SINCE) {
        this.#explosionTimer -= TIME_SINCE;

        if (this.#explosionTimer < 0) 
            return this.destroy();

        super.update(TIME_SINCE);

        this.match.namespace.emit("grenade",{ 
            id: this.id, 
            x: this.position.x, 
            y: this.position.y, 
            angle: this.angle
        });
    }

    destroy() {
        this.match.namespace.emit("grenadeDestory",{ id: this.id });
        super.destroy();
    }
}