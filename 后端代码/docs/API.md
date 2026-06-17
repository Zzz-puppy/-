# 前端对接文档

（服务端地址待定）

---

## 认证机制

#### 1. 微信一键登录流程

```
  1. 小程序调用 wx.login() 获取 code
  2. 将 code 发送到后端 /api/user/wxLogin
  3. 后端返回 userId、token、role
  4. 前端存储 token（wx.setStorageSync('token', token)）
  5. 后续请求在 header 中携带 token
```

#### 2. Token 使用方式

需要认证的接口，在请求头中添加：

```javascript
header: {
  'Authorization': 'Bearer ' + token
}
```

token 中已经包含了用户身份信息，后端会自动解析，**无需额外传 userId**。

#### 3. 接口认证情况

**需要 Token 的接口**：
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户资料
- `POST /api/user/certify` - 提交校园认证
- `GET /api/user/certification/status` - 获取认证状态
- `POST /api/user/admin-switch` - 管理员密码验证
- POST `/api/item` - 发布商品
- GET `/api/item/my` - 我的发布
- PUT `/api/item/{id}/status` - 更新商品状态
- POST `/api/order` - 创建订单
- GET `/api/order/my` - 我的订单
- PUT `/api/order/{id}/status` - 更新订单状态
- GET `/api/im/getUserSig` - 获取 IM 签名
- `/api/admin/*` - 所有管理员接口

**无需 Token 的接口**：
- POST `/api/user/wxLogin` - 微信登录
- GET `/api/item/list` - 商品列表
- GET `/api/item/search` - 搜索商品
- GET `/api/item/{id}` - 商品详情

---

## 请求格式

除认证相关内容放在 header 中外，其余请求参数全部放在 data 段中：

```json
data: {
  ...
}
```

---

## 返回格式

所有接口统一返回以下格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

**状态码说明**：
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未认证（token 无效或过期）
- `403` - 无权限
- `404` - 资源不存在
- `500` - 服务器错误

---

## 接口列表

使用 RESTful API
下文中：

- 请求参数：指放在请求内容 JSON 里的参数
- 路径参数：指放在请求 URL 中的参数

## 用户模块

#### 1.1 一键登录

**接口地址**：`POST /api/user/wxLogin`
**是否需要认证**：否

**请求参数**：
```json
{
   "code": "微信登录返回的code"
}
```

**字段说明**:
- `code`：必填，调用 wx.login() 获取

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "user"
  }
}
```

---

#### 1.2 获取用户信息

**接口地址**：`GET /api/user/profile`
**是否需要认证**：是

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "openid": "wx_openid_xxx",
    "nickname": "测试用户",
    "avatarUrl": "https://...",
    "studentId": "20210001",
    "isCertified": true,
    "certifiedAt": "2026-04-22T10:30:00",
    "creditScore": 80,
    "completedDeals": 5,
    "cancelledDeals": 1,
    "role": "user",
    "createTime": "2026-04-22T10:30:00",
    "updateTime": "2026-04-22T10:30:00"
  }
}
```

---

#### 1.3 更新用户资料

**接口地址**：`PUT /api/user/profile`
**是否需要认证**：是

**请求参数**：
```json
{
  "nickname": "新昵称",
  "avatarUrl": "https://..."
}
```

**字段说明**：
- `nickname`：选填，昵称（最长 50 字符）
- `avatarUrl`：选填，头像 URL（最长 255 字符）

**返回示例**：同 1.2 获取用户信息

---

#### 1.4 提交校园认证

**接口地址**：`POST /api/user/certify`
**是否需要认证**：是

**请求参数**：
```json
{
  "studentId": "20210001"
}
```

**字段说明**：
- `studentId`：必填，学号

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

**注意**：提交后需等待管理员审核通过。

---

#### 1.5 获取认证状态

**接口地址**：`GET /api/user/certification/status`
**是否需要认证**：是

**返回示例**（审核中）：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "studentId": "20210001",
    "status": "pending",
    "rejectReason": null,
    "reviewerId": null,
    "createTime": "2026-04-22T10:30:00",
    "reviewTime": null
  }
}
```

**status 说明**：
- `pending` - 审核中
- `approved` - 已通过
- `rejected` - 已驳回

---

#### 1.6 管理员密码验证（切换为管理员）

**接口地址**：`POST /api/user/admin-switch`
**是否需要认证**：是

**请求参数**：
```json
{
  "password": "admin123"
}
```

**字段说明**：
- `password`：必填，管理员密码

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "eyJhbGci...",
    "role": "admin"
  }
}
```

