
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
    player = null;
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
            if (this.player) return;

            console.info({ "PLAYER JOINED": { id: this.ID, team } });
            this.player = new Player(this.match, this, this.ID);

            if (team != this.team) {
                // switched teams
                this.team = team;
            }
        });

        this.#socket.on("updateData",msg => {
            //if (!this.player) return this.destroy(); // what does this do
            if (!isNaN(msg.targetAngle)) this.#targetAngle = msg.targetAngle;
            if (!isNaN(msg.zoomDist)) this.zoomDist = msg.zoomDist;
            if (msg.keyStates instanceof Array) this.#keyStates = msg.keyStates;
        });
    }

    update(TIME_SINCE) {
    }

    killPlayer() {
        this.player = null;
        this.match.namespace.emit("playerLeft",{ id: this.ID });
    }

    destroy() {
        console.info({ "PLAYER DISCONNECTED": { id: this.ID } });
        this.match.namespace.emit("playerLeft",{ id: this.ID });
        
        if (this.player) this.match.removeGameObject(this.player);
        delete this.match.connections[this.ID];

        this.#socket.removeAllListeners(); 
    }
}