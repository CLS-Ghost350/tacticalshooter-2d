const util = require("../shared/util.js");

module.exports = class GameObject {
    static gameObjects = [];

    position = { x: 0, y: 0 };
    collisions = [];

    /* Hitbox Formats
   
    */

    constructor(x,y,hitbox) {
        GameObject.gameObjects.push(this);

        this.position.x = x || 0;
        this.position.y = y || 0;
        this.hitbox = hitbox || null;
    }

    destroy() {
        GameObject.gameObjects = GameObject.gameObjects.filter(item => item !== this);
    }

    update() {}
}