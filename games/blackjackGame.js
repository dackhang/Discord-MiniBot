// games/blackjackGame.js
const SUIT_ICONS = {
  'Hearts': '♥️',
  'Diamonds': '♦️',
  'Clubs': '♣️',
  'Spades': '♠️'
};

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }
  toString() {
    return `${this.value}${SUIT_ICONS[this.suit]}`;
  }
}

class Deck {
  constructor() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    this.cards = suits.flatMap(suit => values.map(val => new Card(suit, val)));
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw() {
    return this.cards.pop();
  }
}

function calculateHand(hand) {
  let total = 0, aces = 0;
  for (const card of hand) {
    if (['J','Q','K'].includes(card.value)) total += 10;
    else if (card.value === 'A') aces++;
    else total += +card.value;
  }
  for (let i = 0; i < aces; i++) {
    if (total + 11 <= 21) total += 11;
    else total += 1;
  }
  return total;
}

class BlackjackGame {
  constructor(playerId, playerName) {
    this.deck = new Deck();
    this.playerId = playerId;
    this.playerName = playerName;
    this.playerHand = [];
    this.dealerHand = [];
  }

  start() {
    this.playerHand = [this.deck.draw(), this.deck.draw()];
    this.dealerHand = [this.deck.draw(), this.deck.draw()];
  }

  hit() {
    this.playerHand.push(this.deck.draw());
  }

  dealerPlay() {
    while (calculateHand(this.dealerHand) < 17) {
      this.dealerHand.push(this.deck.draw());
    }
  }

  getResult() {
    const pv = calculateHand(this.playerHand);
    const dv = calculateHand(this.dealerHand);
    if (pv > 21) return "Bạn đã quắc! Dealer thắng!";
    if (dv > 21) return "Dealer đã quắc! Bạn thắng!";
    if (pv > dv) return "Bạn thắng!";
    if (dv > pv) return "Dealer thắng!";
    return "Hòa!";
  }

  getHands() {
    return {
      player: this.playerHand.map(c => c.toString()),
      dealer: this.dealerHand.map(c => c.toString())
    };
  }
}

module.exports = { BlackjackGame, calculateHand };
