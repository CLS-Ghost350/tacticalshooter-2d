const util = require("./util");

function lineCircle(x1, y1, x2, y2, cx, cy, r) {
    // returns the closest point to the circle on the line if intersecting or null
    
    const len = util.pointsDistance(x1,y1,x2,y2);
  
    // get dot product of the line and circle
    const dot = ( ((cx-x1)*(x2-x1)) + ((cy-y1)*(y2-y1)) ) / len**2;
  
    // find the closest point on the line
    const closestX = x1 + (dot * (x2-x1));
    const closestY = y1 + (dot * (y2-y1));
  
    // is this point actually on the line segment?
    // if so keep going, but if not, return false
    const onSegment = linePoint(x1,y1,x2,y2, closestX,closestY);

    if (!onSegment) {
        // is either end inside the circle?
        //fix this
        const inside1 = pointCircle(x1,y1, cx,cy,r);
        if (inside1) return [x1,y1];
        const inside2 = pointCircle(x2,y2, cx,cy,r);
        if (inside2) return [x2,y2];
        
        return null;
    }
  
    // get distance to closest point
    const distance = util.pointsDistance(closestX, closestY, cx, cy);
  
    if (distance <= r) {
      return [closestX, closestY];
    }

    return null;
}
  
function pointCircle(px, py, cx, cy, r) {
    // returns true or false

    // get distance between the point and circle's center
    const distance = util.pointsDistance(px,py,cx,cy);

    // if the distance is less than the circle's
    // radius the point is inside!
    if (distance <= r) {
        return true;
    }

    return false;
}

function circleCircle(x1, y1, r1, x2, y2, r2) {
    const distance = util.pointsDistance(x1,y1,x2,y2);
    return distance <= r1 + r2;
}

function linePoint(x1, y1, x2, y2, px, py, len) {
    // returns true or false

    // get distance from the point to the two ends of the line
    const d1 = util.pointsDistance(px,py, x1,y1);
    const d2 = util.pointsDistance(px,py, x2,y2);

    // get the length of the line
    const lineLen = len ?? util.pointsDistance(x1,y1, x2,y2);

    // since floats are so minutely accurate, add
    // a little buffer zone that will give collision
    const buffer = 0.01;    // higher # = less accurate

    // if the two distances are equal to the line's
    // length, the point is on the line!
    // note we use the buffer here to give a range,
    // rather than one #
    if (d1+d2 >= lineLen-buffer && d1+d2 <= lineLen+buffer) {
        return true;
    }

    return false;
}

// returns point of intersection (x, y) or null
function lineLine(x1,y1,x2,y2,x3,y3,x4,y4, line1Infinite=false, line2Infinite=false) {
    const denominator = ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    const numerator1 = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3));
    const numerator2 = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3));

    if (denominator == 0) return null; // parallel or coincident; if both numerators == 0, then coincident

    // calculate the distance to intersection point
    const u1 = numerator1 / denominator;
    const u2 = numerator2 / denominator;

    // if u1 is between 0-1, the intersection point is on line 1, same with u2 and line 2
    if ((line1Infinite || (u1 >= 0 && u1 <= 1)) && (line2Infinite || (u2 >= 0 && u2 <= 1))) {
        const intersectionX = x1 + (u1 * (x2-x1));
        const intersectionY = y1 + (u1 * (y2-y1));

        return [ intersectionX, intersectionY ];
    }

    return null;
}

function closestPointOnLine(x, y, lx1, ly1, lx2, ly2) {
    const ldx = lx2 - lx1;
    const ldy = ly2 - ly1;

    const lLen = Math.sqrt(ldx**2 + ldy**2);

    // get dot product of the line and circle
    const dot = ( (x-lx1)*ldx + (y-ly1)*ldy ) / lLen**2;

    // find the closest point on the infinitely long line
    const closestX = lx1 + (dot * ldx);
    const closestY = ly1 + (dot * ldy);

    if (linePoint(lx1,ly1,lx2,ly2, closestX,closestY,lLen)) 
        return [ closestX, closestY ];

    // else closest point not on the line segment
    // closest point must be one of the line's endpoints

    const dist1 = util.pointsDistance(x, y, lx1, ly1);
    const dist2 = util.pointsDistance(x, y, lx2, ly2);

    if (dist1 < dist2) return [ x1, y1 ];
    else return [ x2, y2 ];
}

