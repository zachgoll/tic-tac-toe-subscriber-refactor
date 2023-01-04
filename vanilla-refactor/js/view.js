export default class View {
  constructor() {
    // The $ prefix contains all of our selected HTML elements
    this.$grid = document.querySelector(".grid");
    this.$options = document.querySelectorAll(".option");
    this.$resetBtn = document.querySelector(".control-3");
    this.$modal = document.querySelector(".modal");
    this.$modalText = this.$modal.querySelector("p");
    this.$modalNewGame = this.$modal.querySelector("button");
    this.$turnBox = document.querySelector(".control-2");
    this.$player1Stats = document.querySelector('[data-id="player1-stats"]');
    this.$ties = document.querySelector('[data-id="ties"]');
    this.$player2Stats = document.querySelector('[data-id="player2-stats"]');
  }

  renderView(currentState) {
    const {
      stats: { player1Wins, player2Wins, ties },
      status: { moves },
    } = currentState;

    this.$player1Stats.textContent = `${player1Wins}W ${player2Wins}L`;
    this.$player2Stats.textContent = `${player2Wins}W ${player1Wins}L`;
    this.$ties.textContent = ties;

    // If current game doesn't have moves, make sure player 1 is up
    if (!moves.length) {
      this.setTurnIndicator(1);
    }

    this.$options.forEach((option) => {
      // Clears existing icons if there are any
      option.replaceChildren();

      const move = moves.find((m) => m.squareId === option.id);

      if (!move?.playerId) return;

      this.handlePlayerMove(option, move.playerId);
    });
  }

  /**
   * @param {!Element} el
   * @param {!number} currentPlayerId
   */
  handlePlayerMove(el, currentPlayerId) {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid");

    // Different icon depending on who made the play
    if (currentPlayerId === 1) {
      icon.classList.add("fa-x", "turquoise");
    } else {
      icon.classList.add("fa-o", "yellow");
    }

    el.replaceChildren(icon);

    const nextPlayerId = currentPlayerId === 1 ? 2 : 1;

    this.setTurnIndicator(nextPlayerId);
  }

  openModal(resultText) {
    this.$modalText.textContent = resultText;
    this.$modal.classList.remove("hidden");
  }

  closeModal() {
    this.$modal.classList.add("hidden");
  }

  setTurnIndicator(playerId) {
    // Clear existing content
    this.$turnBox.replaceChildren();

    if (playerId === 1) {
      this.$turnBox.insertAdjacentHTML(
        "afterbegin",
        `
      <div>
        <p class="turquoise">Player 1</p>
        <p>You're up!</p>
      </div>
      <i class="fa-solid fa-x turquoise circle-icon"></i>
    `
      );
    } else {
      this.$turnBox.insertAdjacentHTML(
        "afterbegin",
        `
      <div>
        <p class="yellow">Player 2</p>
        <p>You're up!</p>
      </div>
      <i class="fa-solid fa-o yellow circle-icon"></i>
    `
      );
    }
  }

  bindPlayerMoveEvent(handler) {
    this.#delegate(this.$grid, ".option", "click", (event) => {
      handler(event.target);
    });
  }

  bindModalCloseEvent(handler) {
    this.$modalNewGame.addEventListener("click", (event) =>
      handler(event.target)
    );
  }

  bindResetEvent(handler) {
    this.$resetBtn.addEventListener("click", (event) => handler(event.target));
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
        handler(event, el);
      }
    });
  }
}
