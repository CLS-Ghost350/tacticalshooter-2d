
// import project classes
const util = require("../shared/util");
const Player = require("./Player.js");

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
            this.player = new Player(this.match, this);
            this.match.teams[team].viewers[this.player.id] = this.player;
            this.match.teams[team].obstructableObjects[this.player.id] = this.player;

            if (team != this.team) { // switched teams
                if (this.team) {
                    delete this.match.teams[this.team].viewers[this.player.id];
                    delete this.match.teams[this.team].obstructableObjects[this.player.id];
                }

                this.team = team;

                this.#socket.join(team);
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
        delete this.match.teams[this.team].viewers[this.player.id];
        delete this.match.teams[this.team].obstructableObjects[this.player.id];
        this.match.namespace.emit("playerLeft",{ id: this.player.id, socketId: this.ID });
        this.player = null;
    }

    destroy() {
        console.info({ "PLAYER DISCONNECTED": { id: this.ID } });
        
        if (this.player) this.killPlayer();
        delete this.match.connections[this.ID];

        this.#socket.removeAllListeners(); 
    }
}