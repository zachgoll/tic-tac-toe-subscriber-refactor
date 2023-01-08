import { AppConfig, GameState, Move, Player } from "./types";

const config: AppConfig = {
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

function getWinner(moves: Move[]): Player | null {
  const p1Moves = moves
    .filter((move) => move.player.id === config.player1.id)
    .map((move) => +move.squareId);

  const p2Moves = moves
    .filter((move) => move.player.id === config.player2.id)
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

    if (p1Wins) winner = config.player1;
    if (p2Wins) winner = config.player2;
  });

  return winner;
}

export function deriveStats(state: GameState) {
  return state.history.currentRoundGames.reduce(
    (prev, curr) => {
      return {
        p1Wins:
          prev.p1Wins + (curr.status.winner?.id === config.player1.id ? 1 : 0),
        p2Wins:
          prev.p2Wins + (curr.status.winner?.id === config.player2.id ? 1 : 0),
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

export function deriveGame(state: GameState) {
  /**
   * Player 1 always starts game.  If no moves yet, it is P1's turn.
   *
   * Otherwise, check who played last to determine who's turn it is.
   */
  let currentPlayer = config.player1;
  if (state.currentGameMoves.length) {
    const lastPlayer = state.currentGameMoves.at(-1)?.player;

    if (!lastPlayer) throw new Error("No player found");

    currentPlayer =
      lastPlayer?.id === config.player1.id ? config.player2 : config.player1;
  }

  const winner = getWinner(state.currentGameMoves);

  return {
    moves: state.currentGameMoves,
    currentPlayer,
    status: {
      isComplete: winner != null || state.currentGameMoves.length === 9,
      winner,
    },
  };
}
