
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const fs = require('fs');

const Match = require("./Match.js");

class Server {
    HOSTNAME = process.env.PORT ? "0.0.0.0" : "127.0.0.1";
    PORT = process.env.PORT || 8000; 

    CLIENT_PATH = path.join(__dirname,"..","client"); 
    DEV_MODE = process.argv[1] == "dev"; 

    #app = express();
    #server = http.createServer(this.#app);
    #io = socketIO(this.#server);

    matches = { 0: new Match(this, "Match 0", 10) };
    
    constructor() {
        this.app.use(express.json()); // json parser middleware

        this.serveFiles();
        this.addPages();

        this.io.on("connect",socket => {
            
        });

        this.addAPIRoutes();

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

        this.app.get("/match/:id", (req, res) => {
            if (this.matches.hasOwnProperty(req.params.id)) {
                res.sendFile(path.join(this.CLIENT_PATH,"html","match.html"))
            } else {
                // send "match not found" page
                res.send("MATCH NOT FOUND")
            }
        });
    }

    addAPIRoutes() {
        this.app.get("/matches", (req, res) => {
            res.send({ matches: Object.values(this.matches).map(match => ({ 
                ID: match.ID, 
                description: match.description, 
                time: match.time,
                players: match.connections.length
            })) });
        })

        this.app.post("/createMatch", (req, res) => {
            const match = new Match(this,req.body.description, req.body.time)
            console.log({ "MATCH CREATED": { ID: match.ID, description: match.description, time: match.time }})

            this.matches[match.ID] = match;
            res.send({ ID: match.ID });
        })
    }

    deleteMatch(ID) {
        this.matches[ID].namespace.removeAllListeners();
        delete this.matches[ID];
    }

    get app() { return this.#app; }
    get io() { return this.#io; }
};
    
const server = new Server();
