//commands/setwelcome.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const WelcomeChannel = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Thiết lập kênh chào cho máy chủ này.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Kênh để bot gửi tin nhắn chào')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // ⬅️ Trả lời tạm thời trước tránh time out 

    const channel = interaction.options.getChannel('channel');
    const guildId = interaction.guild.id;

    try {
        await WelcomeChannel.findOneAndUpdate(
        { guildId },
        { channelId: channel.id },
        { upsert: true }
        );

        await interaction.editReply(`✅ Đã thiết lập kênh chào là ${channel}`);
    } catch (err) {
        console.error(err);
        await interaction.editReply('❌ Có lỗi xảy ra khi lưu thông tin.');
    }
    }

};