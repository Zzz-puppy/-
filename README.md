# 校易助 - 校园二手交易平台

## 项目简介

校易助是一个面向高校学生的校园二手交易微信小程序，采用前后端分离架构。前端包含 13 个页面，后端提供 40+ 个 RESTful API，实现了从商品浏览、下单购买到订单管理的完整交易闭环。

## 主要功能

| 模块 | 功能 |
|------|------|
| :closed_lock_with_key: 用户系统 | 一键登录、个人资料编辑、校园实名认证 |
| :package: 商品模块 | 商品发布、浏览、搜索、商品详情 |
| :speech_balloon: 即时聊天 | 买家与卖家的实时消息沟通 |
| :clipboard: 订单管理 | 下单购买、订单状态跟踪、取消订单 |
| :heart: 收藏功能 | 收藏商品、查看收藏列表 |
| :loudspeaker: 求购系统 | 发布求购信息、浏览求购列表 |
| :police_car: 举报系统 | 商品举报、举报处理 |
| :gear: 管理系统 | 认证审核、用户管理、商品管理、举报管理 |

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | 微信小程序（WXML/WXSS/JS） |
| **后端** | Java Spring Boot 3.2.5 + MyBatis + H2 Database |
| **鉴权** | JWT（JSON Web Token） |
| **工具** | Maven、Git |

## 快速启动

### 环境要求
- JDK 17+
- 微信开发者工具
- Node.js（用于本地图床服务）

### 启动步骤

1. **启动后端**
   ```bash
   cd 后端代码
   # 方式一：双击 start.bat
   # 方式二：命令行执行
   mvn spring-boot:run
   ```
   后端启动后访问 `http://localhost:8080` 验证

2. **启动本地图床**（用于商品图片上传）
   ```bash
   cd local-image-host
   node server.js
   ```

3. **打开前端**
   - 用微信开发者工具打开 `前端代码` 目录
   - 编译运行即可

### 预置测试账号

| 账号 | 密码 | 角色 |
|------|------|------|
| student001 | 123456 | 普通用户 |
| admin | admin123 | 管理员 |

更多测试账号详见 `功能测试清单.md`。

## 项目结构

```
xyz-market/
├── 前端代码/              # 微信小程序前端（13个页面）
├── 后端代码/              # Spring Boot 后端（RESTful API）
│   ├── src/main/java/     # Java 源码
│   ├── docs/              # 后端文档（API、代码说明）
│   └── start.bat          # 一键启动脚本
├── local-image-host/      # 本地图床服务（Node.js）
├── 项目说明文档.md        # 详细项目文档
├── 测试说明.md            # 测试环境配置说明
└── 功能测试清单.md        # 功能测试用例
```

## 项目链接

[github.com/Zzz-puppy/xyz-market](https://github.com/Zzz-puppy/xyz-market)
