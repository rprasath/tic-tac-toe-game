document.addEventListener("DOMContentLoaded", () => {
    const deck = new Deck();
    deck.shuffle();

    const gameBoard = document.getElementById("game-board");
    const playerHand = document.getElementById("player-hand");
    const discardPile = document.getElementById("discard-pile");

    const boardSize = 10;
    const board = createGameBoard(gameBoard, boardSize, getBoardLayout());

    const player = {
        hand: deck.deal(7),
        chipColor: "blue",
    };

    drawPlayerHand(playerHand, player.hand);

    playerHand.addEventListener("click", (e) => {
        const cardElement = e.target.closest(".card");
        if (!cardElement) return;

        const cardIndex = Array.from(playerHand.children).indexOf(cardElement);
        const card = player.hand[cardIndex];

        // Assuming card.rank and card.suit determine the board position
        const boardCell = getBoardCellForCard(board, card);

        if (boardCell) {
            placeChip(boardCell, player.chipColor);

            // Add card to discard pile
            discardPile.appendChild(cardElement);

            // Remove card from player's hand and draw a new one
            player.hand.splice(cardIndex, 1);
            player.hand.push(deck.deal(1)[0]);

            drawPlayerHand(playerHand, player.hand);
        }
    });
});

function getBoardLayout() {
    return [
        //Create a array of cards.
        //First and last cell for first and last row are empty.
        //Each row has 10 cells.
        //Row1: Spade 2 to spade 9
        [new Card("", ""), new Card("Spades", "2"), new Card("Spades", "3"), new Card("Spades", "4"), new Card("Spades", "5"), new Card("Spades", "6"), new Card("Spades", "7"), new Card("Spades", "8"), new Card("Spades", "9"), new Card("", "")],
        //Row2: 6 Clubs to 2 Clubs then A Hearts to 10 Hearts and finally 10 Spade
        [new Card("Clubs", "6"), new Card("Clubs", "5"), new Card("Clubs", "4"), new Card("Clubs", "3"), new Card("Clubs", "2"), new Card("Hearts", "A"), new Card("Hearts", "K"), new Card("Hearts", "Q"), new Card("Hearts", "10"), new Card("Spades", "10")],
        //Row3: 7 Clubs, A spade, 2 diamonds to 7 diamonds, 9 hearts, Q spade
        [new Card("Clubs", "7"), new Card("Spades", "A"), new Card("Diamonds", "2"), new Card("Diamonds", "3"), new Card("Diamonds", "4"), new Card("Diamonds", "5"), new Card("Diamonds", "6"), new Card("Diamonds", "7"), new Card("Hearts", "9"), new Card("Spades", "Q")],
        //Row4: 8 Clubs, K spade, 6 clubs to 2 clubs, 8 diamonds, 8 hearts, K spade
        [new Card("Clubs", "8"), new Card("Spades", "K"), new Card("Clubs", "6"), new Card("Clubs", "5"), new Card("Clubs", "4"), new Card("Clubs", "3"), new Card("Clubs", "2"), new Card("Diamonds", "8"), new Card("Hearts", "8"), new Card("Spades", "K")],
        //Row5: 9 Clubs, Q spade, 7 clubs, 6 hearts to 4 hears, A hearts, 9 diamonds, 7 hearts, A spade
        [new Card("Clubs", "9"), new Card("Spades", "Q"), new Card("Clubs", "7"), new Card("Clubs", "6"), new Card("Hearts", "5"), new Card("Hearts", "4"), new Card("Hearts", "A"), new Card("Diamonds", "9"), new Card("Hearts", "7"), new Card("Spades", "A")],
        //Row6: 10 Clubs, 10 spade, 8 clubs, 7 hearts, 2 hearts, 3 hearts, k hearts, 10 diamonds, 6 hearts, 2 diamonds
        [new Card("Clubs", "10"), new Card("Spades", "10"), new Card("Clubs", "8"), new Card("Hearts", "7"), new Card("Hearts", "2"), new Card("Hearts", "3"), new Card("Hearts", "K"), new Card("Diamonds", "10"), new Card("Hearts", "6"), new Card("Diamonds", "2")],
        //Row7: Q clubs, 9 Spade, 9 clubs, 8 hearts, 9 hearts, 10 hearts, Q hearts, Q diamond, 5 hearts, 3 diamonds
        [new Card("Clubs", "Q"), new Card("Spades", "9"), new Card("Clubs", "9"), new Card("Hearts", "8"), new Card("Hearts", "9"), new Card("Hearts", "10"), new Card("Hearts", "Q"), new Card("Diamonds", "Q"), new Card("Hearts", "5"), new Card("Diamonds", "3")],
        //Row8: K clubs, 8 spade, 10 clubs, Q clubs, K clubs, A clubs, A diamond, K diamond, 4 hearts, 4 diamonds
        [new Card("Clubs", "K"), new Card("Spades", "8"), new Card("Clubs", "10"), new Card("Clubs", "Q"), new Card("Clubs", "K"), new Card("Clubs", "A"), new Card("Diamonds", "A"), new Card("Diamonds", "K"), new Card("Hearts", "4"), new Card("Diamonds", "4")],
        //Row9: A clubs, 7 spade to 2 spade, 2 heat, 3 hearts, 5 diamond 
        [new Card("Clubs", "A"), new Card("Spades", "7"), new Card("Spades", "6"), new Card("Spades", "5"), new Card("Spades", "4"), new Card("Spades", "3"), new Card("Spades", "2"), new Card("Hearts", "2"), new Card("Hearts", "3"), new Card("Diamonds", "5")],
        //Row10: Empty, diamond A, K, Q, 10, 9, 8, 7 , 6, Empty
        [new Card("", ""), new Card("Diamonds", "A"), new Card("Diamonds", "K"), new Card("Diamonds", "Q"), new Card("Diamonds", "10"), new Card("Diamonds", "9"), new Card("Diamonds", "8"), new Card("Diamonds", "7"), new Card("Diamonds", "6"), new Card("", "")],
    ];
}

