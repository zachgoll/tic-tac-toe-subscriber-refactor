// This import is only for jsdoc typings and intellisense
import Store from "./store.js";

export default class View {
  $ = {};
  $$ = {};

  constructor() {
    /**
     * Pre-select all the elements we'll need (for convenience and clarity)
     */

    // Element lists
    this.$$.squares = this.#qsAll(".square");

    // Single elements
    this.$.grid = this.#qs(".grid");
    this.$.resetBtn = this.#qs('[data-id="reset-btn"]');
    this.$.newRoundBtn = this.#qs('[data-id="new-round-btn"]');
    this.$.modal = this.#qs(".modal");
    this.$.modalText = this.#qs("p", this.$.modal);
    this.$.modalNewGame = this.#qs("button", this.$.modal);
    this.$.turnBox = this.#qs('[data-id="turn"]');
    this.$.player1Stats = this.#qs('[data-id="player1-stats"]');
    this.$.ties = this.#qs('[data-id="ties"]');
    this.$.player2Stats = this.#qs('[data-id="player2-stats"]');
    this.$.menuBtn = this.#qs('[data-id="menu-button"]');
    this.$.menuPopover = this.#qs('[data-id="menu-popover"]');

    /**
     * UI-only event listeners
     *
     * These are listeners that do not mutate state and therefore
     * can be contained within View entirely.
     */
    this.$.menuBtn.addEventListener("click", (event) => {
      this.#toggleMenu();
    });
  }

  /**
   * This application follows a declarative rendering methodology
   * and will re-render every time the state changes
   *
   * @param {Store!} store - the store object that contains state getters
   */
  render(store) {
    const { stats, game } = store;

    this.$.player1Stats.textContent = `${stats.p1Wins} wins`;
    this.$.player2Stats.textContent = `${stats.p2Wins} wins`;
    this.$.ties.textContent = stats.ties;

    this.$$.squares.forEach((square) => {
      // Clears existing icons if there are any
      square.replaceChildren();

      const move = game.moves.find((m) => m.squareId === +square.id);

      if (!move?.player) return;

      this.#handlePlayerMove(square, move.player);
    });

    if (game.status.isComplete) {
      this.#openModal(
        game.status.winner ? `${game.status.winner.name} wins!` : "Tie!"
      );
    } else {
      this.closeAll();
      this.#setTurnIndicator(game.currentPlayer);
    }
  }

  closeAll() {
    this.#closeMenu();
    this.#closeModal();
  }

  /**
   * Events that are handled by the "Controller" in app.js
   * ----------------------------------------------------------
   */

  bindGameResetEvent(handler) {
    this.$.resetBtn.addEventListener("click", () => handler());
    this.$.modalNewGame.addEventListener("click", () => handler());
  }

  bindNewRoundEvent(handler) {
    this.$.newRoundBtn.addEventListener("click", (event) =>
      handler(event.target)
    );
  }

  bindPlayerMoveEvent(handler) {
    this.#delegate(this.$.grid, ".square", "click", (el) => {
      handler(+el.id);
    });
  }

  /**
   * All methods below ⬇️ are private utility methods used for updating the UI
   * -----------------------------------------------------------------------------
   */

  /**
   * @param {!Element} el
   * @param {!array} classList
   */
  #handlePlayerMove(el, player) {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", player.iconClass, player.colorClass);
    el.replaceChildren(icon);
  }

  #setTurnIndicator(player) {
    const { iconClass, colorClass, name } = player;

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", iconClass, colorClass);

    const label = document.createElement("p");
    label.classList.add(colorClass);
    label.innerText = `${name}, you're up!`;

    this.$.turnBox.replaceChildren(icon, label);
  }

  #openModal(resultText) {
    this.$.modalText.textContent = resultText;
    this.$.modal.classList.remove("hidden");
  }

  #closeModal() {
    this.$.modal.classList.add("hidden");
  }

  #closeMenu() {
    this.$.menuPopover.classList.add("hidden");
    this.$.menuBtn.classList.remove("border");

    const icon = this.#qs("i", this.$.menuBtn);

    icon.classList.add("fa-chevron-down");
    icon.classList.remove("fa-chevron-up");
  }

  #toggleMenu() {
    this.$.menuPopover.classList.toggle("hidden");
    this.$.menuBtn.classList.toggle("border");

    const icon = this.#qs("i", this.$.menuBtn);

    icon.classList.toggle("fa-chevron-down");
    icon.classList.toggle("fa-chevron-up");
  }

  /**
   * The #qs and #qsAll methods are "safe selectors", meaning they
   * _guarantee_ the elements we select exist in the DOM (otherwise throw an error)
   */
  #qs(selector, parent) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);

    if (!el) throw new Error("Could not find element");

    return el;
  }

  #qsAll(selector) {
    const elList = document.querySelectorAll(selector);

    if (!elList) throw new Error("Could not find elements");

    return elList;
  }

  /**
   * Rather than registering event listeners on every child element in our Tic Tac Toe grid, we can
   * listen to the grid container and derive which square was clicked using the matches() function.
   *
   * @param {*} el the "container" element you want to listen for events on
   * @param {*} selector the "child" elements within the "container" you want to handle events for
   * @param {*} eventKey the event type you are listening for (e.g. "click" event)
   * @param {*} handler the callback function that is executed when the specified event is triggered on the specified children
   */
  #delegate(el, selector, eventKey, handler) {
    el.addEventListener(eventKey, (event) => {
      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }
}
