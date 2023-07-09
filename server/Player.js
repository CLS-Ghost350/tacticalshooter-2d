const GameObject = require("./GameObject.js");

const Arrow = require("./Arrow.js");
const BouncingThrowable = require("./BouncingThrowable.js");
const util = require("../shared/util");
const collisions = require("../shared/collisions");
const lineOfSight = require("./lineOfSight");

const bezier = require("bezier-easing");
const Grenade = require("./Grenade.js");

module.exports = class Player extends GameObject {
    // move settings to seperate file? make them static?
    RADIUS = 15;

    DEFAULT_ACCEL = 1360//68;//3.4; // increase move speed, decrease bow draw time
    BOW_DRAW_MOVE_ACCEL = 1040//52;//2.6;
    MOVE_FRICTION = 0.000006415//0.55//0.5;

    ROTATION_ACCEL = 180//9;//0.45;
    ROTATION_DECCEL = 1.1; // above 1
    ROTATION_FRICTION = 3.4868 * 10**(-11)//0.3;

    BOW_DRAW_TIME = 12;//15;
    BOW_DRAW_VEL_CURVE = bezier(1,0,1,0.2);
    get ARROW_VEL() { return 4000; }

    rotationVel = 0;
    angle = 0;
    position = { x: 300, y: 700 };
    vel = { x: 0, y: 0 };
    move = { x: 0, y: 0 };

    previousWalls = [];

    bowDrawStatus = 0;

    alive = true;

    constructor(match, connection) {
        super(match, "player");

        this.match = match;
        this.connection = connection;

        //this.match.namespace.emit("player", { x: 0, y: 0, angle: 0, id: this.ID});
    }

    getUpdateData() {
        return {
            x: this.position.x, 
            y: this.position.y,
            angle: this.angle,
            id: this.id,
            socketId: this.connection.ID,
            team: this.connection.team,
            zoomDist: this.connection.zoomDist
        };
    }

    emitUpdate(socket) {
        socket.emit("player", this.getUpdateData());
    }

    isVisibleFrom(x, y) {
        return lineOfSight.circleLineOfSight(x, y, this.position.x, this.position.y, this.RADIUS, this.match.walls)
    }

    update(deltaTime) {
        //const deltaTimeMul = deltaTime/1000 * this.match.CORRECT_TPS;

        this.updateVelocity(deltaTime);
        this.moveCollideWalls(deltaTime);
        this.updateRotation(deltaTime);

        this.updateBow(); 
        this.updateKnives(); 
    }

    updateBow() {
        if (this.connection.weaponSelected != "bow") {
            if (this.bowDrawStatus > 0) {
                this.match.namespace.emit("bowDrawStop",{ playerID: this.id });
                this.bowDrawStatus = 0;
            }
            
            return;
        }

        if (this.connection.keyStates.includes("shoot")) { // holding shoot button (right-click)
            if (this.bowDrawStatus == 0) this.match.namespace.emit("bowDraw",{ playerID: this.id }) // start drawing
            if (this.bowDrawStatus < this.BOW_DRAW_TIME) this.bowDrawStatus += 1; // increase time drawn
        } else if (this.bowDrawStatus > 0) { 
            const velMul = Math.min(1, this.BOW_DRAW_VEL_CURVE(this.bowDrawStatus / this.BOW_DRAW_TIME));

            if (velMul > 0.05) {
                const radianAngle = util.degreesToRadians(this.angle);

                const arrow = new Arrow(
                    this.match, 
                    this.position.x + Math.cos(radianAngle) * this.RADIUS*1.7, 
                    this.position.y + Math.sin(radianAngle) * this.RADIUS*1.7, 
                    this.angle, 
                    this.ARROW_VEL * velMul, 
                    this.connection.team
                );
            }

            this.match.namespace.emit("bowDrawStop",{ playerID: this.id });
            this.bowDrawStatus = 0;
        }
    }

    updateKnives() {
        if (this.connection.weaponSelected != "knives") 
            return;
        
        if (this.connection.keyStates.includes("shoot")) {
            const grenade = new Grenade(
                this.match, 
                this.position.x, 
                this.position.y,
                this.angle, 
                this.connection.zoomDist*690*2
            );
        }
    }

    updateVelocity(deltaTime) {
        this.vel.x *= this.MOVE_FRICTION ** deltaTime;
        this.vel.y *= this.MOVE_FRICTION ** deltaTime;

        this.move.x = 0;
        this.move.y = 0;

        const keyStates = this.connection.keyStates;

        if (keyStates.includes("moveUp")) this.move.y -= deltaTime;
        if (keyStates.includes("moveDown")) this.move.y += deltaTime;
        if (keyStates.includes("moveLeft")) this.move.x -= deltaTime;
        if (keyStates.includes("moveRight")) this.move.x += deltaTime;

        if (this.move.x != 0 && this.move.y != 0) {
            this.move.x *= 0.707;
            this.move.y *= 0.707;
        }

        if (this.bowDrawStatus > 0) {
            this.vel.x += this.move.x * this.BOW_DRAW_MOVE_ACCEL;
            this.vel.y += this.move.y * this.BOW_DRAW_MOVE_ACCEL;
        } else {
            this.vel.x += this.move.x * this.DEFAULT_ACCEL;
            this.vel.y += this.move.y * this.DEFAULT_ACCEL;
        }
    }

    updateRotation(deltaTime) {
        const targetAngle = this.connection.targetAngle;

        let dist = targetAngle - this.angle;
        if (dist > 180) dist -= 360;
        else if (dist < -180) dist += 360;

        this.rotationVel += this.ROTATION_ACCEL * (dist - this.rotationVel*this.ROTATION_DECCEL*deltaTime) * deltaTime;

        this.angle += this.rotationVel * deltaTime;
        this.angle = util.angleOverflowCheck(this.angle);
        this.rotationVel *= this.ROTATION_FRICTION ** deltaTime;
    }

    moveCollideWalls(deltaTime) {
        // code could prob be better, but IT WORKS!!!!
        // run after velocity is updated, before movement is updated

        const moveX = this.vel.x * deltaTime;
        const moveY = this.vel.y * deltaTime;

        const moveAngle = Math.atan2(moveY, moveX);
        //const perpMoveAngle = vAngle + Math.PI/2;
        const moveDist = Math.sqrt(moveX**2 + moveY**2);

        let minMoveX = Math.abs(moveX);
        let minMoveY = Math.abs(moveY);

        for (const wall of this.match.walls) {
            const { x: x1, y: y1 } = wall.start;
            const { x: x2, y: y2 } = wall.end;

            const dx = x2 - x1;
            const dy = y2 - y1;

            const len = Math.sqrt(dx**2 + dy**2);
        
            // get dot product of the line and circle
            const dot = ( ((this.position.x-x1)*dx) + ((this.position.y-y1)*dy) ) / len**2;
        
            // find the closest point on the infinitely long line
            let closestX = x1 + (dot * dx);
            let closestY = y1 + (dot * dy);

            let distance;

            if (!collisions.linePoint(x1,y1,x2,y2, closestX,closestY,len)) {
                // closest point not on the line segment
                // closest point must be one of the line's endpoints

                const dist1 = util.pointsDistance(this.position.x, this.position.y, x1, y1);
                const dist2 = util.pointsDistance(this.position.x, this.position.y, x2, y2);

                if (dist1 < dist2) {
                    distance = dist1;
                    closestX = x1;
                    closestY = y1;
                } else {
                    distance = dist2;
                    closestX = x2;
                    closestY = y2;
                }
            } else distance = util.pointsDistance(this.position.x, this.position.y, closestX, closestY)

            // find the movement amounts along perpendicular and parallel axes to the wall
            const playerToWallAngle = Math.atan2(this.position.y - closestY, this.position.x - closestX);
            const moveWallAngleDiff = playerToWallAngle - moveAngle;

            const parallelMove = -Math.sin(moveWallAngleDiff) * moveDist;
            const perpMove = -Math.cos(moveWallAngleDiff) * moveDist;

            //console.log(Math.round(perpMove*10)/10 + " " + Math.round(parallelMove*10)/10);

            const perpMoveCollide = Math.min(perpMove, distance - this.RADIUS);

            // change the movement along wall axes to regular x and y axes
            const playerToWallAnglePerp = playerToWallAngle - Math.PI/2;
            const collideMoveX = Math.cos(playerToWallAngle)*perpMoveCollide + Math.cos(playerToWallAnglePerp)*parallelMove;
            const collideMoveY = Math.sin(playerToWallAngle)*perpMoveCollide + Math.sin(playerToWallAnglePerp)*parallelMove;

            //console.log(Math.round(collideMoveX*10)/10 + " " + Math.round(collideMoveY*10)/10)

            minMoveX = Math.min(collideMoveX * (-Math.sign(moveX)), minMoveX);
            minMoveY = Math.min(collideMoveY * (-Math.sign(moveY)), minMoveY);
        }

        this.position.x += minMoveX * Math.sign(moveX);
        this.position.y += minMoveY * Math.sign(moveY);
    }

    kill() {
        //this.connection.destroy();
        this.alive = false;
        this.connection.killPlayer();
        super.destroy();
    }
}

