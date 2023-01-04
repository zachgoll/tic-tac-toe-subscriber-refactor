//randomly assign roles on pageload?
let playerOneChoices = [];
let playerTwoChoices = [];
let playerOneScore = 0;
let playerTwoScore = 0;
let tieScore = 0;
let clickCounter = 0;
let valueArray = [];
const boxes = document.querySelectorAll(".box");
const h3 = document.getElementById("colorChange");
const refresh = document.querySelector(".btn-refresh");
const winnerDeclaration = document.getElementById("winner-declaration");
const winnerText = document.getElementById("winner-text");
const playerOnePlaceholder = document.getElementById("player-one-score");
const playerTwoPlaceholder = document.getElementById("player-two-score");
const tiePlaceholder = document.getElementById("tie-score");
const restartBtn = document.getElementById("restart-after-win");
const clearScore = document.getElementById("clear-score");

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

//add click event to each box
boxes.forEach((box) => {
  box.addEventListener(
    "click",
    (e) => {
      const turn = document.getElementById("turn");
      let target = e.target;
      console.log(target.id);
      valueArray.push(Number(target.id));
      if (clickCounter % 2 === 0) {
        target.innerText = "X";
        turn.classList.remove("fa-x");
        turn.classList.add("fa-o");
        playerOneChoices.push(Number(target.id));
        h3.style.color = "#F2B147";
        target.style.color = "#3CC4BF";
      } else {
        target.innerText = "O";
        turn.classList.remove("fa-o");
        turn.classList.add("fa-x");
        playerTwoChoices.push(Number(target.id));
        h3.style.color = "#3CC4BF";
        target.style.color = "#F2B147";
      }
      clickCounter++;
      if (playerOneChoices.length >= 3 || playerTwoChoices.length >= 3) {
        if (checkForWinner(playerOneChoices)) {
          winnerDeclaration.classList.toggle("show-winner");
          winnerText.innerText = "The winner is player one!";
          winnerText.style.color = "#F2B147";
          //playerOneScore++
          addPlayerOneScore();
          // line below shows us the score increment before refreshing
          playerOnePlaceholder.innerText = sessionStorage.getItem("p1Score");
        } else if (checkForWinner(playerTwoChoices)) {
          winnerDeclaration.classList.toggle("show-winner");
          winnerText.innerText = "The winner is player two!";
          winnerText.style.color = "#3CC4BF";
          addPlayerTwoScore();
          playerTwoPlaceholder.innerText = playerTwoScore;
        } else if (clickCounter === 9) {
          winnerDeclaration.classList.toggle("show-winner");
          winnerText.innerText = `It's a tie :( `;
          addTieScore();
          tiePlaceholder.innerText = tieScore;
          winnerText.style.color = "lightgrey";
        }
      }
    },
    { once: true }
  );
});

//keep track of score, testing innerText
if (!sessionStorage.getItem("p1Score")) {
  sessionStorage.setItem("p1Score", 0);
}

if (!sessionStorage.getItem("p2Score")) {
  sessionStorage.setItem("p2Score", 0);
}

if (!sessionStorage.getItem("tieScore")) {
  sessionStorage.setItem("tieScore", 0);
}

playerOnePlaceholder.innerText = sessionStorage.getItem("p1Score");
playerTwoPlaceholder.innerText = sessionStorage.getItem("p2Score");
tiePlaceholder.innerText = sessionStorage.getItem("tieScore");

function addPlayerOneScore() {
  playerOneScore = Number(sessionStorage.getItem("p1Score"));
  playerOneScore++;
  sessionStorage.setItem("p1Score", playerOneScore);
}

function addTieScore() {
  tieScore = Number(sessionStorage.getItem("tieScore"));
  tieScore++;
  sessionStorage.setItem("tieScore", tieScore);
}

function addPlayerTwoScore() {
  playerTwoScore = Number(sessionStorage.getItem("p2Score"));
  playerTwoScore++;
  sessionStorage.setItem("p2Score", playerTwoScore);
}

//end of sesh

restartBtn.addEventListener("click", restartAndClear);

function restartAndClear() {
  window.location.reload();
}

function checkForWinner(arr) {
  return winningPatterns.some((combinations) => {
    return combinations.every((element) => {
      //[5, 2, 8] indecombinations //[1, 3, 5]
      return arr.includes(element);
    });
  });
}

clearScore.addEventListener("click", () => {
  console.log("smth");
  sessionStorage.clear();
  playerOnePlaceholder.innerText = 0;
  playerTwoPlaceholder.innerText = 0;
  tiePlaceholder.innerText = 0;
  console.log(playerOneScore);
  console.log(playerTwoScore);
  console.log(tieScore);
});
