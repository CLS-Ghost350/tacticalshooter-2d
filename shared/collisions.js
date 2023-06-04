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

function lineLine(x1,y1,x2,y2,x3,y3,x4,y4) {
    // returns point of intersection (x, y) or null

    // calculate the distance to intersection point
    const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    const uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        const intersectionX = x1 + (uA * (x2-x1));
        const intersectionY = y1 + (uA * (y2-y1));

        return [ intersectionX, intersectionY ];
    }

    return null;
}

module.exports = {
    lineLine,
    lineCircle,
    linePoint,
    pointCircle,
}