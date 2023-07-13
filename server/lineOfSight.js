const SortedArraySet = require("collections/sorted-array-set");
const TreeSet = require("ml-tree-set");

const collisions = require("../shared/collisions.js")
const util = require("../shared/util.js");

function circleLineOfSight(vx, vy, cx, cy, r, walls) {
    const angle = Math.atan2(cy - vy, cx - vx);
    const perpAngle = angle + Math.PI/2;

    const sdx = Math.cos(perpAngle) * r;
    const sdy = Math.sin(perpAngle) * r;

    const sx1 = cx + sdx;
    const sy1 = cy + sdy;
    const sx2 = cx - sdx;
    const sy2 = cy - sdy;

    //console.log(`(${sx1}, ${sy1}) (${sx2}, ${sy2})`)

    return lineLineOfSight(vx, vy, sx1, sy1, sx2, sy2, walls);
}

function lineLineOfSight(vx, vy, lx1, ly1, lx2, ly2, walls) { 
    const lineLen = Math.sqrt((lx2 - lx1)**2 + (ly2 - ly1)**2);
    const lineViewerDot = ( ((vx-lx1)*(lx2-lx1)) + ((vy-ly1)*(ly2-ly1)) ) / lineLen**2;
  
    // find the closest point to the viewer on the line
    const closestX = lx1 + (lineViewerDot * (lx2-lx1));
    const closestY = ly1 + (lineViewerDot * (ly2-ly1));

    const angleFromLineClosest = Math.atan2(vy - closestY, vx - closestX);
    const rotateAngle = -angleFromLineClosest + Math.PI/2;
    const cosRotateAngle = Math.cos(rotateAngle);
    const sinRotateAngle = Math.sin(rotateAngle);

    //console.log(rotateAngle * 180 / Math.PI)

    // make the closest point the origin
    const movedLX1 = lx1 - closestX;
    const movedLY1 = ly1 - closestY;
    const movedLX2 = lx2 - closestX;
    const movedLY2 = ly2 - closestY;

    // rotate line's endpoints about origin (closest point to viewer) by angle from closest point to viewer on line
    const rotatedLX1 = movedLX1 * cosRotateAngle  -  movedLY1 * sinRotateAngle; 
    const rotatedLX2 = movedLX2 * cosRotateAngle  -  movedLY2 * sinRotateAngle; 

    let lineStart, lineEnd;

    if (rotatedLX1 < rotatedLX2) {
        lineStart = rotatedLX1;
        lineEnd = rotatedLX2;
    } else {
        lineStart = rotatedLX2;
        lineEnd = rotatedLX1;
    }

    //if (!(vx == 300 && vy == 700)) console.info(`${lineStart}, ${lineEnd}`); 

    // make the closest point the origin
    const movedVX = vx - closestX;
    const movedVY = vy - closestY;

    // rotate viewer about origin (closest point to viewer) by angle from closest point to viewer on line
    const rotatedVX = 0 //movedVX * cosRotateAngle  -  movedVY * sinRotateAngle; // always = 0
    const rotatedVY = movedVX * sinRotateAngle  +  movedVY * cosRotateAngle;

    //console.info(`${rotatedVX}, ${rotatedVY}`)

    const shadows = new TreeSet((s1, s2) => s1[0] - s2[0]);

    for (const wall of walls) {
        // make the closest point to viewer on line the origin
        const movedWallStartX = wall.start.x - closestX;
        const movedWallStartY = wall.start.y - closestY;
        const movedWallEndX = wall.end.x - closestX;
        const movedWallEndY = wall.end.y - closestY;

        // rotate wall about origin (closest point to viewer) by angle from closest point to viewer on line
        let rotatedWallStartX = movedWallStartX * cosRotateAngle  -  movedWallStartY * sinRotateAngle;
        let rotatedWallStartY = movedWallStartX * sinRotateAngle  +  movedWallStartY * cosRotateAngle;
        let rotatedWallEndX = movedWallEndX * cosRotateAngle  -  movedWallEndY * sinRotateAngle;
        let rotatedWallEndY = movedWallEndX * sinRotateAngle  +  movedWallEndY * cosRotateAngle;

        //console.info(`${rotatedWallStartX}, ${rotatedWallStartY}`);

        if (rotatedWallStartY < 0 && rotatedWallEndY < 0) continue; // wall is behind line
        if (rotatedWallStartY > rotatedVY && rotatedWallEndY > rotatedVY) continue; // wall is behind viewer

        // cut off regions of the wall that are behind the line or the viewer
        const wallSlope = (rotatedWallEndY - rotatedWallStartY) / (rotatedWallEndX - rotatedWallStartX);

        if (rotatedWallStartY < 0) {
            rotatedWallStartX = (0 - rotatedWallStartY)/wallSlope + rotatedWallStartX;
            rotatedWallStartY = 0;
        } else if (rotatedWallStartY > rotatedVY) {
            rotatedWallStartX = (rotatedVY - rotatedWallStartY)/wallSlope + rotatedWallStartX;
            rotatedWallStartY = rotatedVY;
        }

        if (rotatedWallEndY < 0) {
            rotatedWallEndX = (0 - rotatedWallEndY)/wallSlope + rotatedWallEndX;
            rotatedWallEndY = 0;
        } else if (rotatedWallEndY > rotatedVY) {
            rotatedWallEndX = (rotatedVY - rotatedWallEndY)/wallSlope + rotatedWallEndX;
            rotatedWallEndY = rotatedVY;
        }

        //if (!(vx == 300 && vy == 700))console.info(`${rotatedWallStartX}, ${rotatedWallEndX}`);

        // find shadow bounds on x-axis
        const viewerWallStartSlope = (rotatedVY - rotatedWallStartY) / (rotatedVX - rotatedWallStartX);
        let shadowStartX = (0 - rotatedVY) / viewerWallStartSlope;

        const viewerWallEndSlope = (rotatedVY - rotatedWallEndY) / (rotatedVX - rotatedWallEndX);
        let shadowEndX = (0 - rotatedVY) / viewerWallEndSlope;

        //if (!(vx == 300 && vy == 700)) console.info(`${viewerWallStartSlope}, ${Object.is(viewerWallEndSlope, +0)}`); 
        //if (!(vx == 300 && vy == 700)) console.info(`${shadowStartX}, ${shadowEndX}`); 
        
        if (shadowStartX > shadowEndX) {
            const temp = shadowEndX;
            shadowEndX = shadowStartX;
            shadowStartX = temp;
        }

        if (shadowStartX <= lineEnd && shadowEndX >= lineStart)
            shadows.add([ shadowStartX, shadowEndX ]);
    }

    //if (!(vx == 300 && vy == 700)) console.log(shadows.elements.reduce((prev, cur) => prev + `[${cur[0]}, ${cur[1]}] `, ""))

    // test if shadows cover entire line
    let mergedShadowEnd = lineStart;

    for (const shadow of shadows.elements) {
        if (shadow[0] > mergedShadowEnd) return true; // hole in shadows

        mergedShadowEnd = Math.max(mergedShadowEnd, shadow[1]);
        if (mergedShadowEnd >= lineEnd) return false; // shadows cover everything
    };

    return true; // shadows don't cover up to right edge
}

exports.circleLineOfSight = circleLineOfSight;
exports.lineLineOfSight = lineLineOfSight;