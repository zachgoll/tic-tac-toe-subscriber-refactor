// These imports are only used for typings to enable editor autocomplete
import Store from "./store.js";
import View from "./view.js";

export default class Controller {
  /**
   * Controller is responsible for orchestrating UI and state changes
   * based on user events
   *
   * @param {!Store} store
   * @param {!View} view
   */
  constructor(store, view) {
    this.store = store;
    this.view = view;

    /**
     * The following lines will "register" all our element event handlers
     * where the View class is responsible for adding the event listeners, but
     * will pass the event (or some form of it) to the corresponding Controller
     * method in this class bound to the Controller `this` context.
     */
    view.bindPlayerMoveEvent(this.handlePlayerMoveEvent.bind(this));
    view.bindModalCloseEvent(this.handleCloseModal.bind(this));
    view.bindResetEvent(this.reset.bind(this));
  }

  init() {
    this.view.renderView(this.store.getCurrentState());
  }

  handlePlayerMoveEvent(el) {
    const start = this.store.getCurrentState();
    this.store.move(el.id, start.status.currentPlayerId);
    this.view.handlePlayerMove(el, start.status.currentPlayerId);

    // Recalculate game state after move was made
    const end = this.store.getCurrentState();

    if (end.status.isComplete) {
      this.handleGameEnd(end.status.winnerId);
    }
  }

  /**
   *
   * @param {(number | null)} winnerId
   */
  handleGameEnd(winnerId) {
    this.view.openModal(
      winnerId === 1
        ? "Player 1 wins!"
        : winnerId === 2
        ? "Player 2 wins!"
        : "Tie!"
    );

    this.store.endGame();
  }

  handleCloseModal() {
    this.view.closeModal();
    this.view.renderView(this.store.getCurrentState());
  }

  reset() {
    this.store.reset();
    this.view.renderView(this.store.getCurrentState());
  }
}
