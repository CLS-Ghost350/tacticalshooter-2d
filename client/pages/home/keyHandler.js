class KeyHandler {
    static #initiated = false;

    #keyStates = new Set();
    #changed = false;

    get MOUSE_BUTTONS() { return ["mouseLeft","mouseMiddle","mouseRight"]; }

    constructor() {
        if (!KeyHandler.#initiated) KeyHandler.#initiated = true;
        else throw { 
            "CLASS ERROR": "Singleton 'KeyHandler' cannot be initiated more than once." 
        };

        this.keyBindings = {
            w: "moveUp",
            s: "moveDown",
            a: "moveLeft",
            d: "moveRight",
            mouseRight: "shoot",
            mouseLeft: "hit",
            " ": "dash"
        }

        // todo: rewrite in vanilla js
        // only detect keystokes when hovering over game canvas (div)

        //const gameArea = document.getElementById("gameArea");

        document.addEventListener("keydown", event => {
            if (this.keyBindings[event.key]) this.#keyStates.add(this.keyBindings[event.key]);
            this.#changed = true;
        });

        document.addEventListener("keyup", event => {
            if (this.keyBindings[event.key]) this.#keyStates.delete(this.keyBindings[event.key]);
            this.#changed = true;
        });

        document.addEventListener("mousedown", event => {
            if (this.keyBindings[this.MOUSE_BUTTONS[event.button]]) {
                this.#keyStates.add(this.keyBindings[this.MOUSE_BUTTONS[event.button]]);
            }
            
            this.#changed = true;
        });

        document.addEventListener("mouseup", event => {
            if (this.keyBindings[this.MOUSE_BUTTONS[event.button]]) {
                this.#keyStates.delete(this.keyBindings[this.MOUSE_BUTTONS[event.button]]);
            }

            this.#changed = true;
        });

        window.addEventListener('focus', () => this.#keyStates = new Set());
        window.addEventListener('blur', () => this.#keyStates = new Set());

        document.addEventListener('contextmenu', event => event.preventDefault())
        
    }
    
    get keyStates() { return this.#keyStates; }

    get changed() {
        if (this.#changed) {
            this.changed = false;
            return true;
        } else return false;
    }
};

const keyHandler = new KeyHandler();
export default keyHandler;