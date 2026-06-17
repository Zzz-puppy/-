# 代码结构与学习指南

## 一、分层架构

```
前端（微信小程序）
    ↓  HTTP 请求
Controller 层   —— 接收请求，参数校验，返回响应
    ↓
Service 层      —— 业务逻辑
    ↓
Mapper 层       —— 数据库操作（SQL）
    ↓
MySQL 数据库
```

每层只负责自己的事，不越权。Controller 不写 SQL，Mapper 不写业务逻辑。

---

## 二、各文件说明

### 实体类（entity/）

对应数据库表，每个字段对应一列。

**User.java**
```java
@Data
public class User {
    private Long id;
    private String openid;        // 微信唯一标识
    private String nickname;
    private String avatarUrl;     // 对应数据库 avatar_url（自动驼峰转换）
    private String studentId;     // 学号
    private Boolean isCertified;  // 是否已认证
    private LocalDateTime certifiedAt;  // 认证通过时间
    private Integer creditScore;  // 信用分，默认 60
    private Integer completedDeals; // 已完成交易数
    private Integer cancelledDeals; // 取消交易数
    private String role;          // 角色：user/admin
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

注意：Java 属性用驼峰（`avatarUrl`），数据库字段用下划线（`avatar_url`），MyBatis 会自动转换。

---

### DTO（dto/）

DTO = Data Transfer Object，用于接收前端传来的请求参数。

**和 Entity 的区别**：
- Entity 是完整的数据库记录，包含 id、时间戳等
- DTO 只包含本次请求需要的字段

**本项目的 DTO**：

| 文件 | 用途 | 包含字段 |
|------|------|----------|
| `WxLoginDTO.java` | 微信登录 | code, nickname, avatarUrl |
| `ItemDTO.java` | 发布商品 | title, description, price, imageUrl, categoryId |
| `OrderDTO.java` | 创建订单 | itemId |
| `UpdateProfileDTO.java` | 更新用户资料 | nickname, avatarUrl |
| `CertifyDTO.java` | 提交校园认证 | studentId |

**为什么 ItemDTO 没有 sellerId？**

安全考虑：如果前端可以传 sellerId，用户可以伪造成别人发布商品。sellerId 从 JWT token 里取，不信任前端传来的值。同理，OrderDTO 没有 buyerId。

---

### VO（vo/）

VO = Value Object，用于封装返回给前端的数据。

**和 Entity 的区别**：
- Entity 是数据库表的映射，字段与数据库一一对应
- VO 是为前端定制的返回格式，可能包含多个 Entity 的组合或特殊的数据结构

**本项目的 VO**：

**PageResult.java** - 分页结果封装

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {
    private List<T> list;   // 数据列表
    private Long total;     // 总记录数
}
```

**使用场景**：商品列表分页查询

```java
// Service 层返回
PageResult<Item> result = new PageResult<>(items, total);

// Controller 层返回给前端
return Result.success(result);

// 前端收到的数据格式
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100
  }
}
```

前端可以用 `total` 计算总页数：`Math.ceil(total / size)`

**Certification.java** - 认证记录实体

```java
@Data
public class Certification {
    private Long id;
    private Long userId;
    private String studentId;
    private String status;      // pending / approved / rejected
    private String rejectReason;
    private Long reviewerId;
    private LocalDateTime createTime;
    private LocalDateTime reviewTime;
}
```

Certification 表用于记录用户的校园认证申请和审核结果，与 User 表中的 `isCertified` 字段配合使用。

---

### Mapper 层（mapper/）

用 MyBatis 注解直接在接口方法上写 SQL。

#### MyBatis 注解快速参考

