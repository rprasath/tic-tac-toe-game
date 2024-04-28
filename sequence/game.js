document.addEventListener("DOMContentLoaded", () => {
    const deck = new Deck();
    deck.shuffle();

    const gameBoard = document.getElementById("game-board");
    const playerHand = document.getElementById("player-hand");
    const boardSize = 10;
    const board = createGameBoard(gameBoard, boardSize, getBoardLayout());

    let currentPlayer = 0;
    const players = [
        { hand: [], chipColor: "blue", sequences: 0 },
        { hand: [], chipColor: "red", sequences: 0 },
    ];
    const chipsToWin = 2;

    function startGame() {
        for (let i = 0; i < 6; i++) {
            players.forEach(player => player.hand.push(deck.deal(1)[0]));
        }
        currentPlayer = 0;
        players.forEach(player => player.sequences = 0);
        drawPlayerHand(playerHand, players[currentPlayer].hand);
        updatePlayerInfo();
    }

    function updatePlayerInfo() {
        const playerInfo = document.querySelector(".player-info h2");
        playerInfo.textContent = `Player ${currentPlayer + 1}`;
        playerInfo.style.color = players[currentPlayer].chipColor;
    }

    function nextTurn() {
        currentPlayer = (currentPlayer + 1) % players.length;
        updatePlayerInfo();
        if (players[currentPlayer].hand.length < 6) {
            players[currentPlayer].hand.push(deck.deal(1)[0]);
            drawPlayerHand(playerHand, players[currentPlayer].hand);
        }
        drawPlayerHand(playerHand, players[currentPlayer].hand);
    }

    function placeChip(cell, color) {
        if (!cell.hasChip) {
            const chip = document.createElement("div");
            chip.classList.add("chip", `chip-${color}`); // Add chip class and color-specific class
            cell.appendChild(chip);
            cell.hasChip = true;
        }
    }

    function checkWin() {
        const chipColor = players[currentPlayer].chipColor;
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = board[row][col];
                if (cell.hasChip && cell.style.backgroundColor === chipColor) {
                    for (const [dx, dy] of directions) {
                        let sequenceCount = 1;
                        for (let i = 1; i < chipsToWin; i++) {
                            const nextRow = row + i * dx;
                            const nextCol = col + i * dy;
                            if (nextRow >= 0 && nextRow < boardSize && nextCol >= 0 && nextCol < boardSize) {
                                const nextCell = board[nextRow][nextCol];
                                if (nextCell.hasChip && nextCell.style.backgroundColor === chipColor) {
                                    sequenceCount++;
                                } else {
                                    break;
                                }
                            } else {
                                break;
                            }
                        }
                        if (sequenceCount === chipsToWin) {
                            players[currentPlayer].sequences++;
                            if (players[currentPlayer].sequences >= chipsToWin) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    // Event listener for clicking on the game board
    gameBoard.addEventListener("click", (e) => {
        const cell = e.target.closest(".cell");
        if (!cell || cell.hasChip) return; // Ignore clicks if not on a cell or if cell has a chip

        const cardToFind = cell.deckCard;

        const cardIndex = players[currentPlayer].hand.findIndex(card => card.suit === cardToFind.suit && card.rank === cardToFind.rank);
        if (cardIndex !== -1) { // Card found in player's hand
            placeChip(cell, players[currentPlayer].chipColor);
            players[currentPlayer].hand.splice(cardIndex, 1);
            players[currentPlayer].hand.push(deck.deal(1)[0]); // Replace the card
            drawPlayerHand(playerHand, players[currentPlayer].hand);
            if (checkWin()) {
                alert(`Player ${currentPlayer + 1} wins!`);
                // ... (handle win scenario) ... 
            } else {
                nextTurn();
            }
        }
    });

    function getBoardLayout() {
        return [
            [new Card("", ""), new Card("Spades", "2"), new Card("Spades", "3"), new Card("Spades", "4"), new Card("Spades", "5"), new Card("Spades", "6"), new Card("Spades", "7"), new Card("Spades", "8"), new Card("Spades", "9"), new Card("", "")],
            [new Card("Clubs", "6"), new Card("Clubs", "5"), new Card("Clubs", "4"), new Card("Clubs", "3"), new Card("Clubs", "2"), new Card("Hearts", "A"), new Card("Hearts", "K"), new Card("Hearts", "Q"), new Card("Hearts", "10"), new Card("Spades", "10")],
            [new Card("Clubs", "7"), new Card("Spades", "A"), new Card("Diamonds", "2"), new Card("Diamonds", "3"), new Card("Diamonds", "4"), new Card("Diamonds", "5"), new Card("Diamonds", "6"), new Card("Diamonds", "7"), new Card("Hearts", "9"), new Card("Spades", "Q")],
            [new Card("Clubs", "8"), new Card("Spades", "K"), new Card("Clubs", "6"), new Card("Clubs", "5"), new Card("Clubs", "4"), new Card("Clubs", "3"), new Card("Clubs", "2"), new Card("Diamonds", "8"), new Card("Hearts", "8"), new Card("Spades", "K")],
            [new Card("Clubs", "9"), new Card("Spades", "Q"), new Card("Clubs", "7"), new Card("Hearts", "6"), new Card("Hearts", "5"), new Card("Hearts", "4"), new Card("Hearts", "A"), new Card("Diamonds", "9"), new Card("Hearts", "7"), new Card("Spades", "A")],
            [new Card("Clubs", "10"), new Card("Spades", "10"), new Card("Clubs", "8"), new Card("Hearts", "7"), new Card("Hearts", "2"), new Card("Hearts", "3"), new Card("Hearts", "K"), new Card("Diamonds", "10"), new Card("Hearts", "6"), new Card("Diamonds", "2")],
            [new Card("Clubs", "Q"), new Card("Spades", "9"), new Card("Clubs", "9"), new Card("Hearts", "8"), new Card("Hearts", "9"), new Card("Hearts", "10"), new Card("Hearts", "Q"), new Card("Diamonds", "Q"), new Card("Hearts", "5"), new Card("Diamonds", "3")],
            [new Card("Clubs", "K"), new Card("Spades", "8"), new Card("Clubs", "10"), new Card("Clubs", "Q"), new Card("Clubs", "K"), new Card("Clubs", "A"), new Card("Diamonds", "A"), new Card("Diamonds", "K"), new Card("Hearts", "4"), new Card("Diamonds", "4")],
            [new Card("Clubs", "A"), new Card("Spades", "7"), new Card("Spades", "6"), new Card("Spades", "5"), new Card("Spades", "4"), new Card("Spades", "3"), new Card("Spades", "2"), new Card("Hearts", "2"), new Card("Hearts", "3"), new Card("Diamonds", "5")],
            [new Card("", ""), new Card("Diamonds", "A"), new Card("Diamonds", "K"), new Card("Diamonds", "Q"), new Card("Diamonds", "10"), new Card("Diamonds", "9"), new Card("Diamonds", "8"), new Card("Diamonds", "7"), new Card("Diamonds", "6"), new Card("", "")],
        ];
    }

    function createGameBoard(container, size, layout) {
        const board = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const card = layout[i][j];

                const cell = document.createElement("div");
                cell.classList.add("cell");

                if (card.getSuit()) {
                    const img = document.createElement("img");
                    img.src = card.getImageFilePath();
                    img.alt = card.getImageRankFromRank() + " of " + card.getSuit().toLowerCase();
                    cell.appendChild(img);
                }

                cell.deckCard = card;
                cell.setAttribute("data-card-suit", card.getSuit());
                cell.setAttribute("data-card-rank", card.getRank());

                container.appendChild(cell);
                cell.hasChip = false;
                row.push(cell);
            }
            board.push(row);
        }
        return board;
    }

    function drawPlayerHand(container, hand) {
        container.innerHTML = "";
        hand.forEach((card) => {
            const cardElement = document.createElement("div");
            cardElement.classList.add("cell");

            const img = document.createElement("img");
            img.src = card.getImageFilePath();
            img.alt = card.getImageRankFromRank() + " of " + card.getSuit().toLowerCase();
            cardElement.appendChild(img);

            cardElement.setAttribute("data-card-suit", card.getSuit());
            cardElement.setAttribute("data-card-rank", card.getRank());
            cardElement.deckCard = card;

            container.appendChild(cardElement);
        });
    }

    startGame();
});