function getCardSuitSymbol(suit) {
    switch (suit) {
        case "Hearts":
            return "♥️"; // Unicode symbol for Hearts
        case "Diamonds":
            return "♦️"; // Unicode symbol for Diamonds
        case "Clubs":
            return "♣️"; // Unicode symbol for Clubs
        case "Spades":
            return "♠️"; // Unicode symbol for Spades
        default:
            return "";
    }
}

function getTextColorBasedOnSuit(suit) {
    switch (suit) {
        case "Hearts":
        case "Diamonds":
            return "red"; // Red text for Hearts and Diamonds
        case "Spades":
        case "Clubs":
            return "black"; // Black text for Spades and Clubs
        default:
            return "black";
    }
}

function createGameBoard(container, size, layout) {
    const board = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            
            const card = layout[i][j];
            const textColor = getTextColorBasedOnSuit(card.suit);

            const topLeft = document.createElement("div");
            topLeft.classList.add("card-text-top-left");
            topLeft.innerText = `${card.rank} ${getCardSuitSymbol(card.suit)}`; 
            topLeft.style.color = textColor; // Set text color based on suit

            const bottomRight = document.createElement("div");
            bottomRight.classList.add("card-text-bottom-right");
            bottomRight.innerText = `${getCardSuitSymbol(card.suit)} ${card.rank}`; 
            bottomRight.style.color = textColor; // Set text color based on suit

            cell.appendChild(topLeft); // Add text to the top left
            cell.appendChild(bottomRight); // Add text to the bottom right

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
        cardElement.classList.add("card");
        cardElement.innerText = card.toString();
        container.appendChild(cardElement);
    });
}

function getBoardCellForCard(board, card) {
    // Placeholder: Implement logic to map card rank/suit to board positions
    // This will require understanding the Sequence board layout
    // Example: Return a specific board cell based on card's rank and suit
    return null; // Modify as needed
}

function placeChip(cell, color) {
    if (cell.style.backgroundColor === "") {
        cell.style.backgroundColor = color;
    }
}
