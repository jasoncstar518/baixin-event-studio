/**
 * 活动管理路由
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');

// 所有活动相关接口都需要认证
router.use(authMiddleware);

/**
 * @route   GET /api/events
 * @desc    获取活动列表
 * @access  Private
 */
router.get('/', eventController.getEvents);

/**
 * @route   POST /api/events
 * @desc    创建新活动
 * @access  Private
 */
router.post('/', eventController.createEvent);

/**
 * @route   GET /api/events/:id
 * @desc    获取活动详情
 * @access  Private
 */
router.get('/:id', eventController.getEventById);

/**
 * @route   PUT /api/events/:id
 * @desc    更新活动
 * @access  Private
 */
router.put('/:id', eventController.updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    删除活动
 * @access  Private
 */
router.delete('/:id', eventController.deleteEvent);

/**
 * @route   POST /api/events/:id/publish
 * @desc    发布活动
 * @access  Private
 */
router.post('/:id/publish', eventController.publishEvent);

/**
 * @route   POST /api/events/:id/duplicate
 * @desc    复制活动
 * @access  Private
 */
router.post('/:id/duplicate', eventController.duplicateEvent);

module.exports = router;
