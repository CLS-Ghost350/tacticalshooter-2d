const GameObject = require("./GameObject.js");

const Player = require("./Player.js");
const util = require("../shared/util");
const collisions = require("../shared/collisions");

module.exports = class Arrow extends GameObject {
    position = { x: 0, y: 0 };
    angle;
    #velocity = 70;

    #despawnTimer = 1000;

    #cosAngle;
    #sinAngle;

    get FRICTION_MUL() { return 0.3; }
    get FRICTION_SUB() { return 400; }

    get STOPPED_DESPAWN_TIME() { return 5; }
    get AIR_DESPAWN_TIME() { return 10; }
    get HIT_WALL_DESPAWN_TIME() { return 300; }

    get HIT_PLAYER_VEL_MUL() { return 0.125; }

    constructor(match, x, y, angle, vel, team) {
        super(match, "arrow");

        this.position.x = x;
        this.position.y = y;

        this.match = match;
        this.#velocity = vel;
        this.team = team;

        const radianAngle = util.degreesToRadians(angle);
        this.#cosAngle = Math.cos(radianAngle);
        this.#sinAngle = Math.sin(radianAngle);
        this.angle = angle;
    }

    update(TIME_SINCE) {
        if (this.#velocity == 0) {
            this.#despawnTimer--;

            if (this.#despawnTimer < 0) 
                return this.destroy();
        } else {
            this.updatePosition(TIME_SINCE);
        }

        this.match.namespace.emit("arrow",{ 
            id: this.id, 
            x: this.position.x, 
            y: this.position.y, 
            angle: this.angle
        });
    }

    updatePosition(TIME_SINCE) {
        //const deltaTimeMul = TIME_SINCE / 1000 * 20;

        const oldVel = this.#velocity;

        if (this.#velocity > 0) {
            this.#velocity *= this.FRICTION_MUL ** TIME_SINCE;
            this.#velocity -= this.FRICTION_SUB * TIME_SINCE;
        }

        const avgVel = (oldVel+this.#velocity) / 2;

        const newX = this.position.x + this.#cosAngle * avgVel * TIME_SINCE;// + rotationSin * this.#velocity;
        const newY = this.position.y + this.#sinAngle * avgVel * TIME_SINCE;//+ rotationCos * this.#velocity;

        const coll = this.checkCollisions(newX, newY);

        if (coll) {
            //console.log(coll)

            this.position.x = coll.x;
            this.position.y = coll.y;

            if (coll.isPlayer) {
                coll.object.kill();
                this.#velocity *= this.HIT_PLAYER_VEL_MUL;
                this.#despawnTimer = this.AIR_DESPAWN_TIME;
            } else {
                this.#velocity = 0;
                this.#despawnTimer = this.HIT_WALL_DESPAWN_TIME;
            }

        } else {
            this.position.x = newX;
            this.position.y = newY;

            if (this.#velocity < 1) {
                if (this.#velocity != 0)
                    this.#despawnTimer = this.STOPPED_DESPAWN_TIME;
                    
                this.#velocity = 0;
            }
            //if (this.#velocity < 1) this.destroy();
        }
    }

    checkCollisions(newX, newY) {
        let closestColl = null;

        for (const wall of this.match.walls) {
            const collPoint = collisions.lineLine(
                this.position.x, this.position.y,
                newX, newY,
                wall.start.x, wall.start.y,
                wall.end.x, wall.end.y,
            )

            if (!collPoint) continue;
            
            const dx = Math.abs(this.position.x - collPoint[0]);
            const dy = Math.abs(this.position.y - collPoint[1]);

            if (!closestColl || dx < closestColl.dx || dy < closestColl.dy) 
                closestColl = { dx, dy, x: collPoint[0], y: collPoint[1], object: wall };
        }

        for (const conn of Object.values(this.match.connections)) {
            if (!conn.player) continue;
            if (conn.team == this.team) continue;

            const player = conn.player;

            const collPoint = collisions.lineCircle(
                this.position.x, this.position.y, newX, newY,
                player.position.x, player.position.y, player.RADIUS
            )

            if (!collPoint) continue;

            const collX = player.position.x - this.#cosAngle*player.RADIUS;
            const collY = player.position.y - this.#sinAngle*player.RADIUS;

            const dx = Math.abs(this.position.x - collX);
            const dy = Math.abs(this.position.y - collY);

            if (!closestColl || dx < closestColl.dx || dy < closestColl.dy) 
                closestColl = { dx, dy, x: collX, y: collY, object: player, isPlayer: true };
        }

        return closestColl;
    }

    destroy() {
        this.match.namespace.emit("arrowDestory",{ id: this.id });
        super.destroy();
    }
}