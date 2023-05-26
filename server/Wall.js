const GameObject = require("./GameObject");
const util = require("../shared/util");

module.exports = class Wall extends GameObject {
    start = { x: 0, y: 0 };
    end = { x: 0, y: 0 };

    constructor(match, startX, startY, endX, endY) {
        super(match);
        
        this.start.x = startX;
        this.start.y = startY;
        this.end.x = endX;
        this.end.y = endY;
    }

    update() {
        
    }
}