function pointTriangle(x, y, tx1, ty1, tx2, ty2, tx3, ty3, tArea) {
    const totalArea = tArea ?? Math.abs( (tx2-tx1)*(ty3-ty1) - (tx3-tx1)*(ty2-ty1) );

    const area1 = Math.abs( (tx1-x)*(ty2-y) - (tx2-x)*(ty1-y) );
    const area2 = Math.abs( (tx2-x)*(ty3-y) - (tx3-x)*(ty2-y) );
    const area3 = Math.abs( (tx3-x)*(ty1-y) - (tx1-x)*(ty3-y) );

    return area1 + area2 + area3 == totalArea;
}

// function lineLineInfinite(x1,y1,x2,y2,x3,y3,x4,y4) {
//     const dx1 = x1 - x2;
//     const dy1 = y1 - y2;
//     const dx2 = x3 - x4;
//     const dy2 = y3 - y4;

//     const denominator = dx1*dy2 - dx2*dy1;
//     if (denominator == 0) return null;

//     const line1Val = (x1*y2 - x2*y1);
//     const line2Val = (x3*y4 - x4*y3)

//     return [ 
//         (line1Val*dx2 - dx1*line2Val) / denominator, 
//         (line1Val*dy2 - dy1*line2Val) / denominator 
//     ];
// }

function movingCircleCircle(x, y, radius, moveX, moveY, cx, cy, cRadius) {
    const combinedRadius = radius + cRadius;

    const moveAngle = Math.atan2(moveY, moveX);
    const moveDist = Math.sqrt(moveX**2 + moveY**2);

    // find points on movement line where dist to cpoint == combined radius

    // make original position the origin for cpoint
    const movedCX = cx - x;
    const movedCY = cy - y;

    // rotate cpoint about origin (original pos) by movement angle
    const rotatedCX = movedCX * Math.cos(-moveAngle)  -  movedCY * Math.sin(-moveAngle); 
    const rotatedCY = movedCX * Math.sin(-moveAngle)  +  movedCY * Math.cos(-moveAngle); 

    // this.match.emitDebugPoint({ id: "BT_endpointRotatedPos", x: 0  +600, y: 0  +600, color: 0xFF0000 })
    // this.match.emitDebugPoint({ id: "BT_endpointRotatedNewPos", x: moveDist +600, y: 0  +600, color: 0xFF0000 })

    // this.match.emitDebugPoint({ id: "BT_rotatedEndpoint", x: rotatedWX +600, y: -rotatedWY  +600, color: 0xFF00FF })

    const discriminant = Math.sqrt(combinedRadius**2 - rotatedCY**2);

    //console.log(discriminant)
    //console.log(rotatedWX + " " + rotatedWY)

    if (isNaN(discriminant)) // radius is never reached; line too far from cpoint
        return null;
    
    const circleIntersectStart = rotatedCX - discriminant;
    const circleIntersectEnd = rotatedCX + discriminant;

    // this.match.emitDebugPoint({ id: "BT_circleIntersectStart", 
    //     x: this.position.x + Math.cos(this.angle)*circleIntersectStart, 
    //     y: this.position.y + Math.sin(this.angle)*circleIntersectStart, 
    //     color: 0x00FF00, expiryTime: 1 });

    // this.match.emitDebugPoint({ id: "BT_circleIntersectEnd", 
    //     x: this.position.x + Math.cos(this.angle)*circleIntersectEnd, 
    //     y: this.position.y + Math.sin(this.angle)*circleIntersectEnd, 
    //     color: 0x00FF00, expiryTime: 1 });

    if (circleIntersectEnd < 0) return null; // collision is behind position
    if (circleIntersectStart > moveDist) return null; // collision is in front of position

    //console.log(circleIntersectStart + " " + minMove)

    const movePercent = circleIntersectStart / moveDist;

    return { 
        x: x + moveX*movePercent, 
        y: y + moveY*movePercent, 
        dist: circleIntersectStart 
    };
}

module.exports = {
    lineLine,
    lineCircle,
    linePoint,
    pointCircle,
    circleCircle,
    pointTriangle,

    closestPointOnLine,

    movingCircleCircle
}