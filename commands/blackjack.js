//commands/blackjack.js
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { BlackjackGame, calculateHand, Deck } = require('../games/blackjackGame');

const singleGames = new Map();
const multiGames = new Map();
const TIMEOUT_DURATION = 60000; // 60 giây

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Chơi một ván Blackjack')
    .addUserOption(option =>
      option.setName('player')
        .setDescription('Chọn 1 người bạn để chơi cùng (cả hai đấu với dealer)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const opponent = interaction.options.getUser('player');

    if (opponent && opponent.id === interaction.user.id) {
      return interaction.reply({ content: 'Bạn không thể chơi với chính mình.', ephemeral: true });
    }

    if (opponent) {
      const gameId = interaction.channel.id;
      if (multiGames.has(gameId)) {
        return interaction.reply({ content: 'Đã có một ván đang diễn ra ở kênh này.', ephemeral: true });
      }

      const deck = new Deck();
      const game = {
        deck,
        players: [interaction.user, opponent],
        hands: {},
        dealerHand: [],
        turnIndex: 0,
        finished: {},
        timeout: null
      };

      game.hands[interaction.user.id] = [deck.draw(), deck.draw()];
      game.hands[opponent.id] = [deck.draw(), deck.draw()];
      game.dealerHand = [deck.draw(), deck.draw()];
      game.finished[interaction.user.id] = false;
      game.finished[opponent.id] = false;

      multiGames.set(gameId, game);
      const embed = createMultiEmbed(game);
      const row = createButtons();
      await interaction.reply({ content: `<@${interaction.user.id}> vs <@${opponent.id}>`, embeds: [embed], components: [row] });

      startTurnTimeout(interaction.channel, game);
      return;
    }

    if (singleGames.has(interaction.user.id)) {
      return interaction.reply({ content: 'Bạn đang trong một ván game. Hoàn thành ván hiện tại trước khi chơi tiếp!', ephemeral: true });
    }

    const game = new BlackjackGame();
    game.playerId = interaction.user.id;
    game.playerName = interaction.user.username;
    game.start();
    singleGames.set(interaction.user.id, game);

    const embed = createSingleEmbed(game, false);
    const row = createButtons();
    await interaction.reply({ embeds: [embed], components: [row] });
  },

  async handler(interaction) {
    const userId = interaction.user.id;
    const gameId = interaction.channel.id;

    if (multiGames.has(gameId)) {
      const game = multiGames.get(gameId);
      if (!game.players.some(p => p.id === userId)) return;
      if (game.players[game.turnIndex].id !== userId) {
        return interaction.reply({ content: 'Chưa tới lượt bạn!', ephemeral: true });
      }

      clearTimeout(game.timeout);

      if (interaction.customId === 'hit') {
        game.hands[userId].push(game.deck.draw());
        if (calculateHand(game.hands[userId]) > 21) {
          game.finished[userId] = true;
          game.turnIndex = (game.turnIndex + 1) % 2;
        }
      } else if (interaction.customId === 'stand') {
        game.finished[userId] = true;
        game.turnIndex = (game.turnIndex + 1) % 2;
      }

      const bothDone = game.players.every(p => game.finished[p.id]);
      if (bothDone) {
        while (calculateHand(game.dealerHand) < 17) {
          game.dealerHand.push(game.deck.draw());
        }

        const dealerTotal = calculateHand(game.dealerHand);
        let resultText = '';

        for (const p of game.players) {
          const playerTotal = calculateHand(game.hands[p.id]);
          let result = '';
          if (playerTotal > 21) result = '❌ Bị quắc!';
          else if (dealerTotal > 21 || playerTotal > dealerTotal) result = '✅ Thắng Dealer!';
          else if (playerTotal < dealerTotal) result = '❌ Thua Dealer!';
          else result = '🤝 Hòa!';
          resultText += `**${p.username}**: ${result}\n`;
        }

        const embed = createMultiEmbed(game, true).addFields({ name: '🏁 Kết quả', value: resultText });
        multiGames.delete(gameId);
        return interaction.update({ embeds: [embed], components: [] });
      }

      const embed = createMultiEmbed(game);
      await interaction.update({ embeds: [embed] });
      startTurnTimeout(interaction.channel, game);
      return;
    }

    if (singleGames.has(userId)) {
      const game = singleGames.get(userId);

      if (interaction.customId === 'hit') {
        game.hit();
        if (calculateHand(game.playerHand) > 21) {
          await endSingleGame(interaction, game);
        } else {
          await interaction.update({ embeds: [createSingleEmbed(game, false)] });
        }
      } else if (interaction.customId === 'stand') {
        await endSingleGame(interaction, game);
      }
    }
  }
};

