//commands/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replays with the bot ping!'),

  async execute(interaction) {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply(`🏓 Pong! Client: ${ping}ms | WebSocket: ${interaction.client.ws.ping}ms`);
  }
};