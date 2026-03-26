/**
 * 认证相关路由
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    更新用户信息
 * @access  Private
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    修改密码
 * @access  Private
 */
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
