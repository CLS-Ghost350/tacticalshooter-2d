
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const fs = require('fs');

const Connection = require("./Connection.js");
const GameObject = require("./GameObject.js");
const Wall = require("./Wall.js");
const Arrow = require("./Arrow");

class Server {
    HOSTNAME = process.env.PORT ? "0.0.0.0" : "127.0.0.1";
    PORT = process.env.PORT || 8000; 

    CORRECT_TPS = 20; // ...
    TIME_PER_TICK = 1000 / this.CORRECT_TPS; 
    MAX_TIME_BT_TICK = this.TIME_PER_TICK*2 - 3; 
    CLIENT_PATH = path.join(__dirname,"..","client"); 
    DEV_MODE = process.argv[1] == "dev"; 

    #app = express();
    #server = http.createServer(this.#app);
    #io = socketIO(this.#server);

    connections = {};
    bots = {};
    walls = [];

    #time = 0;
    #_stopGameLoop = false;
    #_realTPSCounter = 0;
    #realTPS = 0;
    
    constructor() {
        this.app.use(express.json()); // json parser middleware

        this.serveFiles();
        this.addPages();

        this.io.on("connect",socket => {
            this.connections[socket.id] = new Connection(this,socket);
        });

        this.addAPIRoutes();
        
        // walls
        const map = JSON.parse(fs.readFileSync(path.join(__dirname, "maps", "test2.json"), "utf8"));

        for (const wall of map.walls) {
            this.walls.push(new Wall(...wall));
        }
        // walls end

        this.#startGameLoop();
        //this.#countTPS(); //fix tps too low

        this.#server.listen(this.PORT,this.HOSTNAME,() => {
            console.info({ "SERVER STARTED": { port: this.PORT, hostname: this.HOSTNAME } });
        });
    }

    serveFiles() {
        this.app.use("/assets",express.static(path.join(this.CLIENT_PATH,"assets")));
        this.app.use("/bundles",express.static(path.join(this.CLIENT_PATH,"bundles")));

        this.app.use("/maps",express.static(path.join(__dirname, "maps")));
    }

    addPages() {
        this.app.get("/", (req, res) => res.sendFile(path.join(this.CLIENT_PATH,"html","home.html")));
    }

    addAPIRoutes() {
        
    }

    #countTPS = () => setInterval(() => {
        this.#realTPS = this.#_realTPSCounter;
        this.#_realTPSCounter = 0;
        console.info("SERVER TPS: " + this.#realTPS);
    },1000)

    createArrow(...args) {
        new Arrow(...args);
    }

    #update = DELTA_TIME => {
        //GameObject.testCollisions()

        GameObject.gameObjects.forEach(object => {
            object.update(DELTA_TIME)
        })

        Object.values(this.connections).forEach(connection => {
            connection.update(DELTA_TIME);
        });

        Object.values(this.bots).forEach(bot => {
            bot.update(DELTA_TIME);
        });
    }

    #gameLoop = () => {
        if (this.#_stopGameLoop) return;

        let DELTA_TIME = Date.now() - this.#time;
        if (DELTA_TIME > this.MAX_TIME_BT_TICKS) DELTA_TIME = this.MAX_TIME_BT_TICKS;
        this.#time = Date.now();

        this.#_realTPSCounter++;
        this.#update(DELTA_TIME);

        const updateTime = Date.now() - this.#time;
        //console.debug(updateTime);
        setTimeout(this.#gameLoop, this.TIME_PER_TICK - updateTime-4);
    }

    #startGameLoop = () => {
        this.#stopGameLoop = false;
        this.#time = Date.now();
        setTimeout(this.#gameLoop,this.TIME_PER_TICK);
    }

    #stopGameLoop = () => {
        this.#_stopGameLoop = true;
    }

    get app() { return this.#app; }
    get io() { return this.#io; }
};
    
const server = new Server();