**注意**：验证成功后，当前用户角色将切换为 `admin`，同时返回新的 JWT token，前端需用新 token 替换旧 token。已经是管理员的用户无需调用此接口。

---

## 商品模块

#### 2.1 发布商品

**接口地址**：`POST /api/item`
**是否需要认证**：是

**请求参数**：
```json
{
  "title": "商品标题",
  "description": "商品描述",
  "price": 99.99,
  "imageUrl": "图片URL",
  "categoryId": 1
}
```

**字段说明**：
- `title`：必填，商品标题
- `description`：选填，商品描述
- `price`：必填，价格（数字类型）
- `imageUrl`：选填，图片URL
- `categoryId`：必填，分类ID（1=数码产品, 2=图书教材, 3=生活用品, 4=运动器材, 5=服装服饰, 6=其他）

**注意**：`sellerId`（卖家ID）由后端从 token 中获取，前端不需要传

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": 123
}
```

**注意**：返回的 `data` 为新创建的商品 ID（数字类型）。

---

#### 2.2 商品列表（分页+排序）

**接口地址**：`GET /api/item/list?page={}&size={}&sortBy={}`
**是否需要认证**：否

**路径参数**：
- `page`：页码，默认 1
- `size`：每页数量，默认 10
- `sortBy`：排序方式（可选），`price_asc`=价格升序，`price_desc`=价格降序，不传默认按时间倒序

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "二手自行车",
        "description": "9成新",
        "price": 200.00,
        "imageUrl": "https://...",
        "sellerId": 10,
        "categoryId": 1,
        "status": 0,
        "createTime": "2026-04-22T10:30:00",
        "updateTime": "2026-04-22T10:30:00"
      }
    ],
    "total": 100
  }
}
```

**字段说明**：
- `list`：商品列表数组
- `total`：符合条件的商品总数
- `categoryId`：分类ID


---

#### 2.3 搜索商品（分页+排序）

**接口地址**：`GET /api/item/search?keyword={}&page={}&size={}&sortBy={}`
**是否需要认证**：否

**路径参数**：
- `keyword`：搜索关键词（必填）
- `page`：页码，默认 1
- `size`：每页数量，默认 10
- `sortBy`：排序方式（可选），`price_asc`=价格升序，`price_desc`=价格降序，不传默认按时间倒序

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "二手自行车",
        "description": "9成新",
        "price": 200.00,
        "imageUrl": "https://...",
        "sellerId": 10,
        "categoryId": 1,
        "status": 0,
        "createTime": "2026-04-22T10:30:00",
        "updateTime": "2026-04-22T10:30:00"
      }
    ],
    "total": 15
  }
}
```

**字段说明**：
- `list`：符合搜索条件的商品列表
- `total`：符合搜索条件的商品总数
- `categoryId`：分类ID

**搜索规则**：
- 搜索范围：商品标题和描述
- 搜索方式：模糊匹配（LIKE）
- 只搜索在售商品（status = 0）

---

#### 2.4 商品详情

**接口地址**：`GET /api/item/{id}`
**是否需要认证**：否

**路径参数**：
- `id`：商品ID

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "二手自行车",
    "description": "9成新，骑行流畅",
    "price": 200.00,
    "imageUrl": "https://...",
    "sellerId": 10,
    "categoryId": 1,
    "status": 0,
    "createTime": "2026-04-22T10:30:00",
    "updateTime": "2026-04-22T10:30:00"
  }
}
```

---

#### 2.5 我的发布

**接口地址**：`GET /api/item/my`
**是否需要认证**：是

**注意**：`sellerId` 由后端从 token 中获取，前端不需要传

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "二手自行车",
      "description": "9成新",
      "price": 200.00,
      "imageUrl": "https://...",
      "sellerId": 10,
      "categoryId": 1,
      "status": 0,
      "createTime": "2026-04-22T10:30:00",
      "updateTime": "2026-04-22T10:30:00"
    }
  ]
}
```

---

## 订单模块
#### 2.6 更新商品状态

**接口地址**：`PUT /api/item/{id}/status`
**是否需要认证**：是

**路径参数**：
- `id`：商品ID

**请求参数**：
```json
{
  "status": 1
}
```

**商品状态说明**：
- `0` - 在售
- `1` - 已售出
- `2` - 已下架

**注意**：只有商品发布者本人可以更新状态

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

---

## 订单模块

#### 3.1 创建订单

**接口地址**：`POST /api/order`
**是否需要认证**：是

**请求参数**：
```json
{
  "itemId": 123
}
```

**注意**：`buyerId`（买家ID）由后端从 token 中获取，前端不需要传

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": 456
}
```

