# 百信活动工坊 (BaiXin Event Studio)

让任何人无需代码即可创建精美的活动纪念网页

## 🎯 产品定位

- 🎯 **个人用户 (60%)**：纪念日、生日、求婚等私人活动
- 🏢 **小微企业 (25%)**：产品发布、品牌宣传活动
- 📢 **营销机构 (15%)**：为客户定制活动页面

## 🚀 快速开始

### 后端服务

```bash
cd backend
npm install
cp .env.example .env
# 配置 DATABASE_URL
npm run dev
```

### 前端服务

```bash
cd frontend
npm install
npm run dev
```

## 📁 项目结构

```
baixin-event-studio/
├── frontend/              # Vue 3 前端
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── router/       # 路由配置
│   │   └── main.js       # 入口文件
│   └── package.json
├── backend/               # Node.js + Express
│   ├── src/
│   │   └── index.js      # 服务器入口
│   ├── prisma/
│   │   └── schema.prisma # 数据库设计
│   └── package.json
├── docker/                # Docker 配置
└── docs/                  # 文档
```

## 🛠️ 技术栈

### 前端
- Vue 3 + Vite + TypeScript
- Element Plus UI
- Pinia 状态管理
- Vue Router 路由
- VueDraggable 拖拽

### 后端
- Node.js + Express
- Prisma ORM
- PostgreSQL 数据库
- JWT 认证
- Redis 缓存

## 📅 开发计划

| 阶段 | 时间 | 内容 |
|------|------|------|
| Phase 1 | 第 1-2 周 | 基础架构 + 用户系统 |
| Phase 2 | 第 3 周 | 活动管理 |
| Phase 3 | 第 4-5 周 | 可视化编辑器 |
| Phase 4 | 第 6 周 | 模板 + 发布 |
| Phase 5 | 第 7 周 | 联调测试 |

## 📄 许可证

MIT
