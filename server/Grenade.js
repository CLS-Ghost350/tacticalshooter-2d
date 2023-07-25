const GameObject = require("./GameObject.js");

const Player = require("./Player.js");
const util = require("../shared/util");
const collisions = require("../shared/collisions");
const lineOfSight = require("./lineOfSight");
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

        match.teams[team].obstructableObjects[this.id] = this;

        this.#explosionTimer = Grenade.EXPLOSION_TIME;
    }

    update(TIME_SINCE) {
        this.#explosionTimer -= TIME_SINCE;

        if (this.#explosionTimer < 0) 
            return this.explode();

        super.update(TIME_SINCE);

        //this.emitUpdate(this.match.namespace);
    }

    getUpdateData() {
        return { 
            type: "grenade",
            id: this.id, 
            x: this.position.x, 
            y: this.position.y, 
            angle: this.angle
        };
    }

    // emitUpdate(socket) {
    //     socket.emit("gameObject", this.getUpdateData());
    // }

    isVisibleFrom(x, y) {
        return lineOfSight.circleLineOfSight(x, y, this.position.x, this.position.y, Grenade.RADIUS, this.match.walls)
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
        //this.emitUpdate(this.match.namespace);
        this.match.namespace.emit("gameObjectDestroy",{ id: this.id });
        delete this.match.teams[this.team].obstructableObjects[this.id];
        super.destroy();
    }
}