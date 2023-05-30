
const GameObject = require("./GameObject");
const util = require("../shared/util");
const collisions = require("../shared/collisions");

module.exports = class BouncingThrowable extends GameObject {
    position = { x: 0, y: 0 };
    angle;
    #velocity = 70;

    frictionMul = 0.9;
    frictionSub = 0;

    constructor(match, x, y, angle, distance, frictionMul, frictionSub) {
        super(match)

        this.position.x = x;
        this.position.y = y;

        this.frictionMul = frictionMul;
        this.frictionSub = frictionSub;

        this.match = match;
        this.#velocity = distance * this.frictionMul;

        const radianAngle = util.degreesToRadians(angle);
        this.#cosAngle = Math.cos(radianAngle);
        this.#sinAngle = Math.sin(radianAngle);
        this.angle = angle;
    }

    update(TIME_SINCE) {
        if (this.#velocity == 0) {

            
        } else {
            this.updatePosition(TIME_SINCE);
        }
    }

    updatePosition(TIME_SINCE) {
        const deltaTimeMul = TIME_SINCE / 1000 * 20;
        const newX = this.position.x + this.#cosAngle * this.#velocity * deltaTimeMul;// + rotationSin * this.#velocity;
        const newY = this.position.y + this.#sinAngle * this.#velocity * deltaTimeMul;//+ rotationCos * this.#velocity;

        const coll = this.checkCollisions(newX, newY);

        if (coll) {
            //console.log(coll)

            //this.position.x = coll.x;
            //this.position.y = coll.y;

            //this.#velocity = 0;

        } else {
            this.position.x = newX;
            this.position.y = newY;

            if (this.#velocity > 0) {
                this.#velocity *= this.frictionMul;
                this.#velocity -= this.frictionSub;
            }

            if (this.#velocity < 1) this.#velocity = 0;
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

        return closestColl;
    }

    destroy() {
        this.match.removeGameObject(this);
    }
}