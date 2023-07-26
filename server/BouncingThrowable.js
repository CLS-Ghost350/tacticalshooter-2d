const GameObject = require("./GameObject.js");

const util = require("../shared/util");
const collisions = require("../shared/collisions");

module.exports = class BouncingThrowable extends GameObject {
    position = { x: 0, y: 0 };
    angle;
    
    #velocity = 1000;

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

        //console.log(distance + " " + this.#velocity)

        this.angle = util.degreesToRadians(angle);
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
        this.moveHandleCollisions(avgVel * deltaTime);
    }

    moveHandleCollisions(moveDist, iterations=0) {
        const EPSILON = 0.01;

        const moveX = Math.cos(this.angle) * moveDist;
        const moveY = Math.sin(this.angle) * moveDist;

        let minMove = moveDist;
        let minMoveNormalAngle;

        for (const wall of this.match.walls) {
            const coll = collisions.movingCircleLine(
                this.position.x, this.position.y,
                this.radius,
                moveX, moveY,
                wall.start.x, wall.start.y,
                wall.end.x, wall.end.y
            );

            if (!coll) continue;

            if (coll.dist < minMove) {
                minMove = coll.dist;
                minMoveNormalAngle = coll.collAngle;
            }

            //this.match.emitDebugPoint({ id: "BT_closest", x: closestX, y: closestY, color: 0x00FF00 })
        }

        // if (minMoveWallAngle) console.log(minMove);
        // else console.log("no coll " + moveDist)

        minMove -= EPSILON;

        this.position.x += Math.cos(this.angle) * minMove;
        this.position.y += Math.sin(this.angle) * minMove;

        if (minMoveNormalAngle != null) {
            let normalAngle = util.angleOverflowCheckRadians(minMoveNormalAngle);
            if (normalAngle < 0) normalAngle += Math.PI;

            //this.match.emitDebugPoint({ id: "BT_normalAngleDir", x: this.position.x + Math.cos(normalAngle) * 200, y: this.position.y + Math.sin(normalAngle) * 200, color: 0x0000FF })
            //this.match.emitDebugPoint({ id: "BT_newPosition", x: this.position.x, y: this.position.y, color: 0x2299FF })

            let newAngle = util.angleOverflowCheckRadians(2*normalAngle - this.angle);

            // ensure new angle is on same side of normal as old angle
            if (this.angle > normalAngle - Math.PI && this.angle < normalAngle) {
                if (!(newAngle > normalAngle - Math.PI && newAngle < normalAngle)) newAngle += Math.PI;
            } else if (newAngle > normalAngle - Math.PI && newAngle < normalAngle) newAngle += Math.PI;

            //console.log(this.angle + " " + newAngle);
            this.angle = util.angleOverflowCheckRadians(newAngle);

            //console.log(util.angleOverflowCheckRadians(this.angle))
            //this.match.emitDebugPoint({ id: "BT_newAngleDir", x: this.position.x + Math.cos(this.angle) * 200, y: this.position.y + Math.sin(this.angle) * 200, color: 0xFF0000 })

            if (iterations < 10)
                this.moveHandleCollisions(moveDist - Math.max(minMove, 0), iterations + 1)

            //this.#velocity = 0;
        }
    }
}