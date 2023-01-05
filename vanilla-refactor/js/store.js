const initialState = {
  currentGameMoves: [], // All the player moves for the active game
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

export default class Store extends EventTarget {
  constructor(key) {
    super();
    this.storageKey = key;

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
      this.#refreshStorage();
    });
  }

  init(config) {
    this.P1 = config.player1;
    this.P2 = config.player2;
    this.#refreshStorage();
  }

  get stats() {
    const state = this.#getState();

    return state.history.currentRoundGames.reduce(
      (prev, curr) => {
        return {
          p1Wins: prev.p1Wins + (curr.status.winner?.id === this.P1.id ? 1 : 0),
          p2Wins: prev.p2Wins + (curr.status.winner?.id === this.P2.id ? 1 : 0),
          ties: prev.ties + (curr.status.winner === null ? 1 : 0),
        };
      },
      {
        p1Wins: 0,
        p2Wins: 0,
        ties: 0,
      }
    );
  }

  get game() {
    const state = this.#getState();

    /**
     * Player 1 always starts game.  If no moves yet, it is P1's turn.
     *
     * Otherwise, check who played last to determine who's turn it is.
     */
    let currentPlayer = this.P1;
    if (state.currentGameMoves.length) {
      const lastPlayer = state.currentGameMoves.at(-1).player;
      currentPlayer = lastPlayer.id === this.P1.id ? this.P2 : this.P1;
    }

    const winner = this.#getWinner(state.currentGameMoves);

    return {
      moves: state.currentGameMoves,
      currentPlayer,
      status: {
        isComplete: winner != null || state.currentGameMoves.length === 9,
        winner,
      },
    };
  }

  playerMove(squareId) {
    const { currentGameMoves } = structuredClone(this.#getState());

    currentGameMoves.push({
      player: this.game.currentPlayer,
      squareId,
    });

    this.#saveState((prev) => ({ ...prev, currentGameMoves }));
  }

  /**
   * Resets the game.
   *
   * If the current game is complete, the game is archived.
   * If the current game is NOT complete, it is deleted.
   */
  reset() {
    const stateCopy = structuredClone(this.#getState());

    // If game is complete, archive it to history object
    if (this.game.status.isComplete) {
      const { moves, status } = this.game;
      stateCopy.history.currentRoundGames.push({ moves, status });
    }

    stateCopy.currentGameMoves = [];
    this.#saveState(stateCopy);
  }

  /**
   * Resets the scoreboard (wins, losses, and ties)
   */
  newRound() {
    this.reset();

    const stateCopy = structuredClone(this.#getState());
    stateCopy.history.allGames.push(...stateCopy.history.currentRoundGames);
    stateCopy.history.currentRoundGames = [];

    this.#saveState(stateCopy);
  }

  #getWinner(moves) {
    const p1Moves = moves
      .filter((move) => move.player.id === this.P1.id)
      .map((move) => +move.squareId);

    const p2Moves = moves
      .filter((move) => move.player.id === this.P2.id)
      .map((move) => +move.squareId);

    // Our grid starts in top-left corner and increments left=>right, top=>bottom
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

    let winner = null;

    winningPatterns.forEach((pattern) => {
      const p1Wins = pattern.every((v) => p1Moves.includes(v));
      const p2Wins = pattern.every((v) => p2Moves.includes(v));

      if (p1Wins) winner = this.P1;
      if (p2Wins) winner = this.P2;
    });

    return winner;
  }

  #refreshStorage() {
    this.#saveState(this.#getState());
  }

  #saveState(stateOrFn) {
    const prevState = this.#getState();

    let newState;

    switch (typeof stateOrFn) {
      // When callback fn is passed, call it with the prior state and derive the new state from it
      case "function":
        newState = stateOrFn(prevState);
        break;

      // When object passed, set it directly
      case "object":
        newState = stateOrFn;
        break;
      default:
        throw new Error("Must pass object or fn to #saveState() method");
    }

    // Update state and emit event
    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
    this.dispatchEvent(new Event("statechange"));
  }

  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialState;
  }
}
