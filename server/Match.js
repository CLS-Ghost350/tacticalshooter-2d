const path = require("path");
const fs = require('fs');

const Connection = require("./Connection.js");
const Wall = require("./Wall.js");
const Arrow = require("./Arrow");
const Team = require("./Team.js");

module.exports = class Match {
    static ID = 0;

    CORRECT_TPS = 20; // ...
    TIME_PER_TICK = 1000 / this.CORRECT_TPS; 
    MAX_TIME_BT_TICK = this.TIME_PER_TICK*2 - 3; 

    CLIENT_PATH = path.join(__dirname,"..","client"); 
    DEV_MODE = process.argv[1] == "dev"; 

    connections = {};
    //bots = {};
    walls = [];

    gameObjects = {};

    teams = { }

    #time = 0;
    #_stopGameLoop = false;
    #_realTPSCounter = 0;
    #realTPS = 0;

    constructor(server, description, time) {
        this.ID = Match.ID.toString();
        Match.ID++;

        this.description = description;
        this.time = time;

        this.server = server;

        this.namespace = server.io.of("/match/" + this.ID)

        this.namespace.on("connect",socket => {
            this.connections[socket.id] = new Connection(this, socket);
        });

         // walls
         const map = JSON.parse(fs.readFileSync(path.join(__dirname, "maps", "test2.json"), "utf8"));

         for (const wall of map.walls) {
            this.walls.push(new Wall(this, ...wall));
         }
         // walls end

         this.teams.a = new Team("a", this.namespace);
         this.teams.b = new Team("b", this.namespace);
 
         this.#startGameLoop();
         //this.countTPS(); //fix tps too low

        this.createEmptyTimeout();
    }

    createEmptyTimeout() {
        this.emptyTimeout = setTimeout(() => {
            if (this.connections.length == 0) {
                this.server.deleteMatch(this.ID);
            }
        }, 30000)
    }

    addGameObject(gameObject) {
        this.gameObjects[gameObject.id] = gameObject;
    }

    removeGameObject(gameObject) {
        const id = gameObject?.id ?? gameObject;
        delete this.gameObjects[id];
    }

    addToTeam(connection, team) {}

    updateScoreboard() {
        
    }

    #update = DELTA_TIME => {
        //GameObject.testCollisions()

        Object.values(this.gameObjects).forEach(object => {
            object.update(DELTA_TIME)
        });

        Object.values(this.connections).forEach(connection => {
            connection.update(DELTA_TIME);
        });

        for (const team of Object.values(this.teams)) {
            team.updateVision(this.teams);
            team.emitUpdate();
        }
    }

    countTPS() {
        setInterval(() => {
            this.#realTPS = this.#_realTPSCounter;
            this.#_realTPSCounter = 0;
            console.info("SERVER TPS: " + this.#realTPS);
        },1000)
    } 

    #gameLoop = () => {
        if (this.#_stopGameLoop) return;

        let DELTA_TIME = Date.now() - this.#time;
        if (DELTA_TIME > this.MAX_TIME_BT_TICKS) DELTA_TIME = this.MAX_TIME_BT_TICKS;
        this.#time = Date.now();

        this.#_realTPSCounter++;
        this.#update(DELTA_TIME/1000);

        const updateTime = Date.now() - this.#time;
        //console.debug(updateTime);
        setTimeout(this.#gameLoop, this.TIME_PER_TICK - updateTime-4);
    }

    #startGameLoop = () => {
        this.#_stopGameLoop = false;
        this.#time = Date.now();
        setTimeout(this.#gameLoop,this.TIME_PER_TICK);
    }

    #stopGameLoop = () => {
        this.#_stopGameLoop = true;
    }
}