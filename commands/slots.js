// commands/slots.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SlotsGame = require('../games/slotsGame');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Chơi Slots với các biểu tượng trái cây')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Số tiền cược (mặc định: 10)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const bet = interaction.options.getInteger('bet') || 10;
    if (bet <= 0) {
      await interaction.reply({ content: 'Số tiền cược phải lớn hơn 0!', ephemeral: true });
      return;
    }

    const game = new SlotsGame();
    const { winnings, result } = game.calculateWinnings(bet);

    let resultStr = "```\n";
    resultStr += "━━━━━━━━━━━━━━\n";
    resultStr += ` ${result[0].join(' : ')}\n`;
    resultStr += ` ${result[1].join(' : ')}   ⫷\n`;
    resultStr += ` ${result[2].join(' : ')}\n`;
    resultStr += "━━━━━━━━━━━━━━\n";
    resultStr += "```";

    const embed = new EmbedBuilder()
      .setTitle('🎰 Slots 🎰')
      .setDescription(resultStr);

    if (winnings > 0) {
      embed.addFields({ name: 'Thắng!', value: `Bạn đã thắng ${winnings} xu!` });
      embed.setColor('Green');
    } else {
      embed.addFields({ name: 'Thua!', value: `Bạn đã mất ${bet} xu!` });
      embed.setColor('Red');
    }

    await interaction.reply('Đang quay... 🎰');
    await new Promise(res => setTimeout(res, 2000));
    const msg = await interaction.editReply({ content: null, embeds: [embed] });

    const colors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];
    for (let i = 0; i < 5; i++) {
      for (const color of colors) {
        embed.setColor(color);
        await msg.edit({ embeds: [embed] });
        await new Promise(res => setTimeout(res, 500));
      }
    }
  }
};
