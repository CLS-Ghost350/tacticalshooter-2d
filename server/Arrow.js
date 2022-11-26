
const GameObject = require("./GameObject");
const Player = require("./Player.js");
const util = require("../shared/util");
const collisions = require("../shared/collisions");

module.exports = class Arrow extends GameObject {
    static id = 0;

    position = { x: 0, y: 0 };
    angle;
    #velocity = 50;

    #despawnTimer = 300;

    #cosAngle;
    #sinAngle;

    get STARTING_VEL() { return 200; }
    get FRICTION_MUL() { return 0.95; }
    get FRICTION_SUB() { return 1; }

    constructor(game,x,y,angle,team) {
        super()

        this.position.x = x;
        this.position.y = y;

        this.id = Arrow.id;
        Arrow.id++;

        this.game = game;
        this.#velocity = this.STARTING_VEL;
        this.team = team;

        const radianAngle = util.degreesToRadians(angle);
        this.#cosAngle = Math.cos(radianAngle);
        this.#sinAngle = Math.sin(radianAngle);
        this.angle = angle;
    }

    update(TIME_SINCE) {
        if (this.#velocity == 0) {
            this.#despawnTimer--;
            if (this.#despawnTimer < 0) this.destroy();
        } else {
            this.updatePosition(TIME_SINCE);

            this.game.io.emit("arrow",{ 
                id: this.id, 
                x: this.position.x, 
                y: this.position.y, 
                angle: this.angle
            })
        }
    }

    updatePosition(TIME_SINCE) {
        const deltaTimeMul = TIME_SINCE / 1000 * 20;
        const newX = this.position.x + this.#cosAngle * this.#velocity * deltaTimeMul;// + rotationSin * this.#velocity;
        const newY = this.position.y + this.#sinAngle * this.#velocity * deltaTimeMul;//+ rotationCos * this.#velocity;

        const coll = this.checkCollisions(newX, newY);

        if (coll) {
            this.#velocity = 0;
            this.position.x = coll.x;
            this.position.y = coll.y;

            if (coll.object instanceof Player && coll.object.ID != this.team) {
                coll.object.kill();
            }

        } else {
            this.position.x = newX;
            this.position.y = newY;

            if (this.#velocity > 0) {
                this.#velocity *= this.FRICTION_MUL;
                this.#velocity -= this.FRICTION_SUB;
            }

            if (this.#velocity < 1) this.#velocity = 0;
            //if (this.#velocity < 1) this.destroy();
        }
    }

    checkCollisions(newX, newY) {
        let closestColl = null;

        for (const wall of this.game.walls) {
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

        for (const conn of Object.values(this.game.connections)) {
            if (!conn.player) continue;
            const player = conn.player;
            if (player.ID == this.team) continue;

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
                closestColl = { dx, dy, x: collX, y: collY, object: player };
        }

        return closestColl;
    }

    destroy() {
        super.destroy();
        this.game.io.emit("arrowDestory",{ id: this.id });
    }
}