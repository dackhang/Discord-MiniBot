const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] The command at ${filePath} is missing "data" or "execute".`);
  }
}

// Login
client.once('ready', () => {
  // Đặt trạng thái và hoạt động
  client.user.setPresence({
    activities: [{
      name: 'CÙNG DHTI15A1CL CHẠY DEADLINE [/]',
      type: ActivityType.Playing
    }],
    status: 'online'
  });

  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  // Slash command
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Đã xảy ra lỗi khi thực thi lệnh.', ephemeral: true });
    }
  }

  // Button interaction
  else if (interaction.isButton()) {
    // Blackjack button handler
    if (interaction.customId.startsWith('hit') || interaction.customId.startsWith('stand')) {
      try {
        const blackjackHandler = require('./commands/blackjack').handler;
        await blackjackHandler(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Lỗi khi xử lý Blackjack!', ephemeral: true });
      }
    }

    // Rock Paper Scissors button handler
    else if (interaction.customId.startsWith('rps_')) {
      try {
        const rpsHandler = require('./handlers/rpsHandler');
        await rpsHandler(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Lỗi khi xử lý Rock-Paper-Scissors!', ephemeral: true });
      }
    }
  }
});

// Start bot
client.login(process.env.TOKEN);

// keep the bot alive on Render using Express
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
