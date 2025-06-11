// handlers/rpsHandler.js
const { EmbedBuilder } = require('discord.js');
const activeGames = require('../commands/rps').activeGames;

function rpsWinner(a, b) {
  if (a === b) return 0;
  if (
    (a === 'rock' && b === 'scissors') ||
    (a === 'paper' && b === 'rock') ||
    (a === 'scissors' && b === 'paper')
  ) return 1;
  return 2;
}

module.exports = async interaction => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('rps_')) return;

  const game = activeGames.get(interaction.channelId);
  if (!game) {
    return interaction.reply({ content: 'Không có trò chơi nào ở đây!', ephemeral: true });
  }

  const choice = interaction.customId.split('_')[1]; // 'rock', 'paper', 'scissors'

  if (![game.author.id, game.opponent.id].includes(interaction.user.id)) {
    return interaction.reply({ content: 'Bạn không phải người chơi.', ephemeral: true });
  }

  if (game.choices[interaction.user.id]) {
    return interaction.reply({ content: 'Bạn đã chọn rồi!', ephemeral: true });
  }

  game.choices[interaction.user.id] = choice;
  await interaction.reply({ content: `Bạn chọn **${choice}**`, ephemeral: true });

  // Khi cả hai đã chọn
  if (
    game.choices[game.author.id] &&
    game.choices[game.opponent.id]
  ) {
    const aChoice = game.choices[game.author.id];
    const oChoice = game.choices[game.opponent.id];
    const result = rpsWinner(aChoice, oChoice);

    let resText;
    if (result === 0) resText = "Hòa!";
    else if (result === 1) resText = `${game.author} thắng!`;
    else resText = `${game.opponent} thắng!`;

    const embed = new EmbedBuilder()
      .setTitle('Kết quả Oẳn Tù Tì 🎲')
      .addFields(
        { name: game.author.username, value: aChoice, inline: true },
        { name: game.opponent.username, value: oChoice, inline: true },
        { name: 'Kết quả', value: resText, inline: false }
      )
      .setColor('Green');

    await interaction.followUp({ embeds: [embed] });
    activeGames.delete(interaction.channelId);
  }
};
