const initialState = {
  currentGameMoves: [], // All the player moves for the active game
  history: {
    currentRoundGames: [],
    allGames: [],
  },
};

/**
 * Store is (loosely) the "Model" in the MV* or MVC pattern
 *
 * Think of this as our abstraction on top of an arbitrary data store.
 * In this app, we're using localStorage, but this class should not require
 * much change if we wanted to change our storage location to an in-memory DB,
 * external location, etc. (just change #getState and #saveState methods)
 *
 * This class extends EventTarget so we can emit a `statechange` event when
 * state changes, which the controller can listen for to know when to re-render the view.
 */
export default class Store extends EventTarget {
  constructor(key, players) {
    // Since we're extending EventTarget, need to call super() so we have access to instance methods
    super();

    // Key to use for localStorage state object
    this.storageKey = key;
    this.players = players;
  }

  /** stats() and game() are Convenience "getters"
   *
   * To avoid storing a complex state object that is difficult to mutate, we store a simple one (array of moves)
   * and derive more useful representations of state via these "getters", which can be accessed as properties on
   * the Store instance object.
   *
   * @example
   *
   * ```
   * const store = new Store()
   *
   * // Regular property reference (JS evaluates fn under hood)
   * const game = store.game
   * const stats = store.stats
   * ```
   *
   * @see - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
   */
  get stats() {
    const state = this.#getState();

    return {
      playerWithStats: this.players.map((player) => {
        const wins = state.history.currentRoundGames.filter(
          (game) => game.status.winner?.id === player.id
        ).length;

        return {
          ...player,
          wins,
        };
      }),
      ties: state.history.currentRoundGames.filter(
        (game) => game.status.winner === null
      ).length,
    };
  }

  get game() {
    const state = this.#getState();

    const currentPlayer = this.players[state.currentGameMoves.length % 2];

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

    for (const player of this.players) {
      const selectedSquareIds = state.currentGameMoves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId);

      for (const pattern of winningPatterns) {
        if (pattern.every((v) => selectedSquareIds.includes(v))) {
          winner = player;
        }
      }
    }

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
    /**
     * Never mutate state directly.  Create copy of state, edit the copy,
     * and save copy as new version of state.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
     * @see https://redux.js.org/style-guide/#do-not-mutate-state
     */
    const stateClone = structuredClone(this.#getState());

    stateClone.currentGameMoves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateClone);
  }

  /**
   * Resets the game.
   *
   * If the current game is complete, the game is archived.
   * If the current game is NOT complete, it is deleted.
   */
  reset() {
    const stateClone = structuredClone(this.#getState());

    const { status, moves } = this.game;

    if (status.isComplete) {
      stateClone.history.currentRoundGames.push({
        moves,
        status,
      });
    }

    stateClone.currentGameMoves = [];

    this.#saveState(stateClone);
  }

  /**
   * Resets the scoreboard (wins, losses, and ties)
   */
  newRound() {
    this.reset();

    const stateClone = structuredClone(this.#getState());
    stateClone.history.allGames.push(...stateClone.history.currentRoundGames);
    stateClone.history.currentRoundGames = [];

    this.#saveState(stateClone);
  }

  /**
   * Private state reducer that transitions from the old state to the new state
   * and saves it to localStorage.  Every time state changes, a custom 'statechange'
   * event is emitted.
   *
   * @param {*} stateOrFn can be an object or callback fn
   *
   * We are not using Redux here, but it gives a good overview of some essential concepts to managing state:
   * @see https://redux.js.org/understanding/thinking-in-redux/three-principles#changes-are-made-with-pure-functions
   */
  #saveState(stateOrFn) {
    const prevState = this.#getState();

    let newState;

    switch (typeof stateOrFn) {
      case "function":
        newState = stateOrFn(prevState);
        break;
      case "object":
        newState = stateOrFn;
        break;
      default:
        throw new Error("Invalid argument passed to saveState");
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
    this.dispatchEvent(new Event("statechange"));
  }

  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialState;
  }
}
