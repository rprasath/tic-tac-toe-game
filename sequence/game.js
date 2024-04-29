document.addEventListener("DOMContentLoaded", () => {
    const deck = new Deck();
    deck.shuffle();

    const gameBoard = document.getElementById("game-board");
    const playerHand = document.getElementById("player-hand");
    const boardSize = 10;
    const board = createGameBoard(gameBoard, boardSize, getBoardLayout());

    let currentPlayer = 0;
    let jackMode = {
        action: null,
        playerDeckIndex: null
    };

    const players = [
        { hand: [], chipColor: "blue" },
        { hand: [], chipColor: "red" },
    ];

    function startGame() {
        for (let i = 0; i < 6; i++) {
            players.forEach(player => player.hand.push(deck.dealOne()));
        }

        currentPlayer = 0;

        drawPlayerHand(playerHand, players[currentPlayer].hand);
        updatePlayerInfo();
    }

    function updatePlayerInfo() {
        const playerInfo = document.querySelector(".player-info h2");
        playerInfo.textContent = `Player ${currentPlayer + 1}`;
        playerInfo.style.color = players[currentPlayer].chipColor;
    }

    function resetJackMode() {
        jackMode = {
            action: null,
            playerDeckIndex: null
        };
    }

    function nextTurn() {
        currentPlayer = (currentPlayer + 1) % players.length;
        resetJackMode();

        //llmComputerMove(players, board);
        computerMove(players, board);

        currentPlayer = (currentPlayer + 1) % players.length;
        updatePlayerInfo();
        resetJackMode();
        if (players[currentPlayer].hand.length < 6) {
            players[currentPlayer].hand.push(deck.dealOne());
        }
        drawPlayerHand(playerHand, players[currentPlayer].hand);
    }

    function placeChip(cell, color) {
        if (!cell.hasChip) {
            const chip = document.createElement("div");
            chip.classList.add("chip", `chip-${color}`); // Add chip class and color-specific class
            cell.appendChild(chip);
            cell.hasChip = true;
            cell.chipColor = color;
        }
    }

    function removeChip(cell) {
        if (cell.hasChip) {
            const chip = cell.querySelector(".chip");
            if (chip) {
                cell.removeChild(chip);
                cell.hasChip = false;
                cell.chipColor = null;
            }
        }
    }

    function checkWin(player, board) {
        const boardSize = 10;
        const chipsToWin = 5; // Assuming this is the required number of chips for a win
        const directions = [
            [0, 1], // Horizontal
            [1, 0], // Vertical
            [1, 1], // Diagonal (down-right)
            [1, -1], // Diagonal (down-left)
        ];

        const chipColor = player.chipColor; // Current player's chip color

        // Loop through each cell in the game board
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = board[row][col];

                // If the cell has a chip of the current player's color
                if (cell.hasChip && cell.querySelector(`.chip-${chipColor}`)) {
                    // Check each direction to count the sequence of chips
                    for (const [dx, dy] of directions) {
                        let sequenceCount = 1; // Include the starting cell

                        for (let step = 1; step < chipsToWin; step++) {
                            const newRow = row + dx * step;
                            const newCol = col + dy * step;

                            // Ensure the new position is within the board's bounds
                            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                                const nextCell = board[newRow][newCol];

                                // Check if the adjacent cell has a chip of the same color
                                if (nextCell.hasChip && nextCell.querySelector(`.chip-${chipColor}`)) {
                                    sequenceCount++;
                                } else {
                                    break; // Break if the sequence is interrupted
                                }
                            } else {
                                break; // Out of board bounds
                            }
                        }

                        // If the required sequence count is met, return true for a win
                        if (sequenceCount >= chipsToWin) {
                            return true;
                        }
                    }
                }
            }
        }

        return false; // No winning sequence found
    }

    function computerMove(players, board) {
        
        const boardSize = 10;
        const computerPlayer = players[1]; // Assuming the computer is player 2 (index 1)
        const player = players[0]; // Human player
        const directions = [
            [0, 1], // Horizontal
            [1, 0], // Vertical
            [1, 1], // Diagonal (down-right)
            [1, -1], // Diagonal (down-left)
        ];

        // Function to find sequences on the board
        function findSequences(chipColor) {
            const sequences = [];
            for (let row = 0; row < boardSize; row++) {
                for (let col = 0; col < boardSize; col++) {
                    const cell = board[row][col];
                    if (cell.hasChip && cell.querySelector(`.chip-${chipColor}`)) {
                        directions.forEach(([dx, dy]) => {
                            let sequence = [cell]; // Store the current sequence
                            for (let step = 1; step < boardSize; step++) {
                                const newRow = row + dx * step;
                                const newCol = col + dy * step;

                                if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                                    const nextCell = board[newRow][newCol];
                                    if (nextCell.hasChip && nextCell.querySelector(`.chip-${chipColor}`)) {
                                        sequence.push(nextCell);
                                    } else {
                                        break;
                                    }
                                } else {
                                    break;
                                }
                            }
                            if (sequence.length >= 2) {
                                sequences.push(sequence); // Only consider sequences with at least 2 chips
                            }
                        });
                    }
                }
            }
            return sequences;
        }

        const computerSequences = findSequences(computerPlayer.chipColor);
        const playerSequences = findSequences(player.chipColor);

        // 1. Check for a winning move (complete a sequence of 5)
        for (const card of computerPlayer.hand) {
            const cell = board.flat().find(c => c.deckCard.suit === card.suit && c.deckCard.rank === card.rank);
            if (cell && !cell.hasChip) {
                placeChip(cell, computerPlayer.chipColor);
                if (checkWin(computerPlayer, board)) {
                    alert(`Player ${currentPlayer + 1} wins!`);
                    return true; // Winning move
                }
                removeChip(cell); // Undo if not winning
            }
        }

        // 2. Block opponent's winning move
        for (const card of computerPlayer.hand) {
            const cell = board.flat().find(c => c.deckCard.suit === card.suit && c.deckCard.rank === card.rank);
            if (cell && !cell.hasChip) {
                placeChip(cell, player.chipColor); // Place as if player did
                if (checkWin(player, board)) {
                    placeChip(cell, computerPlayer.chipColor); // If it would win for player, block it
                    updateHand(computerPlayer, computerPlayer.hand.findIndex(c => c.suit === card.suit && c.rank === card.rank), false);
                    return false;
                }
                removeChip(cell); // Undo if not a win
            }
        }

        // 3. Use a Jack to remove a critical chip (Spades/Hearts)
        const jackRemovalIndex = computerPlayer.hand.findIndex(
            (card) => card.rank === "J" && (card.suit === "Spades" || card.suit === "Hearts")
        );

        if (jackRemovalIndex !== -1) {
            // Find a critical chip to remove
            const opponentSequence = playerSequences.sort((a, b) => b.length - a.length)[0];
            if (opponentSequence && opponentSequence.length >= 2) {
                const cellToRemove = opponentSequence[Math.floor(Math.random() * opponentSequence.length)]; // Remove a random chip from sequence
                if (cellToRemove.hasChip) {
                    removeChip(cellToRemove);
                    updateHand(computerPlayer, jackRemovalIndex, false);
                    return false; // Indicates a move was made, continue with next turn
                }
            }
        }

        // 4. Use a Jack to place anywhere (Clubs/Diamonds)
        const jackPlacementIndex = computerPlayer.hand.findIndex(
            (card) => card.rank === "J" && (card.suit === "Clubs" || card.suit === "Diamonds")
        );

        if (jackPlacementIndex !== -1) {
            // Try to complete or extend a sequence
            const openCells = board.flat().filter((c) => !c.hasChip);
            if (openCells.length > 0) {
                // Check for strategic placement to extend or complete a sequence
                const optimalCell = findOptimalPlacement(computerSequences, openCells, computerPlayer.chipColor);

                if (optimalCell) {
                    placeChip(optimalCell, computerPlayer.chipColor);
                    updateHand(computerPlayer, jackPlacementIndex, false);
                    return false; // Move made
                }
            }
        }

        // 5. Default move: find a random valid cell from the hand and place chip
        const validCardIndices = computerPlayer.hand.map((card, index) => {
            const cell = board.flat().find(c => c.deckCard.suit === card.suit && c.deckCard.rank === card.rank);
            if (cell && !cell.hasChip) return index;
            return -1;
        }).filter(index => index >= 0);

        if (validCardIndices.length > 0) {
            const randomCardIndex = validCardIndices[Math.floor(Math.random() * validCardIndices.length)];
            const randomCard = computerPlayer.hand[randomCardIndex];
            const randomCell = board.flat().find(
                (c) => c.deckCard.suit === randomCard.suit && c.deckCard.rank === randomCard.rank
            );
            if (randomCell && !randomCell.hasChip) {
                placeChip(randomCell, computerPlayer.chipColor);
                updateHand(computerPlayer, randomCardIndex, false);
            }
        }

        return false; // Move completed, but not a winning move
    }

    // Helper function to find optimal placement for a given set of sequences
    function findOptimalPlacement(sequences, openCells, chipColor) {
        // Find a cell that extends or completes a sequence
        for (const sequence of sequences) {
            for (const direction of directions) {
                const lastCell = sequence[sequence.length - 1];
                const [dx, dy] = direction;

                const newRow = lastCell.dataset.row + dx;
                const newCol = lastCell.dataset.col + dy;

                if (
                    newRow >= 0 &&
                    newRow < 10 &&
                    newCol >= 0 &&
                    newCol < 10 &&
                    !board[newRow][newCol].hasChip
                ) {
                    return board[newRow][newCol]; // Return the first optimal cell found
                }
            }
        }

        // Otherwise, return a random open cell
        return openCells[Math.floor(Math.random() * openCells.length)];
    }

    function updateHand(player, currentIndex, checkWinnerAndNextTurn = true) {
        player.hand.splice(currentIndex, 1);
        player.hand.push(deck.dealOne());

        if (checkWinnerAndNextTurn) {
            if (checkWin(player, board)) {
                alert(`Player ${currentPlayer + 1} wins!`);
                return;
            }
            nextTurn();
        }
    }

    // Event listener for clicking on the game board
    gameBoard.addEventListener("click", (e) => {
        const cell = e.target.closest(".cell");
        if (!cell) return; // Ignore clicks if not on a cell

        const player = players[currentPlayer];
        if (jackMode.action) {
            // Handling Jack of Spades/Hearts (removal) and Clubs/Diamonds (placement)
            if (jackMode.action === "remove") {
                if (!cell.hasChip) return; // Ignore clicks on cells without chips

                removeChip(cell);
                updateHand(player, jackMode.playerDeckIndex);
            } else if (jackMode.action === "place") {
                if (cell.hasChip) return; // Ignore clicks on cells with chips

                placeChip(cell, player.chipColor);
                updateHand(player, jackMode.playerDeckIndex);
            }
            return;
        }

        if (cell.hasChip) return; // Ignore clicks on cells with chips

        const cardToFind = cell.deckCard;
        const cardIndex = player.hand.findIndex(card => card.suit === cardToFind.suit && card.rank === cardToFind.rank);
        if (cardIndex !== -1) { // Card found in player's hand
            placeChip(cell, player.chipColor);
            updateHand(player, cardIndex);
        }
    });

    playerHand.addEventListener("click", (e) => {
        const cardElement = e.target.closest(".cell");
        if (!cardElement) return;

        const card = cardElement.deckCard;
        const cardIndex = players[currentPlayer].hand.findIndex(
            (c) => c.suit === card.suit && c.rank === card.rank
        );

        if (card.rank === "J") {

            //if already selected, unselect
            if (cardElement.classList.contains("selected")) {
                cardElement.classList.remove("selected");
                resetJackMode();
                return;
            }

            // Determine the type of Jack
            const isSpadesOrHearts = card.suit === "Spades" || card.suit === "Hearts";
            const isClubsOrDiamonds = card.suit === "Clubs" || card.suit === "Diamonds";

            if (isSpadesOrHearts) {
                jackMode.action = "remove"; // Jack for removal
                jackMode.playerDeckIndex = cardIndex;
            } else if (isClubsOrDiamonds) {
                jackMode.action = "place"; // Jack for placement
                jackMode.playerDeckIndex = cardIndex;
            }

            cardElement.classList.add("selected");
        }
        else {
            resetJackMode();
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
                cell.hasChip = false;
                cell.chipColor = null;

                container.appendChild(cell);
                row.push(cell);
            }
            board.push(row);
        }
        return board;
    }

    function drawPlayerHand(container, hand) {
        container.innerHTML = "";
        hand.forEach((card) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            const img = document.createElement("img");
            img.src = card.getImageFilePath();
            img.alt = card.getImageRankFromRank() + " of " + card.getSuit().toLowerCase();
            cell.appendChild(img);

            cell.deckCard = card;

            container.appendChild(cell);
        });
    }

    startGame();
});