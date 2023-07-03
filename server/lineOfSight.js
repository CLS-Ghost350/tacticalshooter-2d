
const collisions = require("../shared/collisions.js")
const util = require("../shared/util.js");

function circleLineOfSight(x, y, cx, cy, r, walls) {
    const angle = Math.atan2(cy - y, cx - x);
    const perpAngle = angle + Math.PI/2;

    const sdx = Math.cos(perpAngle) * r;
    const sdy = Math.sin(perpAngle) * r;

    const sx1 = cx + sdx;
    const sy1 = cy + sdy;
    const sx2 = cx - sdx;
    const sy2 = cy - sdy;

    //console.log(`(${sx1}, ${sy1}) (${sx2}, ${sy2})`)

    return middlePerpLineLineOfSight(x, y, sx1, sy1, sx2, sy2, walls, perpAngle);
}

function middlePerpLineLineOfSight(x, y, lx1, ly1, lx2, ly2, walls, lineAngle, wallsChecked) {
    lineAngle = lineAngle ?? Math.atan2(ly2 - ly1, lx2 - lx1);
    wallsChecked = wallsChecked ?? 0;

    for (let i = wallsChecked; i < walls.length; i++) {
        const wall = walls[i];

        // intersection between line and ray from starting point, going thru wall's endpoints, ending at line
        let coll1 = collisions.lineLine(lx1, ly1, lx2, ly2, x, y, wall.start.x, wall.start.y, false, true);
        if (coll1 && !collisions.linePoint(x, y, coll1[0], coll1[1], wall.start.x, wall.start.y)) coll1 = null;

        let coll2 = collisions.lineLine(lx1, ly1, lx2, ly2, x, y, wall.end.x, wall.end.y, false, true);
        if (coll2 && !collisions.linePoint(x, y, coll2[0], coll2[1], wall.end.x, wall.end.y)) coll2 = null;

        if (!coll1 && !coll2) { // wall covers either nothing or the entire view
            if (collisions.lineLine(wall.start.x, wall.start.y, wall.end.x, wall.end.y, x, y, lx1, ly1)) 
                return false; // wall covers everything
            
            continue; // wall covers nothing
        }

        //console.log(coll1, coll2)

        let coll;
        if (coll1 && !coll2) coll = coll1;
        if (!coll1 && coll2) coll = coll2;

        if (!coll) { // both colliding; possible area split in 2
            const dist1 = util.pointsDistance(lx1, ly1, ...coll1);
            const dist2 = util.pointsDistance(lx1, ly1, ...coll2);

            let closeColl = coll2;
            let farColl = coll1;

            if (dist1 < dist2) {
                closeColl = coll1;
                farColl = coll2;
            }

            return middlePerpLineLineOfSight(x, y, lx1, ly1, closeColl[0], closeColl[1], walls, lineAngle, i + 1)
                || middlePerpLineLineOfSight(x, y, farColl[0], farColl[1], lx2, ly2, walls, lineAngle, i + 1);
        }

        // one end is cut off, the other not
        if (collisions.lineLine(lx1, ly1, x, y, wall.start.x, wall.start.y, wall.end.x, wall.end.y)) {
            lx1 = coll[0];
            ly1 = coll[1];
        } else {
            lx2 = coll[0];
            ly2 = coll[1];
        }
    }

    return true;
}

exports.circleLineOfSight = circleLineOfSight;