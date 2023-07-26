const GameObject = require("./GameObject.js");

const util = require("../shared/util");
const collisions = require("../shared/collisions");
const lineOfSight = require("./lineOfSight");

module.exports = class Fireball extends GameObject {
    static RADIUS = 11;
    static EXPLOSION_RADIUS = 30;
    static VELOCITY = 500;

    //static FRICTION_SUB = 2000;
    //static FRICTION_MUL = 1;

    position = { x: 0, y: 0 };

    #despawnTimer = 60;

    #moveX;
    #moveY;

    constructor(match, x, y, angle, team) {
        super(match, "fireball")

        this.team = team;
        this.angle = angle;

        const radianAngle = util.degreesToRadians(angle);
        this.#moveX = Math.cos(radianAngle) * Fireball.VELOCITY;
        this.#moveY = Math.sin(radianAngle) * Fireball.VELOCITY;

        this.position.x = x;
        this.position.y = y;

        this.moveHandleCollisions(0.06);

        //match.teams[team].obstructableObjects[this.id] = this;
    }

    getUpdateData() {
        return { 
            type: "fireball",
            id: this.id, 
            x: this.position.x, 
            y: this.position.y, 
            angle: this.angle
        };
    }

    // emitUpdate(socket) {
    //     socket.emit("gameObject", this.getUpdateData());
    // }

    // isVisibleFrom(x, y) {
    //     return lineOfSight.circleLineOfSight(x, y, this.position.x, this.position.y, Grenade.RADIUS, this.match.walls)
    // }

    update(TIME_SINCE) {
        this.#despawnTimer -= TIME_SINCE;

        if (this.#despawnTimer < 0) 
            return this.destroy();

        this.emitUpdate(this.match.namespace);

        this.moveHandleCollisions(TIME_SINCE);
    }

    moveHandleCollisions(TIME_SINCE) {
        const moveX = this.#moveX * TIME_SINCE;
        const moveY = this.#moveY * TIME_SINCE;

        let minMove = Infinity;
        let minMoveNewX = this.position.x + moveX;
        let minMoveNewY = this.position.y + moveY;

        for (const wall of this.match.walls) {
            const coll = collisions.movingCircleLine(
                this.position.x, this.position.y,
                Fireball.RADIUS,
                moveX, moveY,
                wall.start.x, wall.start.y,
                wall.end.x, wall.end.y
            );

            if (!coll) continue;

            if (coll.dist < minMove) {
                minMove = coll.dist;
                minMoveNewX = coll.x;
                minMoveNewY = coll.y;
            }
        }

        this.position.x = minMoveNewX;
        this.position.y = minMoveNewY;

        if (minMove != Infinity) 
            this.explode();
    }

    explode() {
        for (const conn of Object.values(this.match.connections)) {
            if (!conn.player) continue;
            //if (conn.team == this.team) continue;

            if (collisions.circleCircle(this.position.x, this.position.y, Fireball.EXPLOSION_RADIUS, 
                conn.player.position.x, conn.player.position.y, conn.player.RADIUS)) {
                    conn.player.kill();
                }
        }

        //this.match.emitDebugPoint({ id: "fireballExplosion", x: this.position.x, y: this.position.y, color: 0x00FF00, radius: Fireball.EXPLOSION_RADIUS })
        this.destroy();
    }

    destroy() {
        //this.emitUpdate(this.match.namespace);
        this.match.namespace.emit("gameObjectDestroy",{ id: this.id });
        //delete this.match.teams[this.team].obstructableObjects[this.id];
        super.destroy();
    }
}