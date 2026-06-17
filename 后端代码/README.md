# 校易助（xyz）- 校园二手交易平台

## 项目简介

校易助是一个基于微信小程序的校园二手交易平台，为学生提供便捷的闲置物品交易服务。本项目采用前后端分离架构，后端使用 Spring Boot + MyBatis，前端使用微信小程序。

**项目定位**：软件工程课程教学项目，适合初学者学习 Spring Boot 开发和 SQL 基础。

---

## 技术栈

### 后端
- Java 17
- Spring Boot 3.2.5
- MyBatis 3.0.3（注解方式）
- H2 数据库（内嵌，无需安装）
- JWT（jjwt 0.12.5）
- RestTemplate（用于调用微信 API）

### 前端
- 微信小程序

### 第三方服务
- 微信登录（openid 体系）
- 腾讯云 IM（即时通讯）

---

## 核心功能

- 微信一键登录
- 商品发布与管理
- 商品浏览（分页）
- 商品搜索（关键词模糊匹配）
- 订单创建与管理
- 我的发布/订单查询
- 商品/订单状态更新
- 腾讯云 IM 签名获取（用于前端接入即时聊天）

**不包含的功能**：支付系统、后端聊天系统（使用第三方 IM）、推荐算法

---

## 项目架构

```
src/main/java/com/example/xyzmarket/
├── controller/          # 控制器层（RESTful API）
│   ├── UserController.java
│   ├── ItemController.java
│   ├── OrderController.java
│   └── ImController.java
├── service/             # 业务逻辑层
│   ├── UserService.java
│   ├── ItemService.java
│   ├── OrderService.java
│   ├── ImService.java
│   └── impl/            # 实现类
├── mapper/              # 数据访问层（MyBatis 注解）
│   ├── UserMapper.java
│   ├── ItemMapper.java
│   └── OrderMapper.java
├── entity/              # 实体类
│   ├── User.java
│   ├── Item.java
│   └── Order.java
├── dto/                 # 请求参数对象
│   ├── WxLoginDTO.java
│   ├── ItemDTO.java
│   └── OrderDTO.java
├── vo/                  # 返回对象封装
│   └── PageResult.java
├── config/              # 配置类
│   ├── MyBatisConfig.java
│   ├── WxConfig.java
│   └── SecurityConfig.java
├── interceptor/         # 拦截器
│   └── JwtInterceptor.java
├── util/                # 工具类
│   ├── JwtUtil.java
│   └── HttpClientUtil.java
├── common/              # 通用类
│   ├── Result.java
│   └── ErrorCode.java
└── exception/           # 异常处理
    └── GlobalExceptionHandler.java
```

---

## 数据库设计

### user 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| openid | VARCHAR(64) | 微信唯一标识，唯一索引 |
| nickname | VARCHAR(50) | 昵称 |
| avatar_url | VARCHAR(255) | 头像 URL |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### item 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| title | VARCHAR(100) | 商品标题 |
| description | TEXT | 商品描述 |
| price | DECIMAL(10,2) | 价格 |
| image_url | VARCHAR(255) | 图片 URL |
| seller_id | BIGINT | 卖家 ID |
| status | INT | 状态（0-在售，1-已售出，2-已下架） |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

### orders 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| item_id | BIGINT | 商品 ID |
| buyer_id | BIGINT | 买家 ID |
| seller_id | BIGINT | 卖家 ID |
| status | INT | 状态（0-待确认，1-已完成，2-已取消） |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |

---

## 接口文档

### 认证说明

需要 JWT 认证的接口需在请求头中携带 token：
```
Authorization: Bearer <token>
```

### 用户接口

#### 微信一键登录
```
POST /api/user/wxLogin
Content-Type: application/json

{
  "code": "微信登录返回的 code"
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 1,
    "token": "eyJhbGci...",
    "role": "user"
  }
}
```

### 商品接口

#### 发布商品（需认证）
```
POST /api/item
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "商品标题",
  "description": "商品描述",
  "price": 99.99,
  "imageUrl": "图片URL"
}
```

#### 商品列表（无需认证）
```
GET /api/item/list?page=1&size=10

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100
  }
}
```

#### 搜索商品（无需认证）
```
GET /api/item/search?keyword=自行车&page=1&size=10

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 15
  }
}
```

搜索范围：商品标题和描述，使用 LIKE 模糊匹配。

#### 商品详情（无需认证）
```
GET /api/item/{id}
```

#### 我的发布（需认证）
```
GET /api/item/my
Authorization: Bearer <token>
```

#### 更新商品状态（需认证）
```
PUT /api/item/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 1
}
```

### 订单接口

#### 创建订单（需认证）
```
POST /api/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": 1
}
```

#### 我的订单（需认证）
```
GET /api/order/my
Authorization: Bearer <token>
```

#### 更新订单状态（需认证）
```
PUT /api/order/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 2
}
```

### IM 接口

#### 获取 UserSig（需认证）
```
GET /api/im/getUserSig
Authorization: Bearer <token>

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "123",
    "userSig": "eJw1jdEKgjAYhV8l7Lq0..."
  }
}
```

