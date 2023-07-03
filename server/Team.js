module.exports = class Team {
    id;

    obstructableObjects = {};
    viewers = {};
    #visibleObjects = {};
    #noLongerVisibleObjects = [];

    constructor(id, namespace) {
        this.id = id;
        this.namespace = namespace;
        this.room = namespace.to(id);
    }

    updateVision(teams) {
        const pastVisibleObjects = Object.keys(this.#visibleObjects);
        this.#visibleObjects = {};
        this.#noLongerVisibleObjects = [];

        for (const team of Object.values(teams)) {
            if (team.id == this.id) continue;

            for (const object of Object.values(team.obstructableObjects)) {
                for (const viewer of Object.values(this.viewers)) {
                    if (object.isVisibleFrom(viewer.position.x, viewer.position.y)) {
                        this.#visibleObjects[object.id] = object;
                    }
                }
            }
        }

        for (const objId of pastVisibleObjects) 
            if (!this.#visibleObjects[objId]) this.#noLongerVisibleObjects.push(objId);
    }

    emitUpdate() {
        for (const object of Object.values(this.#visibleObjects)) 
            object.emitUpdate(this.room);

        for (const object of Object.values(this.obstructableObjects))
            object.emitUpdate(this.room);

        for (const objId of this.#noLongerVisibleObjects) 
            this.room.emit("objectObstructed", { id: objId });
    }
}