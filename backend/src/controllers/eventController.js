/**
 * 活动管理控制器
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * 获取活动列表
 * GET /api/events
 */
exports.getEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const where = {
      userId: req.user.id
    };
    
    if (status) {
      where.status = status;
    }
    
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          slug: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.event.count({ where })
    ]);
    
    res.json({
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('获取活动列表错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '获取活动列表失败'
    });
  }
};

/**
 * 创建新活动
 * POST /api/events
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, templateId } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '活动标题为必填项'
      });
    }
    
    // 生成唯一 slug
    const slug = generateSlug(title);
    
    const event = await prisma.event.create({
      data: {
        userId: req.user.id,
        title,
        templateId: templateId || null,
        slug
      },
      select: {
        id: true,
        title: true,
        status: true,
        slug: true,
        templateId: true,
        createdAt: true
      }
    });
    
    res.status(201).json({
      message: '活动创建成功',
      data: event
    });
    
  } catch (error) {
    console.error('创建活动错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '创建活动失败'
    });
  }
};

/**
 * 获取活动详情
 * GET /api/events/:id
 */
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        components: {
          orderBy: { sortOrder: 'asc' }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ 
        error: '活动不存在',
        message: '未找到该活动或您无权访问'
      });
    }
    
    res.json({
      data: event
    });
    
  } catch (error) {
    console.error('获取活动详情错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '获取活动详情失败'
    });
  }
};

/**
 * 更新活动
 * PUT /api/events/:id
 */
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, components } = req.body;
    
    // 检查活动是否存在且属于当前用户
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!existingEvent) {
      return res.status(404).json({ 
        error: '活动不存在',
        message: '未找到该活动或您无权访问'
      });
    }
    
    // 更新活动和组件（使用事务）
    const [updatedEvent] = await prisma.$transaction([
      // 更新活动基本信息
      prisma.event.update({
        where: { id },
        data: {
          ...(title && { title })
        }
      }),
      
      // 如果提供了组件数据，更新组件
      ...(components ? [
        // 删除旧组件
        prisma.eventComponent.deleteMany({
          where: { eventId: id }
        }),
        // 创建新组件
        ...components.map((comp, index) => 
          prisma.eventComponent.create({
            data: {
              eventId: id,
              componentType: comp.type,
              config: comp.props || comp.config,
              sortOrder: index
            }
          })
        )
      ] : [])
    ]);
    
    res.json({
      message: '活动更新成功',
      data: updatedEvent
    });
    
  } catch (error) {
    console.error('更新活动错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '更新活动失败'
    });
  }
};

/**
 * 删除活动
 * DELETE /api/events/:id
 */
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查活动是否存在且属于当前用户
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!existingEvent) {
      return res.status(404).json({ 
        error: '活动不存在',
        message: '未找到该活动或您无权访问'
      });
    }
    
    // 软删除：更新状态为 archived
    await prisma.event.update({
      where: { id },
      data: { status: 'archived' }
    });
    
    res.json({
      message: '活动已删除'
    });
    
  } catch (error) {
    console.error('删除活动错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '删除活动失败'
    });
  }
};

/**
 * 发布活动
 * POST /api/events/:id/publish
 */
exports.publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查活动是否存在且属于当前用户
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        components: true
      }
    });
    
    if (!event) {
      return res.status(404).json({ 
        error: '活动不存在',
        message: '未找到该活动或您无权访问'
      });
    }
    
    // 检查是否有组件
    if (event.components.length === 0) {
      return res.status(400).json({ 
        error: '发布失败',
        message: '活动至少需要包含一个组件'
      });
    }
    
    // 更新状态为已发布
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        status: true,
        slug: true,
        publishedAt: true
      }
    });
    
    res.json({
      message: '活动发布成功',
      data: updatedEvent
    });
    
  } catch (error) {
    console.error('发布活动错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '发布活动失败'
    });
  }
};

/**
 * 复制活动
 * POST /api/events/:id/duplicate
 */
exports.duplicateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    // 获取原活动
    const originalEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        components: true
      }
    });
    
    if (!originalEvent) {
      return res.status(404).json({ 
        error: '活动不存在',
        message: '未找到该活动或您无权访问'
      });
    }
    
    // 创建新活动
    const newEvent = await prisma.event.create({
      data: {
        userId: req.user.id,
        title: title || `${originalEvent.title} (副本)`,
        templateId: originalEvent.templateId,
        slug: generateSlug(title || `${originalEvent.title}-${Date.now()}`),
        components: {
          create: originalEvent.components.map(comp => ({
            componentType: comp.componentType,
            config: comp.config,
            sortOrder: comp.sortOrder
          }))
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        slug: true,
        createdAt: true
      }
    });
    
    res.status(201).json({
      message: '活动复制成功',
      data: newEvent
    });
    
  } catch (error) {
    console.error('复制活动错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      message: '复制活动失败'
    });
  }
};

/**
 * 生成 Slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50) + '-' + Date.now().toString(36);
}
