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

        const newX = this.position.x + moveX;
        const newY = this.position.y + moveY;

        //const perpMoveAngle = vAngle + Math.PI/2;

        let minMove = moveDist;
        let minMoveWallAngle;
        let minMoveWallCollX;
        let minMoveWallCollY;

        for (const wall of this.match.walls) {
            const { x: wx1, y: wy1 } = wall.start;
            const { x: wx2, y: wy2 } = wall.end;

            const dwx = wx2 - wx1;
            const dwy = wy2 - wy1;

            const wlen = Math.sqrt(dwx**2 + dwy**2);
            const wAngle = Math.atan2(dwy, dwx);

            // make wall endpoint 1 the origin
            const movedX = this.position.x - wx1;
            const movedY = this.position.y - wy1;

            const movedNewX = newX - wx1;
            const movedNewY = newY - wy1;

            // rotate about origin (wall endpoint 1) by wall angle; x-axis becomes wall
            const cosNegWallAngle = Math.cos(-wAngle);
            const sinNegWallAngle = Math.sin(-wAngle);

            const rotatedX = movedX * cosNegWallAngle  -  movedY * sinNegWallAngle; 
            let rotatedY = movedX * sinNegWallAngle  +  movedY * cosNegWallAngle; 

            const rotatedNewX = movedNewX * cosNegWallAngle  -  movedNewY * sinNegWallAngle; 
            let rotatedNewY = movedNewX * sinNegWallAngle  +  movedNewY * cosNegWallAngle; 

            let flipped = false;

            if (rotatedY < 0) {
                flipped = true;

                rotatedY *= -1;
                rotatedNewY *= -1;
            }

            const rotatedMoveX = rotatedNewX - rotatedX;
            const rotatedMoveY = rotatedNewY - rotatedY;
            const rotatedMoveAngle = Math.atan2(rotatedMoveY, rotatedMoveX);

            // this.match.emitDebugPoint({ id: "BT_rotatedPos", x: rotatedX, y: -rotatedY  +400, color: 0xFF00FF })
            // this.match.emitDebugPoint({ id: "BT_rotatedNewPos", x: rotatedNewX, y: -rotatedNewY  +400, color: 0xFF00FF })

            // this.match.emitDebugPoint({ id: "BT_rotatedWall1", x: 0, y: 0  +400, color: 0xFF0000 })
            // this.match.emitDebugPoint({ id: "BT_rotatedWall2", x: wlen, y: 0  +400, color: 0xFF0000 })

            if (Math.min(rotatedY, rotatedNewY) > this.radius) continue; // no intersection
            if (rotatedMoveY == 0 && rotatedY > this.radius) continue; // parallel movement path

            // find x pos on movement line when y pos = radius
            let xAtRadius = (this.radius - rotatedY) * rotatedMoveX / rotatedMoveY + rotatedX;

            // this.match.emitDebugPoint({ id: "BT_xAtRadius", x: xAtRadius, y: -this.radius  +400, color: 0x00FF00 })

            //console.log(xAtRadius + " " + wlen)

            if (xAtRadius < 0 || xAtRadius > wlen || rotatedY <= this.radius) {
                // circle will first collide with one of the line's endpoints

                let collX = wx1;
                let collY = wy1;

                if (rotatedY <= this.radius) { // xAtRadius will be behind object's movement
                    if (rotatedX > wlen) {
                        collX = wx2;
                        collY = wy2;
                    }
                } else if (xAtRadius > wlen) {
                    collX = wx2;
                    collY = wy2;
                }

                // this.match.emitDebugPoint({ id: "BT_wallEndpointColl", x: collX, y: -collY  +400, color: 0xFFFF00, expiryTime: 1 })

                const coll = collisions.movingCircleCircle( this.position.x, this.position.y, this.radius,
                    moveX, moveY, collX, collY, 0);

                if (!coll) continue;

                if (coll.dist < minMove) {
                    minMove = coll.dist;
                    minMoveWallCollX = collX;
                    minMoveWallCollY = collY;
                }

            } else {
                // closest point on line segment
                const distance = util.pointsDistance(rotatedX, rotatedY, xAtRadius, this.radius);

                if (distance < minMove) {
                    minMove = distance;
                    minMoveWallAngle = wAngle;
                }
            }

            //this.match.emitDebugPoint({ id: "BT_closest", x: closestX, y: closestY, color: 0x00FF00 })
        }

        // if (minMoveWallAngle) console.log(minMove);
        // else console.log("no coll " + moveDist)

        minMove -= EPSILON;

        this.position.x += Math.cos(this.angle) * minMove;
        this.position.y += Math.sin(this.angle) * minMove;

        if (minMoveWallAngle != null || minMoveWallCollX != null) {
            let normalAngle;

            if (minMoveWallAngle != null)
                normalAngle = util.angleOverflowCheckRadians(minMoveWallAngle + Math.PI/2);
            else normalAngle = Math.atan2(this.position.y - minMoveWallCollY, this.position.x - minMoveWallCollX);

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

    moveHandleCollisionsOld2(moveDist, iterations=0) {
        const EPSILON = 1;

        //const moveX = Math.cos(this.angle) * moveDist;
        //const moveY = Math.sin(this.angle) * moveDist;

        //const newX = this.position.x + moveX;
        //const newY = this.position.y + moveY;

        //const perpMoveAngle = vAngle + Math.PI/2;

        let minMove = moveDist;
        let minMoveWallAngle;

        for (const wall of this.match.walls) {
            const { x: wx1, y: wy1 } = wall.start;
            const { x: wx2, y: wy2 } = wall.end;

            const dwx = wx2 - wx1;
            const dwy = wy2 - wy1;

            const wlen = Math.sqrt(dwx**2 + dwy**2);
        
            // get dot product of the line and circle
            const lcdot = ( ((this.position.x-wx1)*dwx) + ((this.position.y-wy1)*dwy) ) / wlen**2;
        
            // find the closest point on the infinitely long line
            let closestX = wx1 + (lcdot * dwx);
            let closestY = wy1 + (lcdot * dwy);

            let distance;

            if (!collisions.linePoint(wx1,wy1,wx2,wy2, closestX,closestY, wlen)) {
                // closest point not on the line segment
                // closest point must be one of the line's endpoints

                const dist1 = util.pointsDistance(this.position.x, this.position.y, wx1, wy1);
                const dist2 = util.pointsDistance(this.position.x, this.position.y, wx2, wy2);

                if (dist1 < dist2) {
                    distance = dist1;
                    closestX = wx1;
                    closestY = wy1;
                } else {
                    distance = dist2;
                    closestX = wx2;
                    closestY = wy2;
                }

                // find point on velocity line where dist to point == radius
                // this doesn't handle case where object is already touching wall endpoint beforehand

                // make original position the origin for closest point
                const movedClosestX = closestX - this.position.x;
                const movedClosestY = closestY - this.position.y;

                // rotate closest point about origin (original pos) by movement angle
                const rotatedWX = movedClosestX * Math.cos(-this.angle)  -  movedClosestY * Math.sin(-this.angle); 
                const rotatedWY = movedClosestX * Math.sin(-this.angle)  +  movedClosestY * Math.cos(-this.angle); 

                const determinant = Math.sqrt(this.radius**2 - rotatedWY**2);

                if (isNaN(determinant)) // radius is never reached; line too far from wall endpoint
                    continue;
                
                const curMinMove = rotatedWX - determinant;

                if (curMinMove < minMove) {
                    minMove = curMinMove;
                    minMoveWallAngle = Math.atan2(dwy, dwx); // fix?
                }

            } else {
                // closest point on line segment
                distance = util.pointsDistance(this.position.x, this.position.y, closestX, closestY);

                // forgot entire section here; rotating movement to perp axis

                const playerToWallAngle = Math.atan2(this.position.y - closestY, this.position.x - closestX);
                const moveWallAngleDiff = playerToWallAngle - this.angle;

                const perpMove = -Math.cos(moveWallAngleDiff) * moveDist;
                const parallelMove = -Math.sin(moveWallAngleDiff) * moveDist;

                const perpMoveCollide = Math.min(perpMove, distance - this.radius);
                const parallelMoveCollide = perpMoveCollide / perpMove * parallelMove;

                  // change the movement along wall axes to regular x and y axes
                const playerToWallAnglePerp = playerToWallAngle - Math.PI/2;
                const collideMoveX = Math.cos(playerToWallAngle)*perpMoveCollide + Math.cos(playerToWallAnglePerp)*parallelMoveCollide;
                const collideMoveY = Math.sin(playerToWallAngle)*perpMoveCollide + Math.sin(playerToWallAnglePerp)*parallelMoveCollide;

                const curMinMove = Math.sqrt(collideMoveX**2 + collideMoveY**2);

                if (curMinMove < minMove) {
                    minMove = curMinMove;
                    minMoveWallAngle = Math.atan2(dwy, dwx);
                }
            }

            this.match.emitDebugPoint({ id: "BT_closest", x: closestX, y: closestY, color: 0x00FF00 })
        }

        if (minMoveWallAngle) console.log(minMove);
        else console.log("no coll " + moveDist)

        minMove -= EPSILON;

        this.position.x += Math.cos(this.angle) * minMove;
        this.position.y += Math.sin(this.angle) * minMove;

        if (minMoveWallAngle) {
            const normalAngle = minMoveWallAngle + Math.PI/2;
            this.match.emitDebugPoint({ id: "BT_normalAngleDir", x: this.position.x + Math.cos(normalAngle) * 200, y: this.position.y + Math.sin(normalAngle) * 200, color: 0x0000FF })

            this.match.emitDebugPoint({ id: "BT_newPosition", x: this.position.x, y: this.position.y, color: 0x2299FF })

            this.angle = 2*normalAngle - this.angle;
            this.angle = Math.atan2(Math.sin(this.angle), Math.cos(this.angle)) + Math.PI; // angle direction correction

            //console.log(util.angleOverflowCheckRadians(this.angle))
            this.match.emitDebugPoint({ id: "BT_newAngleDir", x: this.position.x + Math.cos(this.angle) * 200, y: this.position.y + Math.sin(this.angle) * 200, color: 0xFF0000 })

            if (iterations < 10)
                this.moveHandleCollisions(moveDist - Math.max(minMove, 0), iterations + 1)

            //this.#velocity = 0;
        }
    }

    moveHandleCollisionsOld(moveDist) {
        const EPSILON = 0.01;

        const moveX = Math.cos(this.angle) * moveDist;
        const moveY = Math.sin(this.angle) * moveDist;

        const newX = this.position.x + moveX;
        const newY = this.position.y + moveY;

        let closestCollX = newX;
        let closestCollY = newY;

        // collision with trailing rect
        const perpVelAngle = this.angle + Math.PI/2;

        const sdx = Math.cos(perpVelAngle) * this.radius;
        const sdy = Math.sin(perpVelAngle) * this.radius;

        const sx1 = this.position.x + sdx;
        const sy1 = this.position.y + sdy;
        const sx2 = this.position.x - sdx;
        const sy2 = this.position.y - sdy;

        const snx1 = newX + sdx;
        const sny1 = newY + sdy;
        const snx2 = newX - sdx;
        const sny2 = newY - sdy;

        const rectCenterX = (sx1 + snx2) / 2;
        const rectCenterY = (sy1 + sny2) / 2;

        //this.match.emitDebugPoint({ id: "BT_rect_center", x: rectCenterX, y: rectCenterY, color: 0xFF00FF })
        // this.match.emitDebugPoint({ id: "BT_rect_1", x: sx1, y: sy1, color: 0x0000FF })
        // this.match.emitDebugPoint({ id: "BT_rect_2", x: sx2, y: sy2, color: 0x0000FF })
        // this.match.emitDebugPoint({ id: "BT_rect_new1", x: snx1, y: sny1, color: 0x0000FF })
        // this.match.emitDebugPoint({ id: "BT_rect_new2", x: snx2, y: sny2, color: 0x0000FF })

        const rectIntersections = [];

        for (const wall of this.match.walls) {
            const { x: wx1, y: wy1 } = wall.start;
            const { x: wx2, y: wy2 } = wall.end;

            const coll1 = collisions.lineLine(sx1, sy1, snx1, sny1, wx1, wy1, wx2, wy2);
            if (coll1) rectIntersections.push(coll1);

            const coll2 = collisions.lineLine(sx2, sy2, snx2, sny2, wx1, wy1, wx2, wy2);
            if (coll2) rectIntersections.push(coll2);

            //if (coll1) console.log(coll1);
            //if (coll2) console.log(coll2)

            //let i = 0;

            for (const { x: wx, y: wy } of [ wall.start, wall.end ]) {
                // make the rect's center the origin
                const movedWX = wx - rectCenterX;
                const movedWY = wy - rectCenterY;

                // rotate about origin (rect's center) by angle of rect
                const rotatedWX = movedWX * Math.cos(-this.angle)  -  movedWY * Math.sin(-this.angle); 
                const rotatedWY = movedWX * Math.sin(-this.angle)  +  movedWY * Math.cos(-this.angle); 

                //this.match.emitDebugPoint({ id: "BT_rotatedWallEnd_" + i, x: rotatedWX + rectCenterX, y: rotatedWY + rectCenterY, color: 0x0000FF })
                //i++

                if (rotatedWX >= -moveDist/2 && rotatedWX <= moveDist/2 && 
                    rotatedWY >= -this.radius && rotatedWY <= this.radius) { // colliding with rect

                    rectIntersections.push([[wx, wy]]);
                    console.log(`${wx} ${wy}`)
                }
            }

            //this.match.emitDebugPoint({ id: "BT_rotatedRect_1", x: -moveDist/2 + rectCenterX, y: -this.radius + rectCenterY, color: 0x00FFFF })
            //this.match.emitDebugPoint({ id: "BT_rotatedRect_2", x: moveDist/2 + rectCenterX, y: -this.radius + rectCenterY, color: 0x00FFFF })
            //this.match.emitDebugPoint({ id: "BT_rotatedRect_3", x: -moveDist/2 + rectCenterX, y: this.radius + rectCenterY, color: 0x00FFFF })
            //this.match.emitDebugPoint({ id: "BT_rotatedRect_4", x: moveDist/2 + rectCenterX, y: this.radius + rectCenterY, color: 0x00FFFF })
        }

        let i = 0;

        for (const [interX, interY] of rectIntersections) {
            this.match.emitDebugPoint({ id: "BT_rectIntersection_" + i, x: interX, y: interY, color: 0x00FF00 })
            i++

            // closestColl x & y should be closest point to wall x & y on line of movement
            
            // get dot product of the line of movement and endpoint
            const dot = ( ((interX-this.position.x)*moveX) + ((interY-this.position.y)*moveY) ) / moveDist**2;
        
            const closestX = this.position.x + (dot * moveX);
            const closestY = this.position.y + (dot * moveY);

            if (util.pointsDistance(closestX, closestY, this.position.x, this.position.y) < moveDist) {
                closestCollX = closestX;
                closestCollY = closestY;
            }
        }

        if (closestCollX != newX || closestCollY != newY) {
           //console.log(`${closestCollX} ${closestCollY}`)
           this.match.emitDebugPoint({ id: "BT_closestColl", x: closestCollX, y: closestCollY })
        }

        // collision with circle
        let closestCircleCollX;
        let closestCircleCollY;
        let closestCircleCollDist = this.radius;

        for (const wall of this.match.walls) {
            const { x: wx1, y: wy1 } = wall.start;
            const { x: wx2, y: wy2 } = wall.end;

            const dwx = wx2 - wx1;
            const dwy = wy2 - wy1;

            const len = Math.sqrt(dwx**2 + dwy**2);
        
            // get dot product of the wall and circle
            const dot = ( ((closestCollX-wx1)*dwx) + ((closestCollY-wy1)*dwy) ) / len**2;
        
            // find the closest point on the infinitely long line
            let closestX = wx1 + (dot * dwx);
            let closestY = wy1 + (dot * dwy);

            let distance;

            if (!collisions.linePoint(wx1,wy1,wx2,wy2, closestX,closestY,len)) {
                // closest point not on the wall's line segment
                // closest point must be one of the wall's endpoints

                const dist1 = util.pointsDistance(closestCollX, closestCollY, wx1, wy1);
                const dist2 = util.pointsDistance(closestCollX, closestCollY, wx2, wy2);

                if (dist1 < dist2) {
                    distance = dist1;
                    closestX = wx1;
                    closestY = wy1;
                } else {
                    distance = dist2;
                    closestX = wx2;
                    closestY = wy2;
                }
            } else distance = util.pointsDistance(closestCollX, closestCollY, closestX, closestY)

            this.match.emitDebugPoint({ id: "BT_closestCircleColl", x: closestX, y: closestY, color: 0xFF00FF })

            if (distance <= closestCircleCollDist) {
                closestCircleCollX = closestX;
                closestCircleCollY = closestY;
                closestCircleCollDist = distance;

                //this.#velocity = 0;
            }
        }

        if (closestCircleCollX) {
            const normalAngle = Math.atan2(closestCollY - closestCircleCollY, closestCollX - closestCircleCollX);
            this.match.emitDebugPoint({ id: "BT_normalAngleDir", x: closestCircleCollX + Math.cos(normalAngle) * 200, y: closestCircleCollY + Math.sin(normalAngle) * 200, color: 0x0000FF })

            const moveWallAngleDiff = normalAngle - this.angle;
            const perpMove = -Math.cos(moveWallAngleDiff) * moveDist;
            //console.log(Math.round(perpMove*10)/10 + " " + Math.round(parallelMove*10)/10);
            const perpMoveCollide = Math.min(perpMove, closestCircleCollDist - this.radius);

            this.position.x = closestCollX - Math.cos(normalAngle) * perpMoveCollide;
            this.position.y = closestCollY - Math.sin(normalAngle) * perpMoveCollide;

            this.match.emitDebugPoint({ id: "BT_newPosition", x: this.position.x, y: this.position.y, color: 0x2299FF })

            this.angle = 2*normalAngle - this.angle;
            this.angle = Math.atan2(Math.sin(this.angle), Math.cos(this.angle)) + Math.PI; // angle direction correction

            //console.log(util.angleOverflowCheckRadians(this.angle))
            this.match.emitDebugPoint({ id: "BT_newAngleDir", x: this.position.x + Math.cos(this.angle) * 200, y: this.position.y + Math.sin(this.angle) * 200, color: 0xFF0000 })

            this.moveHandleCollisions(moveDist - Math.max(perpMoveCollide, 0))
        } else {
            this.position.x = newX;
            this.position.y = newY;
        }
    }
}