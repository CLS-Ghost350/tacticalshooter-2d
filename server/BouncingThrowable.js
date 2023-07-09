const GameObject = require("./GameObject.js");

const util = require("../shared/util");
const collisions = require("../shared/collisions");

module.exports = class BouncingThrowable extends GameObject {
    position = { x: 0, y: 0 };
    angle;
    #velocity = 1000;

    #cosAngle;
    #sinAngle;

    //frictionMul = 0.3;
    frictionSub = 100;

    radius = 10;

    constructor(match, type, radius, frictionSub, x, y, angle, distance, time) {
        super(match, type)

        this.radius = radius;

        this.position.x = x;
        this.position.y = y;

        //this.frictionMul = frictionMul;
        this.frictionSub = frictionSub;

        this.match = match;

        this.#velocity = Math.sqrt(2 * frictionSub * distance); // dist travelled until vel is 0

        if (time > 0 && this.#velocity/frictionSub > time) // time will be up before velocity hits 0 (stops moving)
            this.#velocity = distance/time + frictionSub*time/2; // time < 0 = infinite time

        console.log(distance + " " + this.#velocity)

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

    updatePosition(deltaTime) {
        const oldVel = this.#velocity;

        this.#velocity -= this.frictionSub*deltaTime;
        this.#velocity = Math.max(this.#velocity, 0);

        const avgVel = (oldVel+this.#velocity) / 2

        this.position.x += this.#cosAngle * avgVel * deltaTime;// + rotationSin * this.#velocity;
        this.position.y += this.#sinAngle * avgVel * deltaTime;//+ rotationCos * this.#velocity;

        //const coll = this.checkCollisions(newX, newY);

        //if (coll) {
            //console.log(coll)

            //this.position.x = coll.x;
            //this.position.y = coll.y;

            //this.#velocity = 0;

        //}
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
}