```java
// 查询单条记录
@Select("SELECT * FROM user WHERE id = #{id}")
User findById(@Param("id") Long id);

// 条件查询
@Select("SELECT * FROM item WHERE seller_id = #{sellerId} ORDER BY create_time DESC")
List<Item> findBySellerId(@Param("sellerId") Long sellerId);

// 分页查询（两个参数必须用 @Param）
@Select("SELECT * FROM item WHERE status = 0 ORDER BY create_time DESC LIMIT #{offset}, #{size}")
List<Item> findList(@Param("offset") int offset, @Param("size") int size);

// 统计
@Select("SELECT COUNT(*) FROM item WHERE status = 0")
long countItems();

// 插入（@Options 用于获取自增 ID）
@Insert("INSERT INTO user (openid, nickname, avatar_url) VALUES (#{openid}, #{nickname}, #{avatarUrl})")
@Options(useGeneratedKeys = true, keyProperty = "id")
int insert(User user);

// 更新
@Update("UPDATE item SET status = #{status} WHERE id = #{id}")
int updateStatus(@Param("id") Long id, @Param("status") Integer status);
```

**关键点**：
- 一个参数：可以不加 `@Param`
- 多个参数：**必须**加 `@Param`，否则 MyBatis 找不到参数
- 插入后获取自增 ID：加 `@Options(useGeneratedKeys = true, keyProperty = "id")`，之后 `user.getId()` 就有值了

#### SQL 学习路线（按难度）

**⭐ 简单查询**
```sql
SELECT * FROM user WHERE id = #{id}
SELECT * FROM item WHERE id = #{id}
```

**⭐⭐ 条件查询 + 排序**
```sql
SELECT * FROM user WHERE openid = #{openid}
SELECT * FROM item WHERE seller_id = #{sellerId} ORDER BY create_time DESC
```

**⭐⭐⭐ 插入 + 分页**
```sql
INSERT INTO user (openid, nickname) VALUES (#{openid}, #{nickname})
SELECT * FROM item WHERE status = 0 LIMIT #{offset}, #{size}
```

**⭐⭐⭐⭐ 更新 + 统计**
```sql
UPDATE orders SET status = #{status} WHERE id = #{id}
SELECT COUNT(*) FROM item WHERE status = 0
```

---

### Service 层（service/）

调用 Mapper 完成业务逻辑。接口定义在 `service/` 下，实现类在 `service/impl/` 下。

**面向接口编程的好处**：接口定义"做什么"，实现类决定"怎么做"，以后换实现不影响调用方。

**UserServiceImpl 实现思路（微信登录）**：
```
1. 用 code 调用微信 API（HttpClientUtil.code2Session）
2. 获取 openid
3. 用 openid 查询数据库（UserMapper.findByOpenid）
4. 如果用户不存在，创建新用户（UserMapper.insert）
5. 用 userId 生成 JWT token（JwtUtil.generateToken）
6. 返回 userId 和 token
```

**在校验环境**：当 `code` 为 `test_code` 时直接使用固定 openid 跳过微信 API 调用，方便本地开发测试。

**UserServiceImpl 其他方法**：
- `getUserById(id)`：通过 ID 查询用户信息
- `certify(userId, studentId)`：提交校园认证申请，创建 pending 状态的 Certification 记录
- `updateProfile(userId, dto)`：更新用户昵称、头像等个人资料
- `getAllUsers()`：获取所有用户列表（管理员功能）

**ItemServiceImpl 实现思路**：
- `publishItem(dto, sellerId)`：创建 Item 对象，设置 sellerId，调用 insert
- `getItemList(page, size, sortBy)`：计算 offset = (page-1)*size，支持排序（price_asc/price_desc），调用 findList 和 countItems，返回 PageResult 对象
- `updateItemStatus(id, status, userId)`：先查商品验证是否是本人，再更新

**OrderServiceImpl 实现思路**：
- `createOrder(dto, buyerId)`：查商品获取 sellerId，创建 Order 对象，调用 insert
- `getMyOrders(userId)`：同时查买入和卖出的订单
- `updateOrderStatus(orderId, status, userId)`：验证权限后更新状态

