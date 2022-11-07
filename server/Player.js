const GameObject = require("./GameObject");
const util = require("../shared/util");

module.exports = class Player extends GameObject {
    DEFAULT_ACCEL = 3.5;
    BOW_DRAW_MOVE_ACCEL = 3;
    MOVE_FRICTION = 0.5;

    ROTATION_ACCEL = 0.45;
    ROTATION_DECCEL = 1.1; // above 1
    ROTATION_FRICTION = 0.3;

    rotationVel = 0;
    angle = 0;
    vel = { x: 0, y: 0 };
    move = { x: 0, y: 0 };

    constructor(game,id,connection) {
        super(0,0);
        this.ID = id;
        this.game = game;
        this.connection = connection;
    }

    update(deltaTime) {
        const deltaTimeMul = deltaTime/1000 * this.game.CORRECT_TPS;

        this.updatePosition(deltaTimeMul);
        this.updateRotation(deltaTimeMul);
        this.updateBow();
    }

    updateBow() {
        
    }

    updatePosition(deltaTimeMul) {
        this.move.x = 0;
        this.move.y = 0;

        if (this.connection.keyStates.includes("moveUp")) this.move.y -= 1;
        if (this.connection.keyStates.includes("moveDown")) this.move.y += 1;
        if (this.connection.keyStates.includes("moveLeft")) this.move.x -= 1;
        if (this.connection.keyStates.includes("moveRight")) this.move.x += 1;

        if (this.move.x != 0 && this.move.y != 0) {
            this.move.x *= 0.707;
            this.move.y *= 0.707;
        }

        if (this.drawingBow > 0) {
            this.vel.x += this.move.x * this.BOW_DRAW_MOVE_ACCEL;
            this.vel.y += this.move.y * this.BOW_DRAW_MOVE_ACCEL;
        } else {
            this.vel.x += this.move.x * this.DEFAULT_ACCEL;
            this.vel.y += this.move.y * this.DEFAULT_ACCEL;
        }
    
        this.collisions.forEach(this.#handleCollisions)

        this.position.x += this.vel.x * deltaTimeMul;
        this.position.y += this.vel.y * deltaTimeMul;

        this.vel.x *= this.MOVE_FRICTION ** deltaTimeMul;
        this.vel.y *= this.MOVE_FRICTION ** deltaTimeMul;

        this.game.io.emit("player",{
            x: this.position.x,
            y: this.position.y,
            angle: this.angle,
            id: this.ID
        });
    }

    updateRotation(deltaTimeMul) {
        const targetAngle = this.connection.targetAngle;

        let dist = targetAngle - this.angle;
        if (dist > 180) dist = -360 + dist;
        else if (dist < -180) dist = 360 + dist;

        this.rotationVel += this.ROTATION_ACCEL * (dist - this.rotationVel*this.ROTATION_DECCEL);

        this.angle += this.rotationVel * deltaTimeMul;
        this.angle = util.angleOverflowCheck(this.angle);
        this.rotationVel *= this.ROTATION_FRICTION ** deltaTimeMul;
    }

    #handleCollisions = coll => {
        
    }
}

