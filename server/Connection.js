
// import project classes
const util = require("../shared/util");
const Player = require("./Player.js");
//const GameObject = require("./GameObject.js");

// export Connection class
module.exports = class Connection {
    #socket;

    keyStates = [];
    targetAngle = 0;

    // constants
    get ID() { return this.#socket.id; }
    
    constructor(game,socket) {
        console.info({ "PLAYER CONNECTED": { id: socket.id } });

        this.game = game;
        this.#socket = socket;

        // add event listeners
        this.#handleSocket();
    }

    #handleSocket = () => {
        this.#socket.on("disconnect", reason => {
            this.destroy();
        });

        this.#socket.on("joinGame",msg => {
            console.info({ "PLAYER JOINED GAME": { id: this.ID } });

            this.player = new Player(this.game,this.ID,this);

            this.game.io.emit("player", { x: 0, y: 0, angle: 0, id: this.ID});
        })

        this.#socket.on("updateData",msg => {
            if (!this.player) return this.destroy();
            if (!isNaN(msg.targetAngle)) this.targetAngle = msg.targetAngle;
            if (msg.keyStates instanceof Array) this.keyStates = msg.keyStates;
        });
    }

    update(TIME_SINCE) {
    }

    destroy() {
        console.info({ "PLAYER DISCONNECTED": { id: this.ID } });
        this.game.io.emit("playerLeft",{ id: this.ID });
        
        if (this.player) this.player.destroy();
        delete this.game.connections[this.ID];

        this.#socket.removeAllListeners(); 
    }
}