const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Admin API running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════╗
║       财务小管家后台管理系统 API 已启动         ║
╠══════════════════════════════════════════════╣
║  服务器地址: http://localhost:${PORT}            ║
╚══════════════════════════════════════════════╝\n`);
});

module.exports = app;
