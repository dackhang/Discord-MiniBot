// commands/blackjack.js
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { BlackjackGame, calculateHand } = require('../games/blackjackGame');

const games = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Chơi một ván Blackjack'),

  async execute(interaction) {
    if (games.has(interaction.user.id)) {
      return interaction.reply({ content: 'Bạn đang trong một ván game. Hoàn thành ván hiện tại trước khi chơi tiếp!', ephemeral: true });
    }

    const game = new BlackjackGame(interaction.user.id, interaction.user.username);
    game.start();
    games.set(interaction.user.id, game);

    const embed = createEmbed(game, false);
    const row = createButtons();

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

function createEmbed(game, finished) {
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
      { name: '🎮 Hướng dẫn', 
        value: finished ? 'Bạn đã hoàn thành ván chơi.' : '🃏 Nhấn **Rút** để bốc thêm bài\n✋ Nhấn **Dừng** để dừng lượt'
      }
    )
    .setFooter({ text: finished ? 'Cảm ơn bạn đã chơi! 👋' : 'Chúc bạn may mắn! 🍀' });
  return embed;
}

function createButtons() {
  const hitBtn = new ButtonBuilder()
    .setCustomId('hit')
    .setLabel('Rút')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('🃏');

  const standBtn = new ButtonBuilder()
    .setCustomId('stand')
    .setLabel('Dừng')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('✋');

  return new ActionRowBuilder().addComponents(hitBtn, standBtn);
}

// Interaction handler
module.exports.handler = async (interaction) => {
  if (!interaction.isButton()) return;
  const game = games.get(interaction.user.id);
  if (!game) return interaction.reply({ content: 'Ván chơi không tồn tại.', ephemeral: true });

  if (interaction.customId === 'hit') {
    game.hit();
    if (calculateHand(game.playerHand) > 21) {
      await endGame(interaction, game);
    } else {
      await interaction.update({ embeds: [createEmbed(game, false)] });
    }
  } else if (interaction.customId === 'stand') {
    await endGame(interaction, game);
  }
};

async function endGame(interaction, game) {
  game.dealerPlay();
  const result = game.getResult();
  await interaction.update({
    embeds: [createEmbed(game, true).addFields({ name: '🏆 Kết quả', value: result, inline: false })],
    components: []
  });
  games.delete(game.playerId);
}
