
function getPairCombos(list) {
    let results = [];
    listRemoved = [ ...list ]

    list.forEach(e1 => {
        listRemoved.shift()
        listRemoved.forEach(e2 => results.push([e1,e2]))
    })

    return results; 
}

function degreesToRadians(degrees) {
    return degrees * ( Math.PI / 180);
}

function radiansToDegrees(radians) {
    return radians / ( Math.PI / 180);
}

function angleOverflowCheckRadians(angle) {
    let newAngle = angle;

    while (newAngle > Math.PI) newAngle -= Math.PI*2;
    while (newAngle < -Math.PI) newAngle += Math.PI*2;

    return newAngle;
}

function angleOverflowCheck(angle) {
    let newAngle = angle;

    while (newAngle > 180) newAngle -= 360;
    while (newAngle < -180) newAngle += 360;

    return newAngle;
}

function pointsDistance(x1,y1,x2,y2) {
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
}

module.exports = {
    getPairCombos,
    degreesToRadians,
    pointsDistance,
    radiansToDegrees,
    angleOverflowCheck,
    angleOverflowCheckRadians
}