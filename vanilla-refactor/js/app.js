import Store from "./store.js";
import View from "./view.js";

const config = {
  /**
   * A possible improvement to the game would be to allow for 3+ players
   * and a UI to show a leaderboard.  This would require a refactor since
   * our logic assumes there are only 2 possible players.
   */
  player1: {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
  player2: {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
};

// MV* pattern
function init() {
  // "Model"
  const store = new Store("game-state-key");

  // "View"
  const view = new View();

  /**
   * "Controller" logic (event listeners + handlers)
   */
  view.bindPlayerMoveEvent((squareId) => {
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
  store.addEventListener("statechange", (event) => {
    view.render(event.target); // event.target is the Store class instance
  });

  // Loads existing state from local storage
  store.init(config);
}

// On window load, initialize app
window.addEventListener("load", () => init());
