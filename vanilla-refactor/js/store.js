/**
 * This is the default state we load the page with
 *
 * NOTE: Our UI makes the assumption that there are only 2 possible
 * players, and therefore, I have made this same assumption here.  This
 * would need a refactor if additional players were added.
 */
const defaultPlayer1 = {
  id: 1,
  name: "Player 1",
};

const defaultPlayer2 = {
  id: 2,
  name: "Player 2",
};

const defaultState = {
  active: {
    player1: defaultPlayer1,
    player2: defaultPlayer2,
    moves: [],
  },
  round: [],
  history: [],
};

export default class Store {
  constructor(key) {
    this.storageKey = key;

    this.#saveState();

    /**
     * Detects changes in local storage from DIFFERENT browser tabs (not the current one)
     *
     * This is necessary so that if two players are playing in different tabs, they always see
     * the latest version of game state.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
     */
    window.addEventListener("storage", () => {
      console.info(
        "State changed from another window.  Updating UI with latest state."
      );
      this.#saveState();
    });
  }

  getCurrentState() {
    const state = this.#getState();

    const results = state.round.map(this.getWinner);

    const player1Wins = results.filter(
      (winnerId) => winnerId === defaultPlayer1.id
    ).length;
    const player2Wins = results.filter(
      (winnerId) => winnerId === defaultPlayer2.id
    ).length;
    const ties = results.length - player1Wins - player2Wins;

    let currentPlayerId = defaultPlayer1.id;
    if (state.active.moves.length) {
      currentPlayerId = state.active.moves.at(-1).playerId === 1 ? 2 : 1;
    }

    const winnerId = this.getWinner(state.active);

    return {
      status: {
        isComplete: state.active.moves.length === 9 || winnerId != null,
        moves: state.active.moves,
        currentPlayerId,
        winnerId,
      },
      stats: {
        totalGames: results.length,
        ties,
        player1Wins,
        player2Wins,
      },
    };
  }

  getWinner(game) {
    const player1Moves = game.moves
      .filter((m) => m.playerId === defaultPlayer1.id)
      .map((m) => +m.squareId);

    const player2Moves = game.moves
      .filter((m) => m.playerId === defaultPlayer2.id)
      .map((m) => +m.squareId);

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winnerId = null;

    winningPatterns.forEach((pattern) => {
      const player1Wins = pattern.every((v) => player1Moves.includes(v));
      const player2Wins = pattern.every((v) => player2Moves.includes(v));

      if (player1Wins) winnerId = 1;
      if (player2Wins) winnerId = 2;
    });

    return winnerId;
  }

  move(squareId, playerId) {
    // Make a copy of prev state, mutate the copy, set as new state
    const newState = structuredClone(this.#getState());
    newState.active.moves.push({
      playerId,
      squareId,
    });
    this.#saveState(newState);
  }

  endGame() {
    const newState = structuredClone(this.#getState());

    // Save the game to the current round
    newState.round.push(newState.active);

    // Reset active game
    newState.active = defaultState.active;

    this.#saveState(newState);
  }

  // Resets the scoreboard, moves all prior games to the history object
  reset() {
    const newState = structuredClone(this.#getState());

    newState.active = defaultState.active;
    newState.history = [...newState.history, ...newState.round];
    newState.round = [];

    this.#saveState(newState);
  }

  /**
   * Saves the game state.
   *
   * Private method - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields
   *
   * If no state provided, saves the current state, which
   * is useful when the state changes in another browser tab.
   */
  #saveState(gameState) {
    const currentState = gameState ?? this.#getState();

    window.localStorage.setItem(this.storageKey, JSON.stringify(currentState));
  }

  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : defaultState;
  }
}
