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

        llmComputerMove(players, board);
        //computerMove(players, board);

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

    async function llmComputerMove(players, board) {
        let computerPlayer = players[1];

        let currentBoardState = board.map((e, idx) => {
            return e.map((f, idx2) => {
                return {
                    row: idx,
                    column: idx2,
                    hasChip: f.hasChip,
                    chipColor: f.chipColor,
                    suit: f.deckCard.suit,
                    rank: f.deckCard.rank
                };
            });
        });

        let computerHand = computerPlayer.hand.map((e, index) => {
            return {
                index: index,
                suit: e.suit,
                rank: e.rank
            };
        });

        //Build LLM context object to make http request
        var requestBody = {
            "model": "llama3.2:latest",
            "prompt": `We are playing a game of Sequence. It is your turn. You are the red player. 
            
            You have to play a card from your hand to the board. You can only play a card if it is in your hand. Please provide the index of the card in your hand that you want to play, the row and column of the cell on the board where you want to play the card, and whether you want to place or remove the card.

            You have the following cards in hand: ${JSON.stringify(computerHand)}. 
            
            The board state shows the current state of the board. Each cell on the board has a card. If the hasChip field is true, it means that the cell has a chip. If the color of the chip is blue it means that the other player has placed a chip on that cell. If the color of the chip is red it means that the you have placed a chip on that cell.
            You can only place a chip on a cell that does not have a chip. You can only remove a chip from a cell that has a chip.

            The board state is as follows: ${JSON.stringify(currentBoardState)} \r\n'

            The next move response should be in json format. Next move Json response format below.
            {
               boardObjectRow: 0// row field from above Multi-dimensional array index
               boardObjectColumn: 0 // column field from above Multi-dimensional array index
               action: "place" // or "remove"
            }

            ex:
            hand = [{index: 0, suit: "Spades", rank: "3"}, {index: 1, suit: "Hearts", rank: "2"}]
            board = [
                [{row: 0, column: 0, hasChip: false, chipColor: null, suit: "Spades", rank: "2"}, {row: 0, column: 1, hasChip: false, chipColor: null, suit: "Spades", rank: "3"}],
                [{row: 1, column: 0, hasChip: false, chipColor: null, suit: "Hearts", rank: "A"}, {row: 1, column: 1, hasChip: false, chipColor: null, suit: "Hearts", rank: "2"}]
            ]
            response:
            You want to play Hearts 2 from your hand to row 1 column 1 then the response should be

            {
                boardObjectRow: 1
                boardObjectColumn: 1
                action: "place"
            }
        
            
            What is your next move?`,
            "stream": false,
            "format": "json"
        };

        //Make http request to LLM API
        //make fetch request with await and set the chip

        var resp = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        var data = await resp.json();

        var compMove = JSON.parse(data.response);

        if (compMove.action === "place") {

            var cell = board[compMove.boardObjectRow][compMove.boardObjectColumn];
            let handIndex = computerPlayer.hand.findIndex((e) => e.suit === cell.deckCard.suit && e.rank === cell.deckCard.rank);

            placeChip(cell, computerPlayer.chipColor);
            updateHand(computerPlayer, handIndex, false);
        }
        else {
            var cell = board[compMove.boardObjectRow][compMove.boardObjectColumn];
            let handIndex = computerPlayer.hand.findIndex((e) => e.suit === cell.deckCard.suit && e.rank === cell.deckCard.rank);
            
            removeChip(cell);
            updateHand(computerPlayer, handIndex, false);
        }

        console.log("State of the board before move: ", currentBoardState);
        console.log("Computer hand before move: ", computerHand);
        console.log("Move made by computer: ", compMove);
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