
// import project classes
const util = require("../shared/util");
const Player = require("./Player.js");
//const GameObject = require("./GameObject.js");

// export Connection class
module.exports = class Connection {
    #socket;
    get socket() { return this.#socket; }

    #keyStates = [];
    #targetAngle = 0;

    get keyStates() { return this.#keyStates };
    get targetAngle() { return this.#targetAngle };

    // constants
    get ID() { return this.#socket.id; }

    team = null;
    zoomDist = 0;
    
    constructor(match, socket) {
        console.info({ "PLAYER CONNECTED": { id: socket.id } });

        this.match = match;
        this.#socket = socket;

        // add event listeners
        this.#handleSocket();
    }

    #handleSocket = () => {
        this.#socket.on("disconnect", reason => {
            this.destroy();
        });

        this.#socket.on("joinTeam", ({ team }) => {
            this.team = team;
        });

        this.#socket.on("respawn",msg => {
            console.info({ "PLAYER RESPAWNED": { id: this.ID } });

            this.player = new Player(this.match, this, this.ID);
        })

        this.#socket.on("updateData",msg => {
            if (!this.player) return this.destroy();
            if (!isNaN(msg.targetAngle)) this.#targetAngle = msg.targetAngle;
            if (!isNaN(msg.zoomDist)) this.zoomDist = msg.zoomDist;
            if (msg.keyStates instanceof Array) this.#keyStates = msg.keyStates;
        });
    }

    update(TIME_SINCE) {
    }

    destroy() {
        console.info({ "PLAYER DISCONNECTED": { id: this.ID } });
        this.match.namespace.emit("playerLeft",{ id: this.ID });
        
        if (this.player) this.match.removeGameObject(this.player);
        delete this.match.connections[this.ID];

        this.#socket.removeAllListeners(); 
    }
}