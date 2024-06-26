import { store } from "./store";
import { setKeybind } from "./storeSlices/settingsSlice";
import { subscribeActionAfter, subscribeAfter } from 'redux-subscribe-action';

class KeyHandler {
    static #initiated = false;

    #keyStates = new Set();
    #changed = false;
    keyBindings = {};

    #inputDownHandlers = {};
    #inputUpHandlers = {};

    get MOUSE_BUTTONS() { return ["MouseLeft","MouseMiddle","MouseRight"]; }
    get MOUSE_WHEEL_ACTIONS() { return { x: ["ScrollLeft", "ScrollRight"], 
        y: ["ScrollUp", "ScrollDown"], z: ["ScrollBackwards", "ScrollForwards"] }; }

    constructor() {
        if (!KeyHandler.#initiated) KeyHandler.#initiated = true;
        else throw { 
            "CLASS ERROR": "Singleton 'KeyHandler' cannot be initiated more than once." 
        };

        this.updateKeyBindings();
        subscribeActionAfter(setKeybind.toString(), this.updateKeyBindings.bind(this));

        // only detect keystokes when hovering over game canvas (div)
        // add scroll detection
        // removed repeated keydown triggers when holding down a key

        //const gameArea = document.getElementById("gameArea");

        document.addEventListener("keydown", event => {
            if (event.defaultPrevented) return; // Do nothing if event already handled
            if (event.repeat) return; // ignores repeated events from holding down a key
            if (!this.keyBindings[event.code]) return; // no bindings

            this.keyBindings[event.code].forEach(type => {
                this.#keyStates.add(type);
                this.#inputDownHandlers[type]?.forEach(func => func());
            }, this.#keyStates);

            this.#changed = true;
            //event.preventDefault();
        });

        document.addEventListener("keyup", event => {
            if (event.defaultPrevented) return; // Do nothing if event already handled

            if (!this.keyBindings[event.code]) return; // no key bindings

            this.keyBindings[event.code].forEach(type => {
                this.#keyStates.delete(type);
                this.#inputUpHandlers[type]?.forEach(func => func());
            }, this.#keyStates);

            this.#changed = true;
            //event.preventDefault();
        });

        document.addEventListener("mousedown", event => {
            //if (event.defaultPrevented) return; // Do nothing if event already handled

            if (!this.keyBindings[this.MOUSE_BUTTONS[event.button]]) return; // no bindings

            this.keyBindings[this.MOUSE_BUTTONS[event.button]].forEach(type => {
                this.#keyStates.add(type);
                this.#inputDownHandlers[type]?.forEach(func => func());
            }, this.#keyStates);
            
            this.#changed = true;
            //event.preventDefault();
        });

        document.addEventListener("mouseup", event => {
            //if (event.defaultPrevented) return; // Do nothing if event already handled

            if (!this.keyBindings[this.MOUSE_BUTTONS[event.button]]) return; // no bindings

            this.keyBindings[this.MOUSE_BUTTONS[event.button]].forEach(type => {
                this.#keyStates.delete(type);
                this.#inputUpHandlers[type]?.forEach(func => func());
            }, this.#keyStates);

            this.#changed = true;
            event.preventDefault();
        });

        let lastScrollTop = 0;

        document.addEventListener("wheel", event => { 
            const wheelChange = { x: event.deltaX, y: event.deltaY, z: event.deltaZ };
            //console.log(wheelChange);

            //if (event.defaultPrevented) return; // Do nothing if event already handled

            for (const [axis, amount] of Object.entries(wheelChange)) {
                if (amount == 0) continue; // no change

                const bindings = this.keyBindings[this.MOUSE_WHEEL_ACTIONS[axis][amount > 0? 1 : 0]];
                if (!bindings) return; // no bindings

                bindings.forEach(type => {
                    this.#inputDownHandlers[type]?.forEach(func => func());
                }, this.#keyStates);
            }
            
            //event.preventDefault();
        });

        window.addEventListener('focus', () => this.#keyStates = new Set());
        window.addEventListener('blur', () => this.#keyStates = new Set());

        document.addEventListener('contextmenu', event => event.preventDefault()) // prevents right-click menu
        
        // listen to store changes and change keybinds
    }
    
    get keyStates() { return this.#keyStates; }

    get changed() {
        if (this.#changed) {
            this.changed = false;
            return true;
        } else return false;
    }

    updateKeyBindings() {
        const keybinds = store.getState().settings.keybinds;

        this.keyBindings = {};
        for (const [ type, keys ] of Object.entries(keybinds)) {
            for (const key of keys) {
                if (!this.keyBindings[key]) this.keyBindings[key] = new Set();
                this.keyBindings[key].add(type);
            }
        }
    }

    onInputDown(type, listener) {
        if (!this.#inputDownHandlers[type]) this.#inputDownHandlers[type] = [];
        this.#inputDownHandlers[type].push(listener);
        return () => this.#inputDownHandlers[type].filter(func => func != listener);
    }

    onInputUp(type, listener) {
        if (!this.#inputUpHandlers[type]) this.#inputUpHandlers[type] = [];
        this.#inputUpHandlers[type].push(listener);
        return () => this.#inputUpHandlers[type].filter(func => func != listener);
    }
};

const keyHandler = new KeyHandler();
export default keyHandler;