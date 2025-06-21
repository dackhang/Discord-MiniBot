# 🎮 Discord MiniGame Ness Bot – JavaScript (Node.js)

[![build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![status](https://img.shields.io/badge/status-online-blue)]()
[![deploy](https://img.shields.io/badge/hosted%20on-Render-orange)](https://render.com)

**Discord-MiniGame-Ness-Bot** là một bot Discord đơn giản được viết bằng **JavaScript (Node.js)** sử dụng thư viện `discord.js`. Bot hỗ trợ các slash command cơ bản và một số trò chơi nhỏ. 

---

## 🎯 Tính năng

- ✂️ `/rps` – Trò chơi kéo búa bao
- 🎰 `/slots` – Quay số biểu tượng trái cây
- 🃏 `/blackjack` – Game bài đơn giản giữa người chơi và bot
- 📶 `/ping` – Kiểm tra độ trễ của bot
- 📤 `/send` – Gửi tin nhắn dạng phàn hồi vào chat

---

## 🛠 Công nghệ sử dụng

- **Node.js** + **Discord.js v14**
- **dotenv** – Biến môi trường
- **fs**, **path** – Tự động load command
- **Render** – Triển khai bot online
- **Cronjob + Express** – Giữ bot hoạt động 24/7 (qua `keep_alive.js`)
