document.addEventListener("DOMContentLoaded", () => {
    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let gameOver = false;
    let scores = {
      X: 0,
      O: 0,
      draws: 0,
    };

    // DOM Elements
    const cells = document.querySelectorAll(".cell");
    const resetButton = document.querySelector(".reset-button");
    const difficultySelect = document.getElementById("difficulty");
    const messageBanner = document.querySelector(".message-banner");
    const xWinsSpan = document.getElementById("x-wins");
    const oWinsSpan = document.getElementById("o-wins");
    const drawsSpan = document.getElementById("draws");

    // Event Listeners
    cells.forEach((cell) => cell.addEventListener("click", handleClick));
    resetButton.addEventListener("click", resetGame);
    difficultySelect.addEventListener("change", () => {
      resetGame();
    });

    // Game Logic Functions
    function handleClick(e) {
      const cell = e.target;
      const index = cell.dataset.index;

      if (board[index] !== "" || gameOver) return;

      board[index] = currentPlayer;
      cell.textContent = currentPlayer;

      checkForWinner();

      if (!gameOver) {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        computerMove();
      }
    }

    async function computerMove() {
      let bestMove;

      var resp = await fetch('http://localhost:5103/tictactoe/nextMove', {
          method: 'POST',
          headers: {  
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(board),
      });

      var data = await resp.json();

      bestMove = data.move.index;

      board[bestMove] = "O";
      cells[bestMove].textContent = "O";
      checkForWinner();

      if (!gameOver) {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
      }
    }

    function checkForWinner() {
      const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

      for (const combination of winningCombinations) {
        const [a, b, c] = combination;

        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          gameOver = true;
          displayWinner(board[a]);
          return;
        }
      }

      if (!board.includes("")) {
        gameOver = true;
        displayWinner("draw");
      }
    }

    function displayWinner(winner) {
      let message;

      if (winner === "draw") {
        message = "It's a Draw!";
        scores.draws++;
      } else {
        message = `${winner} Wins!`;
        scores[winner]++;
      }

      messageBanner.textContent = message;
      messageBanner.style.display = "block";

      updateScoreBoard();

      //setTimeout(resetGame, 10000);
    }

    function resetGame() {
      board = ["", "", "", "", "", "", "", "", ""];
      currentPlayer = "O";
      gameOver = false;
      cells.forEach((cell) => (cell.textContent = ""));
      messageBanner.style.display = "none";
      currentPlayer = "X";
    }

    function updateScoreBoard() {
      xWinsSpan.textContent = scores.X;
      oWinsSpan.textContent = scores.O;
      drawsSpan.textContent = scores.draws;
    }
});