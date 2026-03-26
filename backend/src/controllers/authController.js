/**
 * 用户认证控制器
 * 处理注册、登录、登出等认证相关逻辑
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * 用户注册
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    
    // 参数验证
    if (!email || !password) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '邮箱和密码为必填项'
      });
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '邮箱格式不正确'
      });
    }
    
    // 密码强度验证（至少 6 位）
    if (password.length < 6) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '密码长度至少 6 位'
      });
    }
    
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: '注册失败',
        message: '该邮箱已被注册'
      });
    }
    
    // 密码加密
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname: nickname || '匿名用户'
      }
    });
    
    // 生成 Token
    const token = generateToken(user);
    
    // 返回用户信息（不包含密码）
    res.status(201).json({
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl
        },
        token
      }
    });
    
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '注册失败，请稍后重试'
    });
  }
};

/**
 * 用户登录
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 参数验证
    if (!email || !password) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '邮箱和密码为必填项'
      });
    }
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: '登录失败',
        message: '邮箱或密码错误'
      });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: '登录失败',
        message: '邮箱或密码错误'
      });
    }
    
    // 生成 Token
    const token = generateToken(user);
    
    // 返回用户信息
    res.json({
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl
        },
        token
      }
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '登录失败，请稍后重试'
    });
  }
};

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user 由 authMiddleware 注入
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: '用户不存在',
        message: '用户可能已被删除'
      });
    }
    
    res.json({
      data: user
    });
    
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '获取用户信息失败'
    });
  }
};

/**
 * 更新用户信息
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { nickname, avatarUrl } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(nickname && { nickname }),
        ...(avatarUrl && { avatarUrl })
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true
      }
    });
    
    res.json({
      message: '更新成功',
      data: user
    });
    
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '更新用户信息失败'
    });
  }
};

/**
 * 修改密码
 * POST /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '原密码和新密码为必填项'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '新密码长度至少 6 位'
      });
    }
    
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    // 验证原密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: '密码错误',
        message: '原密码不正确'
      });
    }
    
    // 加密新密码
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // 更新密码
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });
    
    res.json({
      message: '密码修改成功'
    });
    
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '修改密码失败'
    });
  }
};

/**
 * 生成 JWT Token
 */
function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
