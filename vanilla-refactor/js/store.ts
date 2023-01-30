import type { GameState, Move, Player } from "./types";

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
 */
export default class Store extends EventTarget {
  constructor(
    private readonly storageKey: string,
    private readonly players: Player[]
  ) {
    // Since we're extending EventTarget, need to call super() so we have ability to create custom events
    super();
  }

  get stats() {
    const state = this.#getState();

    return {
      playersWithStats: this.players.map((player) => {
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
    const nextPlayer = this.players[(state.currentGameMoves.length + 1) % 2];

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

    let winner: Player | null = null;

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
      nextPlayer,
      status: {
        isComplete: winner != null || state.currentGameMoves.length === 9,
        winner,
      },
    };
  }

  playerMove(squareId: Move["squareId"]) {
    /**
     * Never mutate state directly.  Create copy of state, edit the copy,
     * and save copy as new version of state.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
     * @see https://redux.js.org/style-guide/#do-not-mutate-state
     */
    const { currentGameMoves } = structuredClone(this.#getState());

    currentGameMoves.push({
      player: this.game.currentPlayer,
      squareId,
    });

    this.#saveState((prev: GameState) => ({ ...prev, currentGameMoves }));
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

  /** When state is changed from another browser tab, state should be refreshed in current tab */
  refreshStorage() {
    this.#saveState(this.#getState());
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
  #saveState(stateOrFn: ((prev: GameState) => GameState) | GameState) {
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

  #getState(): GameState {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialState;
  }
}
