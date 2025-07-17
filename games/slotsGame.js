//games/slotsGame.js
class SlotsGame {
  constructor() {
    this.symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐'];
  }

  spin() {
    return Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => this.symbols[Math.floor(Math.random() * this.symbols.length)])
    );
  }

  calculateWinnings(bet) {
    const result = this.spin();
    const centerRow = result[1];
    const [a, b, c] = centerRow;

    if (a === b && b === c) {
      return { winnings: bet * 5, result }; // Jackpot
    } else if (a === b || b === c || a === c) {
      return { winnings: bet * 2, result }; // 2 of a kind
    } else {
      return { winnings: 0, result }; // Lose
    }
  }
}

module.exports = SlotsGame;