import Controller from "./controller.js";
import Store from "./store.js";
import View from "./view.js";

const store = new Store("game-state-key");
const view = new View();
const controller = new Controller(store, view);

controller.init();
