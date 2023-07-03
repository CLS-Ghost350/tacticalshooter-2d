module.exports = class GameObject {
    static id = 0;

    id;
    match;
    type;

    constructor(match, type) {
        this.id = GameObject.id;
        GameObject.id++;

        this.match = match;
        this.match.addGameObject(this);

        this.type = type;
    }

    update(deltaTime) {}

    getUpdateData() {
        return {
            id: this.id,
            type: this.type
        }
    }

    emitUpdate(socket) {
        socket.emit("gameObject", this.getUpdateData())
    }

    destroy() {
        this.match.removeGameObject(this.id);
    }
}