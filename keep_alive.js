const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot đang chạy!');
});

function keepAlive() {
  app.listen(3000, () => {
    console.log('Server web đang chạy trên cổng 3000');
  });
}

module.exports = keepAlive;

//Nếu set up index.js để chạy keepAlive, thêm dòng này vào cuối file index.js ( có thể xóa nếu không cần thiết)