---

#### 3.2 我的订单

**接口地址**：`GET /api/order/my`
**是否需要认证**：是

**注意**：后端会返回当前用户作为买家或卖家的所有订单

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "itemId": 123,
      "buyerId": 10,
      "sellerId": 20,
      "status": 1,
      "createTime": "2026-04-22T10:30:00",
      "updateTime": "2026-04-22T10:30:00"
    }
  ]
}
```

---

#### 3.3 更新订单状态

**接口地址**：`PUT /api/order/{id}/status`
**是否需要认证**：是

**路径参数**：
- `id`：订单ID

**请求参数**：
```json
{
  "status": 2
}
```

**订单状态说明**：
- `0` - 待确认
- `1` - 已完成
- `2` - 已取消

**注意**：只有订单的买家或卖家可以更新状态

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

---

## 管理员模块

> 管理员接口需要用户 `role` 为 `admin`。

#### 4.1 获取待审核认证列表

**接口地址**：`GET /api/admin/certifications/pending`
**是否需要认证**：是（需 admin 角色）

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "userId": 5,
      "studentId": "20210001",
      "status": "pending",
      "rejectReason": null,
      "reviewerId": null,
      "createTime": "2026-04-22T10:30:00",
      "reviewTime": null
    }
  ]
}
```

---

#### 4.2 批准认证

**接口地址**：`PUT /api/admin/certifications/{id}/approve`
**是否需要认证**：是（需 admin 角色）

**路径参数**：
- `id`：认证申请 ID

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

#### 4.3 拒绝认证

**接口地址**：`PUT /api/admin/certifications/{id}/reject`
**是否需要认证**：是（需 admin 角色）

**路径参数**：
- `id`：认证申请 ID

**请求参数**：
```json
{
  "reason": "学号信息不匹配"
}
```

---

#### 4.4 获取所有用户

**接口地址**：`GET /api/admin/users`
**是否需要认证**：是（需 admin 角色）

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "nickname": "用户A",
      "studentId": "20210001",
      "isCertified": true,
      "creditScore": 80,
      "completedDeals": 3,
      "cancelledDeals": 0,
      "role": "user"
    }
  ]
}
```

---

#### 4.5 调整用户信用分

**接口地址**：`PUT /api/admin/users/{id}/credit`
**是否需要认证**：是（需 admin 角色）

**路径参数**：
- `id`：用户 ID

**请求参数**：
```json
{
  "delta": 10
}
```

**字段说明**：
- `delta`：信用分变化量（正数加分，负数减分）

---

#### 4.6 下架商品

**接口地址**：`PUT /api/admin/items/{id}/ban`
**是否需要认证**：是（需 admin 角色）

**路径参数**：
- `id`：商品 ID

**注意**：将商品状态设为下架（status=2）。

---

## 聊天模块

计划使用 **腾讯云IM（TIMSDK）** 实现聊天功能。

后端只需提供 UserSig 生成接口。

前端集成可以参考官方文档：[微信小程序集成指南](https://cloud.tencent.com/document/product/269/37411)

#### 4.1 获取 IM 签名

**接口地址**：`GET /api/im/getUserSig`
**是否需要认证**：是

**参数**：无

**返回示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "123",
    "userSig": "eJw1jdEKgjAYhV8l7Lq0*bfNXYWQRZJQXnQXhf6ZoTZtToTefRtdHc75-M45..."
  }
}
```

**字段说明**：
- `userId`：用户ID（字符串格式）
- `userSig`：腾讯云 IM 签名，有效期 180 天

> **当前状态**：接口已预留但未实现，实际演示使用前端本地存储模拟聊天。

---

## 约定

#### 安全性

1. **敏感参数从 token 获取**
   `sellerId`、`buyerId` 等敏感参数由后端从 JWT token 中解析，前端不要传递

2. **Token 存储**
   使用 `wx.setStorageSync('token', token)` 存储 token

3. **Token 过期处理**
   当接口返回 401 时，需要重新登录

#### 数据格式

1. **价格字段**
   `price` 字段为数字类型，不是字符串

2. **时间格式**
   后端返回的时间格式为 ISO 8601（如 `2026-04-22T10:30:00`）

3. **ID 字段**
   所有 ID 字段均为数字类型

---