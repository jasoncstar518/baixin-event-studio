# 百信活动工坊 API 接口文档

**版本：** v1.0  
**基础 URL：** `http://localhost:3000/api`

---

## 认证说明

除登录/注册接口外，其他接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <your-token>
```

---

## 认证接口 (Auth)

### 1. 用户注册

**接口：** `POST /api/auth/register`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "123456",
  "nickname": "张三"
}
```

**响应：**
```json
{
  "message": "注册成功",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "张三",
      "avatarUrl": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. 用户登录

**接口：** `POST /api/auth/login`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**响应：**
```json
{
  "message": "登录成功",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "张三",
      "avatarUrl": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. 获取当前用户信息

**接口：** `GET /api/auth/me`

**请求头：** `Authorization: Bearer <token>`

**响应：**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "张三",
    "avatarUrl": "https://...",
    "createdAt": "2026-03-26T00:00:00.000Z"
  }
}
```

---

### 4. 更新用户信息

**接口：** `PUT /api/auth/profile`

**请求头：** `Authorization: Bearer <token>`

**请求体：**
```json
{
  "nickname": "新昵称",
  "avatarUrl": "https://..."
}
```

---

### 5. 修改密码

**接口：** `POST /api/auth/change-password`

**请求头：** `Authorization: Bearer <token>`

**请求体：**
```json
{
  "oldPassword": "123456",
  "newPassword": "newpassword123"
}
```

---

## 活动接口 (Events)

### 1. 获取活动列表

**接口：** `GET /api/events`

**查询参数：**
- `status` (可选): 筛选状态 (draft/published/archived)
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 10

**响应：**
```json
{
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "五周年纪念日",
        "status": "draft",
        "slug": "wu-zhou-nian-ji-nian-ri-1711440000000",
        "publishedAt": null,
        "createdAt": "2026-03-26T00:00:00.000Z",
        "updatedAt": "2026-03-26T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

### 2. 创建新活动

**接口：** `POST /api/events`

**请求头：** `Authorization: Bearer <token>`

**请求体：**
```json
{
  "title": "五周年纪念日",
  "templateId": "uuid" // 可选
}
```

**响应：**
```json
{
  "message": "活动创建成功",
  "data": {
    "id": "uuid",
    "title": "五周年纪念日",
    "status": "draft",
    "slug": "wu-zhou-nian-ji-nian-ri-1711440000000",
    "templateId": null,
    "createdAt": "2026-03-26T00:00:00.000Z"
  }
}
```

---

### 3. 获取活动详情

**接口：** `GET /api/events/:id`

**响应：**
```json
{
  "data": {
    "id": "uuid",
    "title": "五周年纪念日",
    "status": "draft",
    "slug": "wu-zhou-nian-ji-nian-ri-1711440000000",
    "components": [
      {
        "id": "uuid",
        "componentType": "text",
        "config": {
          "content": "五周年快乐",
          "fontSize": 32,
          "color": "#ff0000"
        },
        "sortOrder": 0
      }
    ],
    "template": {
      "id": "uuid",
      "name": "周年纪念",
      "category": "anniversary"
    }
  }
}
```

---

### 4. 更新活动

**接口：** `PUT /api/events/:id`

**请求体：**
```json
{
  "title": "新的标题",
  "components": [
    {
      "type": "text",
      "props": {
        "content": "五周年快乐",
        "fontSize": 32,
        "color": "#ff0000",
        "textAlign": "center"
      }
    },
    {
      "type": "timeline",
      "props": {
        "items": [
          {"date": "2021-03-26", "title": "相遇", "description": "..."}
        ]
      }
    }
  ]
}
```

---

### 5. 删除活动

**接口：** `DELETE /api/events/:id`

**响应：**
```json
{
  "message": "活动已删除"
}
```

---

### 6. 发布活动

**接口：** `POST /api/events/:id/publish`

**响应：**
```json
{
  "message": "活动发布成功",
  "data": {
    "id": "uuid",
    "title": "五周年纪念日",
    "status": "published",
    "slug": "wu-zhou-nian-ji-nian-ri-1711440000000",
    "publishedAt": "2026-03-26T00:00:00.000Z"
  }
}
```

---

### 7. 复制活动

**接口：** `POST /api/events/:id/duplicate`

**请求体：**
```json
{
  "title": "副本标题" // 可选，默认为"原标题 (副本)"
}
```

---

## 错误响应格式

所有错误返回统一格式：

```json
{
  "error": "错误类型",
  "message": "详细错误信息"
}
```

### 常见错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权/Token 无效 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如邮箱已注册） |
| 500 | 服务器内部错误 |

---

## 测试示例

### 使用 curl 测试登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### 使用 curl 获取活动列表

```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer <your-token>"
```
