const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send')
    .setDescription('Gửi tin nhắn dưới tên bot.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Tin nhắn bạn muốn gửi')
        .setRequired(true)
    ),

  async execute(interaction) {
    const message = interaction.options.getString('message');

    // Gửi tin nhắn dưới tên bot đến kênh nơi lệnh được gọi
    await interaction.channel.send(message);

    // Phản hồi riêng tư cho người dùng rằng tin nhắn đã được gửi
    await interaction.reply({ content: 'Tin nhắn của bạn đã được gửi thành công!', ephemeral: true });
  }
};