用于前端初始化腾讯云 IM SDK。`userSig` 有效期 180 天。SDKAppID 在前端配置文件中直接写入，无需从后端获取。

---

## 快速开始

### 1. 环境要求
- JDK 17+
- Maven 3.6+
- IntelliJ IDEA（推荐）

> 无需安装 MySQL，项目使用 H2 内嵌数据库。

### 2. 配置文件
编辑 `src/main/resources/application.yml`：

```yaml
wx:
  appid: 你的微信小程序 appid
  secret: 你的微信小程序 secret

jwt:
  secret: 你的 JWT 密钥（至少 32 字符）
  expiration: 604800000  # 7天，单位毫秒

tencent:
  im:
    sdkAppId: 你的腾讯云 IM SDKAppID
    secretKey: 你的腾讯云 IM SecretKey
```

### 3. 启动项目

**每次启动前务必先停掉旧进程并清除编译缓存：**

```bash
# 1. 进入项目目录
cd d:\软件\后端代码

# 2. 杀掉占用 8080 端口的旧进程（如果有的话）
$p = netstat -ano | findstr ":8080 "; if ($p) { $pid = ($p -split '\s+')[-1]; taskkill /PID $pid /F }

# 3. 清理并启动（clean 清除旧编译缓存，避免修改不生效）
mvn clean spring-boot:run
```

或在 IDEA 中先执行 **Build → Rebuild Project**，然后运行 `XYZMarketApplication`。

### 4. 测试接口
项目启动后，访问 http://localhost:8080

使用 Postman 或 curl 测试接口：
```bash
# 测试商品列表（无需认证）
curl http://localhost:8080/api/item/list?page=1&size=10
```

---

## 开发规范

### 接口设计
- 统一使用 `/api` 前缀
- RESTful 风格（GET 查询、POST 新增、PUT 修改、DELETE 删除）
- 统一返回格式 `Result<T>`

### 安全规范
- 敏感参数（userId、buyerId、sellerId）从 JWT token 获取，不由前端传入
- 密码等敏感信息不在日志中打印
- 所有用户操作需验证权限

### 代码规范
- 使用 MyBatis 注解编写 SQL（@Select、@Insert、@Update、@Delete）
- Service 层方法需有事务注解（如需要）
- Controller 层使用 @Valid 进行参数校验
- 统一异常处理

---

## 微信登录流程

```
1. 小程序调用 wx.login() 获取 code
2. 将 code 发送到后端 /api/user/wxLogin（一键登录）
3. 后端用 code + appid + secret 调用微信服务器获取 openid
4. 后端根据 openid 查询或创建用户，自动生成默认昵称
5. 后端生成 JWT token 返回给小程序
6. 小程序存储 token，后续请求携带 token
```

### 管理员入口

在"我的"页面点击"管理员入口"，输入密码（默认 `admin123`，可在 `application.yml` 中修改）即可切换为管理员。管理员可直接进入管理后台，无需重复验证。

---

## 常见问题

### 数据库连接失败 / H2 表名问题
项目已内嵌 H2 数据库，`application.yml` 中配置了 `DATABASE_TO_LOWER=TRUE` 和 `NON_KEYWORDS=USER` 来解决 `user` 关键字冲突。

如果遇到表找不到或 SQL 语法错误，说明数据库是用旧参数创建的：

```powershell
# 先停止服务，删除旧数据库文件，再重新启动
Remove-Item -Recurse -Force "d:\软件\后端代码\data" -ErrorAction SilentlyContinue
mvn clean spring-boot:run
```

### 项目启动失败 / 端口被占用

```powershell
# 杀掉 8080 端口旧进程
$p = netstat -ano | findstr ":8080 "; if ($p) { $pid = ($p -split '\s+')[-1]; taskkill /PID $pid /F }
# 重新启动
mvn clean spring-boot:run
```

- 检查 JDK 版本是否为 17
- 检查 Maven 依赖是否下载完成
- 查看控制台错误信息

### 代码修改后不生效
旧的 class 文件被缓存了，必须用 `mvn clean` 清除 `target` 目录后再启动。

### 接口返回 401
- 检查请求头是否携带 token
- 检查 token 是否过期
- 检查 JWT 密钥配置是否正确

### SQL 执行失败
- 查看控制台打印的 SQL 语句
- 检查字段名是否匹配
- 检查参数是否正确传递

---

## 学习资源

- [MyBatis 官方文档](https://mybatis.org/mybatis-3/zh/)
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [JWT 介绍](https://jwt.io/introduction)

---

## 项目特点

1. **教学友好**：代码结构清晰，注释完整，适合初学者学习
2. **原生 MyBatis**：使用注解方式编写 SQL，学习 SQL 基础
3. **安全设计**：JWT 认证，敏感参数从 token 获取
4. **前后端分离**：RESTful API，支持多端接入
5. **真实场景**：微信小程序登录，第三方 IM 集成

---

## 许可证

本项目仅用于教学目的。