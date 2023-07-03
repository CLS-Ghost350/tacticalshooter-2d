const GameObject = require("./GameObject.js");
const util = require("../shared/util");

module.exports = class Wall extends GameObject {
    start = { x: 0, y: 0 };
    end = { x: 0, y: 0 };

    constructor(match, startX, startY, endX, endY) {
        super(match, "wall");
        
        this.start.x = startX;
        this.start.y = startY;
        this.end.x = endX;
        this.end.y = endY;

        this.dx = endX - startX;
        this.dy = endY - startX;
        this.angle = Math.atan2(this.dy, this.dx);
        this.length = Math.sqrt(this.dx**2 + this.dy**2);
    }

    update() {
        
    }
}