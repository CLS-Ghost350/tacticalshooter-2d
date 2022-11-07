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

        $(document).keydown(event => {
            if (this.keyBindings[event.key]) this.#keyStates.add(this.keyBindings[event.key]);
            this.#changed = true;
        });

        $(document).keyup(event => {
            if (this.keyBindings[event.key]) this.#keyStates.delete(this.keyBindings[event.key]);
            this.#changed = true;
        });

        $(document).mousedown(event => {
            if (this.keyBindings[this.MOUSE_BUTTONS[event.button]]) {
                this.#keyStates.add(this.keyBindings[this.MOUSE_BUTTONS[event.button]]);
            }
            
            this.#changed = true;
        });

        $(document).mouseup(event => {
            if (this.keyBindings[this.MOUSE_BUTTONS[event.button]]) {
                this.#keyStates.delete(this.keyBindings[this.MOUSE_BUTTONS[event.button]]);
            }

            this.#changed = true;
        });

        $(window).focus(() => this.#keyStates = new Set());

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