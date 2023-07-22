
import Phaser from "phaser";
import socket from "../socket";

import keyHandler from "../keyHandler";
import CONFIG from "../phaserConfig";

import Player from "../gameObjects/Player";
import Arrow from "../gameObjects/Arrow";
import Grenade from "../gameObjects/Grenade";
import Shadows from "../gameObjects/Shadows";
import Minimap from "../gameObjects/Minimap";

import VisibilityPolygon from "../VisibilityPolygon";
import bezier from "bezier-easing";

import { store } from "../store";
import { setSetting } from "../storeSlices/settingsSlice";
import { setScoreboardState, addPlayer, removePlayer } from "../storeSlices/scoreboardSlice";
import { subscribeActionAfter, subscribeAfter } from 'redux-subscribe-action';

export default class GameScene extends Phaser.Scene {
    #gameInited = false;
    #players = {};
    #arrows = {};
    #grenades = {};

    #debugPoints = {};

    get players() { return this.#players; }

    walls = [];
    unintersectingWalls = [];

    zoomCurve = bezier(.3,.72,0,1);
    zoomCurveLinear = a=>a*1.7;

    ZOOM_SCALE = CONFIG.width/2 * 0.6;
    heightWidthRatio = CONFIG.height / CONFIG.width;
    ZOOM_SPEED = 0.25;
    ZOOMED_FOV = 0.6;
    zoomDist = 0;

    zoomToggled = false;

    constructor() { super("GameScene"); }

    init() {
        console.groupEnd();
        console.group("Game Scene");
        console.info({ "GAME SCENE STARTED": {} });
    }

    create() {
        this.anims.create({
            key: "bowAnimation",
            frames: this.anims.generateFrameNumbers("bowSpritesheet"),
            frameRate: 16,
        }); 
        
        this.debug = this.add.graphics();
        this.debug.setDepth(100000);

        this.wallGraphics = this.add.graphics();

        this.visibilityGraphics = this.add.graphics();
        this.visibilityGraphics.setVisible(false);

        this.backgroundImg = this.add.image(0,0,"backgroundImg");
        this.backgroundImg.setOrigin(0,0);
        this.backgroundImg.setScale(10);
        this.backgroundImg.setDepth(-100);

        this.shadows = new Shadows(this);
        this.minimap = new Minimap(this, 0.1);

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

        keyHandler.onInputDown("zoom", () => this.zoomToggled = !this.zoomToggled);
    }

    update(time,delta) {
        this.updateDebug(delta)

        //this.cameras.main.setZoom(window.innerWidth / 1920); // 1920 width
        this.ZOOM_SCALE = this.cameras.main.width/2 * 0.6;
        this.heightWidthRatio = this.cameras.main.height / this.cameras.main.width;

        const sharedState = store.getState();
        
        this.drawShadows(sharedState.settings.zoomedViewCone && this.zoomDist > 0);
    
        this.displayWalls();

        if (this.#players.main) {
            const keyStates = keyHandler.keyStates;

            //if (keyStates.has("debugTest")) this.#players.main.setPosition(1000, 500);
            //else this.#players.main.setPosition(0, 500);
            //console.log({player: this.#players.main.x, camera: this.cameras.main.worldView.centerX});

            //console.log(this.cameras.main.scrollX)
            
            //this.debug.fillStyle(0x00ff00, 1);
            //this.debug.fillPoint(this.#players.main.x + offsetX, this.#players.main.y + offsetY, 5);
            //this.debug.fillStyle(0x0000ff, 1);
            //this.debug.fillPoint(this.cameras.main.worldView.centerX, this.cameras.main.worldView.centerY, 5);

            const zooming = sharedState.settings.alwaysZooming || (sharedState.settings.toggledZoom? this.zoomToggled : keyStates.has("zoom"));

            this.mouseAngle = Phaser.Math.Angle.Between(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.input.activePointer.x,
                this.input.activePointer.y
            );

            this.updateZoomDist(zooming, sharedState.settings.zoomCurve? this.zoomCurve : this.zoomCurveLinear);
            const [ offsetX, offsetY] = this.calcZoomOffset(this.zoomDist, this.mouseAngle);

            this.cameras.main.setFollowOffset(-offsetX, -offsetY);

            socket.emit("updateData",{ 
                targetAngle: Phaser.Math.RadToDeg(this.mouseAngle),
                keyStates: Array.from(keyStates),
                zoomDist: this.zoomDist,
                weaponSelected: sharedState.game.weaponSelected
            });
        }
    }

    #handleSocket() {
        socket.removeAllListeners();

        socket.on("objectObstructed", ({ id }) => {
            this.#players[id]?.setVisible(false);
        });

        socket.on("player",msg => {
            console.debug("test")
            const player = this.#players[msg.id];

            if (!player) {
                console.info({ "PLAYER JOINED": msg });
                this.#players[msg.id] = new Player(this,msg.x,msg.y,msg.angle,msg.socketId == socket.id, msg.team);

                if (msg.socketId == socket.id) {
                    this.#players.main = this.#players[msg.id];
                    this.cameras.main.startFollow(this.#players.main, false, 0.9, 0.9);
                }

                store.dispatch(addPlayer({ player: { team: this.#players[msg.id].team } })); // the 'player' connections aren't linked w/ the physical players
            } else {
                player.setPosition(msg.x,msg.y);
                //console.log(msg.x + " " + msg.y);
                player.angle = msg.angle;
                player.team = msg.team;
                player.zoomDist = msg.zoomDist;
                this.#players[msg.id].setVisible(true);
            }
        });

        socket.on("playerLeft", msg => {
            if (!this.#players[msg.id])
                return console.warn({ "LEFT PLAYER DOES NOT EXIST": msg.id });

            console.info({ "PLAYER LEFT": msg });
            if (this.#players[msg.id].mainPlayer) {
                //setTimeout(() => window.location.reload(), 2000);
            }

            store.dispatch(removePlayer({ player: { team: this.#players[msg.id].team } }));

            this.#players[msg.id].kill();
            delete this.#players[msg.id];

            if (this.#players.main.id == msg.id)
                delete this.#players.main;
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
                arrow.setPosition(msg.x, msg.y);
            }
        });

        socket.on("arrowDestory",msg => {
            if (!this.#arrows[msg.id])
                return console.warn({ "TO DESTROY ARROW DOES NOT EXIST": msg.id });

            this.#arrows[msg.id].fadeOutDestroy();
            delete this.#arrows[msg.id];
        })

        socket.on("grenade",msg => {
            const grenade = this.#grenades[msg.id];

            if (!grenade) this.#grenades[msg.id] = new Grenade(this,msg.x,msg.y,0);
            
            else {
                //grenade.angle = msg.angle;
                grenade.setPosition(msg.x, msg.y);
            }
        });

        socket.on("grenadeDestory",msg => {
            if (!this.#grenades[msg.id])
                return console.warn({ "TO DESTROY GRENADE DOES NOT EXIST": msg.id });

            this.#grenades[msg.id].destroy();
            delete this.#grenades[msg.id];
        })

        socket.on("debugPoint", msg => {
            this.#debugPoints[msg.id] = msg;
        });
    }

    updateDebug(deltaTime) {
        this.debug.clear();

        const mouseWorldX = Math.round(this.input.activePointer.x + this.cameras.main.worldView.left);
        const mouseWorldY = Math.round(this.input.activePointer.y + this.cameras.main.worldView.top);
        document.getElementById("coords").innerText = `(${mouseWorldX}, ${mouseWorldY})`;

        for (const debugPoint of Object.values(this.#debugPoints)) {
            if (debugPoint.hasOwnProperty("expiryTime")) {
                if (debugPoint.expiryTime <= 0) {
                    delete this.#debugPoints[debugPoint.id];
                    continue;
                }

                debugPoint.expiryTime -= deltaTime / 1000;
            }

            this.debug.fillStyle(debugPoint.color ?? 0x0000FF);
            this.debug.fillCircle(debugPoint.x, debugPoint.y, debugPoint.radius ?? 3)
        }
    }

    updateZoomDist(zooming, zoomCurve) {
        let zoomAmount = 0;

        if (zooming) {
            const dx = this.input.activePointer.x - this.cameras.main.centerX;
            const dy = this.input.activePointer.y - this.cameras.main.centerY;

            // const dist = Math.sqrt((dx * this.heightWidthRatio)**2 + dy**2);
            // zoomAmount = zoomCurve(dist / Math.sqrt(2 * (this.cameras.main.width/2)**2)); // diagonal dist

            const dist = Math.sqrt(dx**2 + dy**2);
            zoomAmount = zoomCurve(dist / Math.sqrt(2 * (this.cameras.main.width/2)**2)); // diagonal dist
        }

        const dz = zoomAmount - this.zoomDist;
        if (Math.abs(dz) < this.ZOOM_SPEED) this.zoomDist = zoomAmount;
        else this.zoomDist += Math.sign(dz) * this.ZOOM_SPEED;
    }

    calcZoomOffset(zoomDist, angle) {
        return [ 
            Math.cos(angle) * zoomDist * this.ZOOM_SCALE,
            //Math.sin(angle) * zoomDist * this.heightWidthRatio * this.ZOOM_SCALE 
            Math.sin(angle) * zoomDist * this.ZOOM_SCALE 
        ];
    }

    displayWalls() {
        this.wallGraphics.clear();

        this.wallGraphics.lineStyle(2,"0xfc0303",1);

        for (const wall of this.walls) {
            this.wallGraphics.lineBetween(...wall);
        }
    }

    drawShadows(restrictFOV) {
        this.visibilityGraphics.fillStyle(0xff0000);
        this.visibilityGraphics.clear();

        for (const player of Object.values(this.#players)) {
            if (player.team != this.#players.main?.team)
                continue;

            let offsetX, offsetY;

            if (player.mainPlayer) {
                offsetX = this.cameras.main.worldView.centerX - player.x;
                offsetY = this.cameras.main.worldView.centerY - player.y;
            } else [ offsetX, offsetY ] = this.calcZoomOffset(player.zoomDist, player.rotation);

            const viewTop = player.y - this.cameras.main.height/2 + offsetY - 10;
            const viewLeft = player.x - this.cameras.main.width/2 + offsetX - 10;
            const viewBottom = player.y + this.cameras.main.height/2 + offsetY + 10;
            const viewRight = player.x + this.cameras.main.width/2 + offsetX + 10;

            let walls = this.unintersectingWalls;

            if (restrictFOV) { // restricted visibility cone disabled
                const cwAngle = player.rotation + this.ZOOMED_FOV;
                const ccwAngle = player.rotation - this.ZOOMED_FOV;

                walls = VisibilityPolygon.breakIntersections([ ...this.unintersectingWalls, 
                    [ 
                        [ player.x - Math.cos(player.rotation), player.y - Math.sin(player.rotation) ], 
                        [ player.x + Math.cos(cwAngle)*10000, player.y + Math.sin(cwAngle)*10000 ] 
                    ],
                    [ 
                        [ player.x - Math.cos(player.rotation), player.y - Math.sin(player.rotation) ], 
                        [ player.x + Math.cos(ccwAngle)*10000, player.y + Math.sin(ccwAngle)*10000 ] 
                    ] 
                ]);
            }

            const visibilityPolygon = VisibilityPolygon.computeViewport(
                [player.x, player.y], 
                walls,
                [viewLeft, viewTop], 
                [viewRight,viewBottom], 
            ); // does not duplicate starting point
            
            const start = visibilityPolygon[0];
            const end = visibilityPolygon[visibilityPolygon.length - 1];

            this.visibilityGraphics.moveTo(end);
            this.visibilityGraphics.beginPath();
            for (const point of visibilityPolygon)
                this.visibilityGraphics.lineTo(...point);
            this.visibilityGraphics.closePath();
            this.visibilityGraphics.fillPath();
        }

        //if (this.visibilityMask) this.visibilityMask.destroy();
        this.visibilityMask = this.visibilityGraphics.createGeometryMask();

        for (const player of Object.values(this.#players)) {
            //player.clearMask();
            player.setMask(this.visibilityMask);
            player.bow.setMask(this.visibilityMask);
        }

        for (const arrow of Object.values(this.#arrows)) {
            //arrow.clearMask();
            arrow.setMask(this.visibilityMask);
        }

        this.shadowsVisibilityMask = this.visibilityGraphics.createGeometryMask();
        this.shadowsVisibilityMask.setInvertAlpha();

        this.shadows.setMask(this.shadowsVisibilityMask);
    }
}