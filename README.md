# 🎮 Discord MiniBot – JavaScript (Node.js)

[![build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![status](https://img.shields.io/badge/status-online-blue)]()
[![deploy](https://img.shields.io/badge/hosted%20on-Render-orange)](https://render.com)

**Discord-MiniBot** is a simple Discord bot written in **JavaScript (Node.js)** using the `discord.js` library. The bot supports basic slash commands, mini-games, and a welcome feature for new members.

---

## 🎯 Features

- ✂️ `/rps` – Rock-Paper-Scissors mini-game
- 🎰 `/slots` – Fruit symbol slot machine game
- 🃏 `/blackjack` – Simple Blackjack game between the user and the bot
- 📶 `/ping` – Check the bot's latency
- 📤 `/send` – Send a response message into the chat
- 🛎️ `/setwelcome` – Set the welcome channel for your server (admin only, one-time setup)
- 👋 Auto-welcomes new members to the configured welcome channel

---

## 🛠 Technologies Used

- **Node.js** + **Discord.js v14**
- **MongoDB Atlas + Mongoose** – Stores per-server welcome channel data
- **dotenv** – Manage environment variables (token, Mongo URI, etc.)
- **fs**, **path** – Automatically load commands
- **Render** – Free hosting for the bot
- **Express + Cronjob** – Keeps the bot running 24/7

---
