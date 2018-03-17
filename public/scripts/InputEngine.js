class InputEngine {
  
    constructor() {
        
        // Definitions of ASCII codes to string values for readability
        this.bindings = {};
    
        // A map with all possbile actions as keys and booleans as values to check if that action is being performed currently
        this.actions = {};

        // We will use this a bit later
        this.listeners = [];
    }
  
    setup() {
        this.bind(38, 'up');
        this.bind(37, 'left');
        this.bind(40, 'down');
        this.bind(39, 'right');
    
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }
  
    onKeyDown(event) {
        const action = gInputEngine.bindings[event.keyCode];
        if (action) {
            gInputEngine.actions[action] = true;
            event.preventDefault();
        }
        return false;
    }
  
    onKeyUp(event) {
        const action = gInputEngine.bindings[event.keyCode];
        if (action) {
            gInputEngine.actions[action] = false;
            const listeners = gInputEngine.listeners[action];
            if (listeners) {
                for (let i = 0; i < listeners.length; i++) {
                    const listener = listeners[i];
                    listener();
                }
            }
            event.preventDefault();
        }
        return false;
    }
    
    bind(key, action) {
      this.bindings[key] = action;
    }
  
    addListener(action, listener) {
      this.listeners[action] = this.listeners[action] || new Array();
      this.listeners[action].push(listener);
    }
  
    removeAllListeners() {
      this.listeners = [];
    }
  }
  
  const gInputEngine = new InputEngine();
  export default gInputEngine;