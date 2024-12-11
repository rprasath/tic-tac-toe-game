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

      if (board.every((cell) => cell === "")) {
        bestMove = getRandomMove();
      } else {
        switch (difficultySelect.value) {
          case "easy":
            bestMove = getRandomMove();
            break;
          case "medium":
            bestMove = getMediumMove();
            break;
          case "hard":
            bestMove = getBestMove(board, "O");
            break;
        }
      }

      board[bestMove] = "O";
      cells[bestMove].textContent = "O";
      checkForWinner();

      if (!gameOver) {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
      }
    }

    function getRandomMove() {
      let availableMoves = [];
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          availableMoves.push(i);
        }
      }
      return availableMoves[
        Math.floor(Math.random() * availableMoves.length)
      ];
    }

    function getMediumMove() {

      let random = Math.floor(Math.random() * 10);
      if(random < 9) {
        return getRandomMove();
      }

      // Try to win, then block, then random
      let move = getBestMove(board, "O");
      if (move === null) {
        move = getBestMove(board, "X");
      }
      if (move === null) {
        move = getRandomMove();
      }
      return move;
    }

    function getBestMove(board, player) {
      let bestScore = -Infinity;
      let bestMove = null;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = player;
          let score = minimax(board, 0, false);
          board[i] = "";
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      return bestMove;
    }

    function minimax(board, depth, isMaximizing) {
      let result = checkWinner(board);
      if (result !== null) {
        return result === "X" ? -1 : result === "O" ? 1 : 0;
      }

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, depth + 1, false);
            board[i] = "";
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === "") {
            board[i] = "X";
            let score = minimax(board, depth + 1, true);
            board[i] = "";
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
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

    function checkWinner(board) {
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
          return board[a];
        }
      }

      if (!board.includes("")) {
        return "draw";
      }

      return null;
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