**AdminService 实现思路**：
- `getPendingCertifications()`：获取所有待审核的认证申请
- `approveCertification(certId, reviewerId)`：批准认证，更新 Certification 和 User 状态
- `rejectCertification(certId, reviewerId, reason)`：拒绝认证并记录原因
- `getAllUsers()`：获取所有用户列表
- `banItem(itemId, adminId)`：管理员强制下架商品
- `updateUserCreditScore(userId, delta)`：调整用户信用分

**CertificationService 实现思路**：
- `getUserCertificationStatus(userId)`：返回当前用户的认证申请状态

**ImServiceImpl 实现思路**：
- `generateUserSig(userId)`：使用腾讯云 IM 的 TLSSigAPIv2 工具类生成 UserSig
- UserSig 是腾讯云 IM 的身份凭证，有效期 180 天
- 需要配置 SDKAppID 和 SecretKey（从 application.yml 读取）
- 前端用 UserSig 初始化 IM SDK，实现聊天功能

> **当前状态**：实际小程序演示使用本地存储（ChatStore）模拟消息功能，不依赖腾讯云 IM SDK。UserSig 生成接口已预留但未实现。生产环境上线时需：1) 添加腾讯云 IM SDK 依赖；2) 实现 TLSSigAPIv2 生成逻辑；3) 替换前端本地 ChatStore 为 IM SDK。

---

### Controller 层（controller/）

接收 HTTP 请求，调用 Service，返回 `Result<T>`。

#### 如何从 token 获取用户 ID

JWT 拦截器会把 userId 存入请求属性：
```java
request.setAttribute("userId", userId);
```

Controller 中这样取：
```java
Long userId = (Long) request.getAttribute("userId");
```

#### 完整 Controller 方法示例

```java
@PostMapping
public Result<Long> publishItem(@RequestBody @Valid ItemDTO dto, HttpServletRequest request) {
    Long sellerId = (Long) request.getAttribute("userId");  // 从 token 取
    Long itemId = itemService.publishItem(dto, sellerId);
    return Result.success(itemId);
}
```

#### ImController 说明

ImController 提供腾讯云 IM 相关接口：

```java
@GetMapping("/getUserSig")
public Result<Map<String, String>> getUserSig(HttpServletRequest request) {
    Long userId = (Long) request.getAttribute("userId");  // 从 token 取
    String userSig = imService.generateUserSig(userId.toString());
    Map<String, String> data = new HashMap<>();
    data.put("userId", userId.toString());
    data.put("userSig", userSig);
    return Result.success(data);
}
```

前端调用此接口获取 UserSig，用于初始化腾讯云 IM SDK。SDKAppID 在前端配置文件中写死，SecretKey 保存在后端，不暴露给前端。

---

### 工具类（util/）

#### JwtUtil.java

已完整实现，核心方法：

```java
// 生成 token（登录成功后调用）
public String generateToken(Long userId) { ... }

// 从 token 解析 userId（拦截器中调用）
public Long getUserIdFromToken(String token) { ... }

// 验证 token 是否有效
public boolean validateToken(String token) { ... }
```

#### HttpClientUtil.java

已完整实现，调用微信 API 的方法：

```java
// 用 code 换取 openid
public String code2Session(String appid, String secret, String code) {
    // 调用：https://api.weixin.qq.com/sns/jscode2session
    // 参数：appid, secret, js_code, grant_type=authorization_code
    // 返回 JSON，解析其中的 openid 字段
}
```

---

### 拦截器（interceptor/JwtInterceptor.java）

在请求到达 Controller 之前验证 JWT token。

**实现逻辑**：
```
1. 从请求头取 token（通常是 Authorization: Bearer <token>）
2. 验证 token 是否有效（JwtUtil.validateToken）
3. 解析出 userId（JwtUtil.getUserIdFromToken）
4. 把 userId 存入请求属性（request.setAttribute("userId", userId)）
5. 返回 true 表示放行，false 表示拦截
```

**哪些路径需要拦截**：在 `SecurityConfig.java` 中配置，已预设：
- 放行：`/api/user/wxLogin`、`/api/item/list`、`/api/item/{id}` 格式的路径
- 拦截：其余所有 `/api/**` 路径

