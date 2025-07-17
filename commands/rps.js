//commands/rps.js
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle
} = require('discord.js');

const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rock-paper-scissors')
    .setDescription('Chơi oẳn tù tì với một người bạn')
    .addUserOption(opt =>
      opt.setName('opponent')
         .setDescription('Người chơi cùng bạn')
         .setRequired(true)
    ),

  async execute(interaction) {
    const opponent = interaction.options.getUser('opponent');

    if (opponent.id === interaction.user.id) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('❌ Lỗi')
          .setDescription('Không thể chơi với chính bạn!')
          .setColor('Red')],
        ephemeral: true
      });
    }

    if (activeGames.has(interaction.channelId)) {
      return interaction.reply({
        content: 'Hiện tại đã có một trò chơi đang diễn ra ở kênh này. Vui lòng chờ đến khi kết thúc.',
        ephemeral: true
      });
    }

    const game = {
      author: interaction.user,
      opponent,
      choices: {},
      timeout: null
    };
    activeGames.set(interaction.channelId, game);

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('rps_rock')
        .setLabel('Rock ✊🏼')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('rps_paper')
        .setLabel('Paper 🖐🏼')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('rps_scissors')
        .setLabel('Scissors ✌🏼')
        .setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder()
      .setTitle('🎮 Oẳn Tù Tì Challenge')
      .setDescription(`${interaction.user} đã thách ${opponent} chơi oẳn tù tì`)
      .addFields({ name: 'Hãy chọn một:', value: 'Rock, Paper, hoặc Scissors', inline: false })
      .setColor('Blue');

    await interaction.reply({ embeds: [embed], components: [buttons] });

    game.timeout = setTimeout(() => {
      if (activeGames.has(interaction.channelId) && Object.keys(game.choices).length < 2) {
        interaction.followUp('⏰ Thời gian chọn đã hết, trò chơi hủy.');
        activeGames.delete(interaction.channelId);
      }
    }, 60_000);
  },

  activeGames
};