const { Client, GatewayIntentBits, Collection, ActivityType, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Tạo bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
]
});


// Load commands từ thư mục /commands
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

// Đăng nhập
client.once('ready', async () => {
// Đăng ký Slash Commands
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commands = client.commands.map(cmd => cmd.data.toJSON());

  try {
    console.log('🔄 Đang đăng ký Slash Commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash Commands đã được đăng ký!');
  } catch (error) {
    console.error('❌ Lỗi khi đăng ký Slash Commands:', error);
  }

// Trạng thái bot
  client.user.setPresence({
    activities: [{
      name: 'CÙNG DHTI15A1CL CHẠY DEADLINE [/]',
      type: ActivityType.Playing
    }],
    status: 'online'
  });

  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Xử lý tương tác
client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Đã xảy ra lỗi khi thực thi lệnh.', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    if (interaction.customId.startsWith('hit') || interaction.customId.startsWith('stand')) {
      try {
        const blackjackHandler = require('./commands/blackjack').handler;
        await blackjackHandler(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Lỗi khi xử lý Blackjack!', ephemeral: true });
      }
    } else if (interaction.customId.startsWith('rps_')) {
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

// Check lỗi Token có được nhập không
console.log('Logging in with token:', process.env.DISCORD_TOKEN ? '[OK]' : '[EMPTY]');
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('❌ Lỗi đăng nhập:', err);
});

// Web server để giữ bot sống trên Render (keep_alive.js)
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

client.on('error', console.error);
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled rejection:', err);
});