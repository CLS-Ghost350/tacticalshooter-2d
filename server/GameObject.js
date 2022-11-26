const util = require("../shared/util.js");

module.exports = class GameObject {
    static gameObjects = [];

    constructor() {
        GameObject.gameObjects.push(this);
    }

    destroy() {
        GameObject.gameObjects = GameObject.gameObjects.filter(item => item !== this);
        // slow?
    }

    update(deltaTime) {}
}