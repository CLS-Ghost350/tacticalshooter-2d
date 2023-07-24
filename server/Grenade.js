const GameObject = require("./GameObject.js");

const Player = require("./Player.js");
const util = require("../shared/util");
const collisions = require("../shared/collisions");
const BouncingThrowable = require("./BouncingThrowable.js");

module.exports = class Grenade extends BouncingThrowable {
    static RADIUS = 10;
    static FRICTION_SUB = 2000;
    static EXPLOSION_TIME = 1.5;
    static EXPLOSION_RADIUS = 80;

    #explosionTimer;

    constructor(match, x, y, angle, dist, team) {
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

        this.team = team;

        this.#explosionTimer = Grenade.EXPLOSION_TIME;
    }

    update(TIME_SINCE) {
        this.#explosionTimer -= TIME_SINCE;

        if (this.#explosionTimer < 0) 
            return this.explode();

        super.update(TIME_SINCE);

        this.emitUpdate(this.match.namespace);
    }

    emitUpdate(socket) {
        socket.emit("grenade",{ 
            id: this.id, 
            x: this.position.x, 
            y: this.position.y, 
            angle: this.angle
        });
    }

    explode() {
        for (const conn of Object.values(this.match.connections)) {
            if (!conn.player) continue;
            //if (conn.team == this.team) continue;

            if (collisions.circleCircle(this.position.x, this.position.y, Grenade.EXPLOSION_RADIUS, 
                conn.player.position.x, conn.player.position.y, conn.player.RADIUS)) {
                    conn.player.kill();
                }
        }

        this.destroy()
    }

    destroy() {
        this.emitUpdate(this.match.namespace);
        this.match.namespace.emit("grenadeDestory",{ id: this.id });
        super.destroy();
    }
}