function startTurnTimeout(channel, game) {
  clearTimeout(game.timeout);
  const currentPlayer = game.players[game.turnIndex];

  game.timeout = setTimeout(async () => {
    game.finished[currentPlayer.id] = true;
    game.turnIndex = (game.turnIndex + 1) % 2;

    const bothDone = game.players.every(p => game.finished[p.id]);
    if (bothDone) {
      while (calculateHand(game.dealerHand) < 17) {
        game.dealerHand.push(game.deck.draw());
      }

      const dealerTotal = calculateHand(game.dealerHand);
      let resultText = '';

      for (const p of game.players) {
        const playerTotal = calculateHand(game.hands[p.id]);
        let result = '';
        if (playerTotal > 21) result = '❌ Bị quắc!';
        else if (dealerTotal > 21 || playerTotal > dealerTotal) result = '✅ Thắng Dealer!';
        else if (playerTotal < dealerTotal) result = '❌ Thua Dealer!';
        else result = '🤝 Hòa!';
        resultText += `**${p.username}**: ${result}\n`;
      }

      const embed = createMultiEmbed(game, true).addFields({ name: '🏁 Kết quả', value: resultText });
      multiGames.delete(channel.id);
      await channel.send({ embeds: [embed] });
    } else {
      const embed = createMultiEmbed(game);
      const row = createButtons();
      await channel.send({ content: `⏰ <@${currentPlayer.id}> đã hết thời gian. Tự động Dừng.`, embeds: [embed], components: [row] });
      startTurnTimeout(channel, game);
    }
  }, TIMEOUT_DURATION);
}

async function endSingleGame(interaction, game) {
  game.dealerPlay();
  const result = game.getResult();
  await interaction.update({
    embeds: [createSingleEmbed(game, true).addFields({ name: '🏆 Kết quả', value: result, inline: false })],
    components: []
  });
  singleGames.delete(game.playerId);
}

function createButtons() {
  const hitBtn = new ButtonBuilder().setCustomId('hit').setLabel('Rút').setStyle(ButtonStyle.Primary).setEmoji('🃏');
  const standBtn = new ButtonBuilder().setCustomId('stand').setLabel('Dừng').setStyle(ButtonStyle.Secondary).setEmoji('✋');
  return new ActionRowBuilder().addComponents(hitBtn, standBtn);
}

function createSingleEmbed(game, finished) {
  const hands = game.getHands();
  const pv = calculateHand(game.playerHand);
  const dealerVisible = finished ? hands.dealer.join(' ') : `${hands.dealer[0]} 🂠`;
  const dv = finished ? calculateHand(game.dealerHand) : '?';
  const embed = new EmbedBuilder()
    .setTitle(finished ? '🏁 Kết quả Blackjack 🏁' : '♠️ Blackjack ♥️')
    .setColor(finished ? 'Blue' : 'Gold')
    .addFields(
      { name: `🧑 ${game.playerName}`, value: `Bài: ${hands.player.join(' ')}\nTổng: ${pv}`, inline: true },
      { name: '🤖 Dealer', value: `Bài: ${dealerVisible}\nTổng: ${dv}`, inline: true },
      { name: '\u200b', value: '\u200b', inline: false },
      { name: '🎮 Hướng dẫn', value: finished ? 'Bạn đã hoàn thành ván chơi.' : '🃏 Nhấn **Rút** để bốc thêm bài\n✋ Nhấn **Dừng** để dừng lượt' }
    )
    .setFooter({ text: finished ? 'Cảm ơn bạn đã chơi! 👋' : 'Chúc bạn may mắn! 🍀' });
  return embed;
}

function createMultiEmbed(game, finished = false) {
  const embed = new EmbedBuilder()
    .setTitle('♠️ Blackjack 2 người chơi ♥️')
    .setColor('Aqua');

  for (const player of game.players) {
    const hand = game.hands[player.id];
    const total = calculateHand(hand);
    const name = player.username;
    const isDone = game.finished[player.id];
    embed.addFields({
      name: `🧑 ${name}`,
      value: `Bài: ${hand.map(c => c.toString()).join(' ')}\nTổng: ${total}${isDone ? ' ✅' : ''}`,
      inline: true
    });
  }

  embed.addFields({
    name: '🤖 Dealer',
    value: finished ? `Bài: ${game.dealerHand.map(c => c.toString()).join(' ')}\nTổng: ${calculateHand(game.dealerHand)}` : `Bài: ${game.dealerHand[0].toString()} 🂠`,
    inline: false
  });

  if (!finished) {
    embed.setFooter({ text: `Lượt của: ${game.players[game.turnIndex].username}` });
  }

  return embed;
}