const GameObject = require("./GameObject");
const util = require("../shared/util");
const collisions = require("../shared/collisions");

module.exports = class Player extends GameObject {
    // move settings to seperate file? make them static?
    RADIUS = 15;

    DEFAULT_ACCEL = 3.6;
    BOW_DRAW_MOVE_ACCEL = 2.9;
    MOVE_FRICTION = 0.5;

    ROTATION_ACCEL = 0.45;
    ROTATION_DECCEL = 1.1; // above 1
    ROTATION_FRICTION = 0.3;

    BOW_DRAW_TIME = 17;

    rotationVel = 0;
    angle = 0;
    position = { x: 300, y: 700 };
    vel = { x: 0, y: 0 };
    move = { x: 0, y: 0 };

    previousWalls = [];

    bowDrawStatus = 0;

    constructor(game,id,connection) {
        super();
        this.ID = id;
        this.game = game;
        this.connection = connection;

        this.game.io.emit("player", { x: 0, y: 0, angle: 0, id: this.ID});
    }

    update(deltaTime) {
        const deltaTimeMul = deltaTime/1000 * this.game.CORRECT_TPS;

        this.updatePosition(deltaTimeMul);
        this.collideWalls();
        this.updateRotation(deltaTimeMul);
        this.updateBow();

        this.game.io.emit("player",{
            x: this.position.x,
            y: this.position.y,
            angle: this.angle,
            id: this.ID
        });
    }

    updateBow() {
        if (this.connection.keyStates.includes("shoot")) { // holding shoot button (right-click)
            if (this.bowDrawStatus == 0) this.game.io.emit("bowDraw",{ playerID: this.ID }) // start drawing
            if (this.bowDrawStatus < this.BOW_DRAW_TIME) this.bowDrawStatus += 1; // increase time drawn
        } else if (this.bowDrawStatus > 0) {
            if (this.bowDrawStatus == this.BOW_DRAW_TIME) {
                const arrow = this.game.createArrow(this.game, this.position.x, this.position.y, this.angle, this.ID)
            }

            this.game.io.emit("bowDrawStop",{ playerID: this.ID });
            this.bowDrawStatus = 0;
        }
    }

    updatePosition(deltaTimeMul) {
        this.move.x = 0;
        this.move.y = 0;

        const keyStates = this.connection.keyStates;

        if (keyStates.includes("moveUp")) this.move.y -= 1;
        if (keyStates.includes("moveDown")) this.move.y += 1;
        if (keyStates.includes("moveLeft")) this.move.x -= 1;
        if (keyStates.includes("moveRight")) this.move.x += 1;

        if (this.move.x != 0 && this.move.y != 0) {
            this.move.x *= 0.707 * deltaTimeMul;
            this.move.y *= 0.707 * deltaTimeMul;
        }

        if (this.bowDrawStatus > 0) {
            this.vel.x += this.move.x * this.BOW_DRAW_MOVE_ACCEL;
            this.vel.y += this.move.y * this.BOW_DRAW_MOVE_ACCEL;
        } else {
            this.vel.x += this.move.x * this.DEFAULT_ACCEL;
            this.vel.y += this.move.y * this.DEFAULT_ACCEL;
        }

        this.position.x += this.vel.x * deltaTimeMul;
        this.position.y += this.vel.y * deltaTimeMul;

        this.vel.x *= this.MOVE_FRICTION ** deltaTimeMul;
        this.vel.y *= this.MOVE_FRICTION ** deltaTimeMul;
    }

    updateRotation(deltaTimeMul) {
        const targetAngle = this.connection.targetAngle;

        let dist = targetAngle - this.angle;
        if (dist > 180) dist -= 360;
        else if (dist < -180) dist += 360;

        this.rotationVel += this.ROTATION_ACCEL * (dist - this.rotationVel*this.ROTATION_DECCEL) * deltaTimeMul;

        this.angle += this.rotationVel * deltaTimeMul;
        this.angle = util.angleOverflowCheck(this.angle);
        this.rotationVel *= this.ROTATION_FRICTION ** deltaTimeMul;
    }

    collideWalls() {
        // temperary solution:
        // prioritize walls whoses angles are closer being perpendicular to the player's velocity's angle
        // then, prioritize updating previous walls
        // has many bugs, not efficient (implementation using set, sorting array for each player), fix this later
        const vAngle = Math.atan2(this.vel.y, this.vel.x);
        const pvAngle = vAngle + Math.PI/2;

        this.game.walls.sort((a, b) => {
            const wAngle1 = Math.abs(Math.atan2(a.end.y - a.start.y, a.end.x - a.start.x));
            const wAngle2 = Math.abs((Math.atan2(b.end.y - b.start.y, b.end.x - b.start.x)));

            if (Math.abs(pvAngle - wAngle1) < Math.abs(pvAngle - wAngle2)) return -1;
            else return 1;
        })

        const newWalls = [];
        const mergedWalls = [ ...new Set([ ...this.previousWalls, ...this.game.walls ]) ];

        for (const wall of mergedWalls) {
             // returns the closest point to the circle on the line if intersecting or null

            const { x: x1, y: y1 } = wall.start;
            const { x: x2, y: y2 } = wall.end;

            const dx = x2 - x1;
            const dy = y2 - y1;
    
            const len = Math.sqrt(dx**2 + dy**2);
        
            // get dot product of the line and circle
            const dot = ( ((this.position.x-x1)*dx) + ((this.position.y-y1)*dy) ) / len**2;
        
            // find the closest point on the line
            const closestX = x1 + (dot * dx);
            const closestY = y1 + (dot * dy);

            const pdx = closestX - this.position.x;
            const pdy = closestY - this.position.y;

            let distance;

            // is the player colliding?
            const intersecting = (() => {
                // is either end inside the circle?
                if (collisions.pointCircle(x1,y1, this.position.x,this.position.y,this.RADIUS) || 
                    collisions.pointCircle(x2,y2, this.position.x,this.position.y,this.RADIUS)) {

                    distance = Math.sqrt(pdx**2 + pdy**2);
                    return true;
                }

                // is the closest point actually on the line segment?
                if (!collisions.linePoint(x1,y1,x2,y2, closestX,closestY,len)) return false;

                // get distance to closest point
                distance = Math.sqrt(pdx**2 + pdy**2);
                if (distance <= this.RADIUS) return true;

                return false;
            })();

            if (!intersecting) continue;

            newWalls.push(wall);

            const scale = this.RADIUS/distance - 1;
            const moveX = scale * pdx;
            const moveY = scale * pdy;
            
            this.position.x -= moveX;
            this.position.y -= moveY;
        }

        this.previousWalls = newWalls;
    }

    kill() {
        this.connection.destroy();
        this.destroy();
    }
}

