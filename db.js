const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

const welcomeSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true }
});

module.exports = mongoose.model('WelcomeChannel', welcomeSchema);

// File sets up kết nối MongoDB và định nghĩa schema cho kênh chào mừng.