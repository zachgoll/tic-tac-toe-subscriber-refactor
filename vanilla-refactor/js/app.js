import Store from "./store.js";
import View from "./view.js";

// Our players "config" - defines icons, colors, name, etc.
const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
];

// MVC pattern
function init() {
  // "Model"
  const store = new Store("game-state-key", players);

  // "View"
  const view = new View();

  // "Controller" logic (event listeners + handlers)

  /**
   * Listen for changes to the game state, re-render view when change occurs.
   *
   * The `statechange` event is a custom Event defined in the Store class
   */
  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  /**
   * When 2 players are playing from different browser tabs, listen for changes
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
   */
  window.addEventListener("storage", () => {
    console.log("State changed from another tab");
    view.render(store.game, store.stats);
  });

  // When the HTML document first loads, render the view based on the current state.
  view.render(store.game, store.stats);

  view.bindGameResetEvent((event) => {
    store.reset();
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // Advance to the next state by pushing a move to the moves array
    store.playerMove(+square.id);
  });
}

window.addEventListener("load", init);
