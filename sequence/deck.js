class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    toString() {
        return `${this.rank} of ${this.suit}`;
    }

    getImageFilePath() {
        return `svgcards/${this.getImageRankFromRank()}_of_${this.suit.toLowerCase()}.svg`;
    }

    getImageRankFromRank(){
        if (this.rank === 'A') {
            return "ace";
        } else if (this.rank === 'J') {
            return "jack";
        } else if (this.rank === 'Q') {
            return "queen";
        } else if (this.rank === 'K') {
            return "king";
        } else {
            return this.rank;
        }
    }

    getSuit() {
        return this.suit;
    }

    getRank() {
        return this.rank;
    }
}

class Deck {
    constructor() {
        this.suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
        this.ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        this.cards = this.createDeck(2);
    }

    createDeck(numberOfSets) {
        const deck = [];
        for (let i = 0; i < numberOfSets; i++) {
            for (const suit of this.suits) {
                for (const rank of this.ranks) {
                    deck.push(new Card(suit, rank));
                }
            }
        }
        return deck;
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(numberOfCards) {
        return this.cards.splice(0, numberOfCards);
    }

    dealOne() {
        return this.cards.shift();
    }
}