---

### 配置类（config/）

#### WxConfig.java
读取 `application.yml` 中的微信配置：
```yaml
wx:
  appid: your_appid
  secret: your_secret
```

使用：`@Autowired WxConfig wxConfig;` 然后 `wxConfig.getAppid()`

#### SecurityConfig.java
注册 JwtInterceptor，配置拦截路径。已实现，无需修改。

#### MyBatisConfig.java
开启下划线转驼峰映射。已实现，无需修改。

---

### 通用类（common/）

#### Result.java

所有接口返回统一格式：
```json
{ "code": 200, "message": "success", "data": { ... } }
```

使用：
```java
return Result.success(data);   // 成功
return Result.error("错误信息");  // 失败
```

#### ErrorCode.java

```java
ErrorCode.SUCCESS      // 200
ErrorCode.UNAUTHORIZED // 401
ErrorCode.NOT_FOUND    // 404
```

---

### 异常处理（exception/GlobalExceptionHandler.java）

统一捕获所有未处理的异常，返回统一错误格式，避免程序崩溃后给前端返回 HTML 错误页。

---

## 三、实现状态

以下功能已在代码中完整实现：
- Mapper 层：所有 SQL（UserMapper, ItemMapper, OrderMapper, CertificationMapper）
- 工具类：JwtUtil, HttpClientUtil
- 拦截器：JwtInterceptor
- Service 层：UserService（含 certify/updateProfile）, ItemService, OrderService, AdminService, CertificationService
- Controller 层：UserController（含 5 个接口）, ItemController, OrderController, AdminController, ImController
- 配置类：WxConfig, SecurityConfig, MyBatisConfig

**未实现**：ImServiceImpl.generateUserSig() 为 TODO stub，当前前端使用本地存储模拟聊天。

### 开发参考

核心学习路径（按难度递进）：

---

## 四、微信登录流程详解

```
小程序调用 wx.login()
    ↓ 获得 code（一次性，5分钟有效）
调用后端 POST /api/user/wxLogin，传 code
    ↓
后端用 code + appid + secret 调用微信服务器
    ↓ 获得 openid（用户唯一标识）
用 openid 查数据库
    ↓
存在 → 直接用 / 不存在 → 自动注册
    ↓
生成 JWT token，返回给小程序
    ↓
小程序把 token 存本地，后续请求带上
```

---

## 五、JWT 认证机制

**为什么用 JWT**：

传统 session 方案需要服务器存储会话状态，不适合无状态的 REST API。JWT 把用户信息编码在 token 里，服务器不存状态，验证只需检查签名。

**token 格式**：`header.payload.signature`
- header：加密算法
- payload：存的数据（userId、过期时间）
- signature：用密钥签名，防伪造

**前端使用**：每次请求在 Header 加上：
```
Authorization: Bearer eyJhbGci...
```

---

## 六、常见错误与解决

| 错误信息 | 原因 | 解决 |
|----------|------|------|
| `Parameter 'xxx' not found` | 多参数未加 @Param | 给每个参数加 @Param |
| 插入后 `getId()` 返回 null | 未加 @Options | 加 `@Options(useGeneratedKeys = true, keyProperty = "id")` |
| `Column 'xxx' not found` | 字段名不匹配 | 检查数据库字段名和 Java 属性名 |
| 401 Unauthorized | token 无效或未传 | 检查请求头是否带 token |
| `datasource` 连接失败 | 数据库配置错误 | 检查 application.yml 中的连接信息 |

---

## 七、调试技巧

1. **看 SQL 日志**：`application.yml` 已配置 `log-impl`，控制台会打印完整 SQL
2. **Postman 测试**：先测不需要认证的接口（如 `/api/item/list`），再测需要 token 的
3. **打断点**：在 IDEA 里对 Service/Mapper 方法打断点，观察参数值和返回值
4. **检查数据库**：执行完 SQL 后直接在 MySQL 客户端查看数据是否符合预期