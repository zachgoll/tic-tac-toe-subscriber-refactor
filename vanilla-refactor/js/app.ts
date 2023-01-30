import type { Player } from "./types.js";
import Store from "./store.js";
import View from "./view.js";

const players: Player[] = [
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

// MV* pattern
function init() {
  // "Model"
  const store = new Store("game-state-key", players);

  // "View"
  const view = new View();

  /**
   * "Controller" logic (event listeners + handlers)
   */
  view.bindPlayerMoveEvent((squareId) => {
    // Check for an existing move at this square.  Don't complete turn if there is one.
    const existingMove = store.game.moves.find(
      (move) => move.squareId === squareId
    );
    if (existingMove) return;

    store.playerMove(squareId);
  });

  view.bindGameResetEvent(() => {
    view.closeAll();
    store.reset();
  });

  view.bindNewRoundEvent(() => {
    view.closeAll();
    store.newRound();
  });

  /**
   * -----------------------------------------------------------------------
   * IMPORTANT: This is where we listen for state changes.  When the state
   * changes, we re-render the entire application.
   * -----------------------------------------------------------------------
   */

  /**
   * Listen to the custom statechange event that our Store emits every time it changes
   */
  store.addEventListener("statechange", (event) => {
    view.render(event.target as Store); // event.target is the Store class instance
  });

  /**
   * When 2 players are playing from different browser tabs, listen for changes
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
   */
  window.addEventListener("storage", () => {
    console.info(
      "State changed from another window.  Updating UI with latest state."
    );
    store.refreshStorage();
  });

  // On first load of app, load localStorage to trigger a render
  store.refreshStorage();
}

window.addEventListener("load", () => init());
