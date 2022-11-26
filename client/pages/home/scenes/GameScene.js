
import Phaser from "phaser";
import socket from "../socket";

import keyHandler from "../keyHandler";
import CONFIG from "../phaserConfig";

import Player from "../gameObjects/Player";
import Arrow from "../gameObjects/Arrow";

import VisibilityPolygon from "../VisibilityPolygon";

export default class GameScene extends Phaser.Scene {
    #gameInited = false;
    #players = {};
    #arrows = {};

    walls = [];
    unintersectingWalls = [];

    constructor() { super("GameScene"); }

    init() {
        console.groupEnd();
        console.group("Game Scene");
        console.info({ "GAME SCENE STARTED": {} });
    }

    create() {
        this.debug = this.add.graphics();

        this.visibilityGraphics = this.add.graphics();

        this.backgroundImg = this.add.image(0,0,"backgroundImg");
        this.backgroundImg.setOrigin(0,0);
        this.backgroundImg.setScale(10);
        this.backgroundImg.setDepth(-100);

        this.#handleSocket();

        fetch("/maps/test2.json").then(response => {
            response.json().then(data => {
                this.walls = data.walls;

                for (const wall of this.walls) 
                    this.unintersectingWalls.push([ [wall[0], wall[1]], [wall[2], wall[3]] ]);
                
                this.unintersectingWalls = VisibilityPolygon.breakIntersections(this.unintersectingWalls);
            });
        }).catch(e => {
            console.log(e);
        })
            

        socket.emit("joinGame");
    }

    update(time,delta) {
        this.debug.clear();

        if (!this.#gameInited) {
            if (this.#players[socket.id]) {
                this.#gameInited = true;
                this.#players.main = this.#players[socket.id];
                this.cameras.main.startFollow(this.#players.main); // add a tiny bit of camera lag
            } else return;
        }

        const keyStates = keyHandler.keyStates;

        const targetAngle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(
            CONFIG.width / 2,
            CONFIG.height / 2,
            this.input.activePointer.x,
            this.input.activePointer.y
        ));

        socket.emit("updateData",{ 
            targetAngle: targetAngle,
            keyStates: Array.from(keyStates)
        });

        // visibility, light effect

        if (this.#players.main) {
            const viewTop = this.#players.main.y - CONFIG.height/2;
            const viewLeft = this.#players.main.x - CONFIG.width/2;
            const viewBottom = this.#players.main.y + CONFIG.height/2;
            const viewRight = this.#players.main.x + CONFIG.width/2;

            const visibilityPolygon = VisibilityPolygon.computeViewport(
                [this.#players.main.x, this.#players.main.y], 
                this.unintersectingWalls,
                [viewLeft, viewTop], 
                [viewRight,viewBottom], 
            ); // does not duplicate starting point
            
            const start = visibilityPolygon[0];
            const end = visibilityPolygon[visibilityPolygon.length - 1];
            const outerRectStart = [ viewRight + 5, (start[1] + end[1])/2 + 5 ];
            
            /*
            this.debug.fillStyle(0x00ff00);
            this.debug.fillCircle(start[0],start[1],5);
            this.debug.fillStyle(0x0000ff);
            this.debug.fillCircle(end[0],end[1],5);
            
            // bug when this line passes through visible area
            //this.debug.lineBetween(end[0],end[1],viewRight+5, viewTop-5);
            this.debug.lineBetween(end[0],end[1],outerRectStart[0],outerRectStart[1])*/
            
            if (this.visPoly) this.visPoly.destroy();

            this.visPoly = this.add.polygon(0, 0, [
                ...visibilityPolygon, 
                outerRectStart,
                [viewRight + 5, viewTop - 5],
                [viewLeft - 5, viewTop - 5],
                [viewLeft - 5, viewBottom + 5],
                [viewRight + 5, viewBottom + 5],
                outerRectStart,
                end
            ], 0x000000);

            this.visPoly.setOrigin(0,0);
            this.visPoly.setDepth(100);
            this.visPoly.setAlpha(0.65);

            //this.visibilityGraphics.fillStyle(0xff0000);
            this.visibilityGraphics.clear();
            this.visibilityGraphics.moveTo(end);
            this.visibilityGraphics.beginPath();
            for (const point of visibilityPolygon)
                this.visibilityGraphics.lineTo(...point);
            this.visibilityGraphics.closePath();
            this.visibilityGraphics.fillPath();
            //if (this.visibilityMask) this.visibilityMask.destroy();
            this.visibilityMask = this.visibilityGraphics.createGeometryMask();

            for (const player of Object.values(this.#players)) {
                //player.clearMask();
                player.setMask(this.visibilityMask);
            }

            for (const arrow of Object.values(this.#arrows)) {
                //arrow.clearMask();
                arrow.setMask(this.visibilityMask);
            }
        }

        this.displayWalls();
    }

    #handleSocket() {
        socket.removeAllListeners();

        socket.on("player",msg => {
            console.debug("test")
            const player = this.#players[msg.id];

            if (!player) {
                console.info({ "PLAYER JOINED": msg });
                this.#players[msg.id] = new Player(this,msg.x,msg.y,msg.angle,msg.id == socket.id);
            } else {
                player.setPosition(msg.x,msg.y);
                console.log(msg.x + " " + msg.y);
                player.angle = msg.angle;
            }
        });

        socket.on("playerLeft", msg => {
            console.info({ "PLAYER LEFT": msg });
            if (this.#players[msg.id].mainPlayer) {
                setTimeout(() => window.location.reload(), 2000);
            }
            this.#players[msg.id].kill();
            delete this.#players[msg.id];
        });

        socket.on("bowDraw",msg => {
            this.#players[msg.playerID]?.bow.playAnimation();
        });

        socket.on("bowDrawStop",msg => {
            this.#players[msg.playerID]?.bow.stopAnimation();
        });

        socket.on("arrow",msg => {
            const arrow = this.#arrows[msg.id];

            if (!arrow) this.#arrows[msg.id] = new Arrow(this,msg.x,msg.y,msg.angle);
            
            else {
                arrow.angle = msg.angle;
                arrow.x = msg.x - Math.cos(arrow.rotation) * 9;
                arrow.y = msg.y - Math.sin(arrow.rotation) * 9;
            }
        });

        socket.on("arrowDestory",msg => setTimeout(() => {
            this.#arrows[msg.id].destroy();
            delete this.#arrows[msg.id];
        }),100)
    }

    displayWalls() {
        this.debug.lineStyle(2,"0xfc0303",1);

        for (const wall of this.walls) {
            this.debug.lineBetween(...wall);
        }
    }
};