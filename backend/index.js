const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const recordRoutes = require('./routes/records');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const channelRoutes = require('./routes/channels');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/channels', channelRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '服务正常运行', timestamp: new Date().toISOString() });
});

// 静态文件服务（前端）
app.use(express.static(__dirname + '/../fronted'));

// 处理前端路由（SPA）
app.get('/{*path}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(__dirname + '/../fronted/index.html');
  } else {
    res.status(404).json({ success: false, message: 'API不存在' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║           财务小管家后端服务已启动                     ║
╠══════════════════════════════════════════════════════╣
║  服务器地址: http://localhost:${PORT}                    ║
║  API文档:    http://localhost:${PORT}/api/health        ║
╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
