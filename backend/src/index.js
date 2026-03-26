/**
 * 百信活动工坊 - 后端 API 服务
 * BaiXin Event Studio - Backend API Server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(express.json()); // JSON 解析
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 最多 100 请求
});
app.use('/api/', limiter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// 模板路由（待实现）
// const templateRoutes = require('./routes/templates');
// app.use('/api/templates', templateRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 百信活动工坊后端服务已启动`);
  console.log(`📍 监听端口：${PORT}`);
  console.log(`🔗 健康检查：http://localhost:${PORT}/health`);
  console.log(`📚 API 文档：http://localhost:${PORT}/api`);
});

module.exports = app;
