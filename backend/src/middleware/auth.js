/**
 * JWT 认证中间件
 * 验证用户 Token，保护需要登录的接口
 */

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 从 Header 获取 Token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: '未授权',
        message: '请提供有效的认证 Token'
      });
    }
    
    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    // 验证 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息附加到请求对象
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token 已过期',
        message: '请重新登录'
      });
    }
    
    return res.status(401).json({ 
      error: 'Token 无效',
      message: '请重新登录'
    });
  }
};

module.exports = authMiddleware;
