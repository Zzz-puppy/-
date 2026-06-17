-- =====================================
-- 校易助 - 数据库初始化脚本（含测试数据）
-- =====================================

-- user 在 H2 中是保留关键字，用反引号避免语法错误（配合 MODE=MySQL）
CREATE TABLE IF NOT EXISTS `user` (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(64) NOT NULL UNIQUE,
    nickname VARCHAR(50),
    avatar_url VARCHAR(255),
    student_id VARCHAR(20),
    is_certified BOOLEAN DEFAULT FALSE,
    grade VARCHAR(50),
    certified_at TIMESTAMP,
    credit_score INT DEFAULT 60,
    completed_deals INT DEFAULT 0,
    cancelled_deals INT DEFAULT 0,
    role VARCHAR(10) DEFAULT 'user',
    admin_login_attempts INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_openid ON `user` (openid);

-- 商品表
CREATE TABLE IF NOT EXISTS item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    seller_id BIGINT NOT NULL,
    category_id INT DEFAULT 6,
    status INT DEFAULT 0,
    pickup BOOLEAN DEFAULT FALSE,
    tradeable BOOLEAN DEFAULT FALSE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_seller_id ON item (seller_id);
CREATE INDEX IF NOT EXISTS idx_status ON item (status);
CREATE INDEX IF NOT EXISTS idx_create_time ON item (create_time);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    status INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_buyer ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_seller ON orders (seller_id);
-- 允许 buyer_id 为 NULL（用于"我的发布→售出"自动创建的订单记录）
ALTER TABLE orders ALTER COLUMN buyer_id SET NULL;
CREATE INDEX IF NOT EXISTS idx_item ON orders (item_id);

-- 认证表
CREATE TABLE IF NOT EXISTS certification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    reject_reason VARCHAR(255),
    reviewer_id BIGINT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_time TIMESTAMP
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorite_user_item ON favorite (user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_favorite_user ON favorite (user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_item ON favorite (item_id);

-- 举报表
CREATE TABLE IF NOT EXISTS report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reporter_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    image_urls VARCHAR(1000),
    status VARCHAR(20) DEFAULT 'pending',
    reject_reason VARCHAR(255),
    reviewer_id BIGINT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_time TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_report_status ON report (status);
CREATE INDEX IF NOT EXISTS idx_report_item ON report (item_id);

-- 通知表
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content VARCHAR(500),
    related_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notification_user ON notification (user_id, is_read);

-- 求购表
CREATE TABLE IF NOT EXISTS wanted (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    category_id INT,
    budget DECIMAL(10,2),
    status INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wanted_user ON wanted (user_id);
CREATE INDEX IF NOT EXISTS idx_wanted_status ON wanted (status);

-- =====================================
-- 预置管理员账户
-- =====================================
INSERT INTO `user` (openid, nickname, role, credit_score, create_time, update_time)
SELECT 'admin_fixed', '管理员', 'admin', 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'admin_fixed');

-- 每次启动时重置管理员登录尝试次数（解锁管理员入口）
UPDATE `user` SET admin_login_attempts = 0 WHERE openid = 'admin_fixed';

-- 每次启动时重置测试用户的认证状态
UPDATE `user` SET is_certified = NULL, student_id = NULL, grade = NULL, certified_at = NULL
WHERE openid = 'test_openid_fixed_user_001';
DELETE FROM certification WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001');

-- =====================================
-- 固定测试用户（一键登录使用此账号）
-- =====================================
INSERT INTO `user` (openid, nickname, credit_score, role, create_time, update_time)
SELECT 'test_openid_fixed_user_001', '测试用户', 60, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'test_openid_fixed_user_001');

-- =====================================
-- 测试用户数据（仅在首次启动时插入）
-- =====================================
INSERT INTO `user` (openid, nickname, student_id, is_certified, grade, certified_at, credit_score, completed_deals, cancelled_deals, role, create_time, update_time)
SELECT 'test_user_1', '张三', '2024001', TRUE, '大三', CURRENT_TIMESTAMP, 85, 3, 0, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'test_user_1');

INSERT INTO `user` (openid, nickname, credit_score, role, create_time, update_time)
SELECT 'test_user_2', '李四', 70, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'test_user_2');

INSERT INTO `user` (openid, nickname, student_id, is_certified, grade, certified_at, credit_score, completed_deals, cancelled_deals, role, create_time, update_time)
SELECT 'test_user_3', '王五', '2024003', TRUE, '大二', CURRENT_TIMESTAMP, 75, 1, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'test_user_3');

INSERT INTO `user` (openid, nickname, credit_score, role, create_time, update_time)
SELECT 'test_user_4', '赵六', 65, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'test_user_4');

INSERT INTO `user` (openid, nickname, student_id, is_certified, grade, certified_at, credit_score, completed_deals, cancelled_deals, role, create_time, update_time)
SELECT 'test_user_5', '孙七', '2024005', TRUE, '大四', CURRENT_TIMESTAMP, 80, 5, 1, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'test_user_5');

-- =====================================
-- 测试认证数据
-- =====================================
INSERT INTO certification (user_id, student_id, email, status, reviewer_id, create_time, review_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_1'), '2024001', 'zhangsan@campus.edu.cn', 'approved', (SELECT id FROM `user` WHERE openid = 'admin_fixed'), CURRENT_TIMESTAMP - 10, CURRENT_TIMESTAMP - 9
WHERE NOT EXISTS (SELECT 1 FROM certification WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_1'));

INSERT INTO certification (user_id, student_id, email, status, create_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_2'), '2024002', 'lisi@campus.edu.cn', 'pending', CURRENT_TIMESTAMP - 5
WHERE NOT EXISTS (SELECT 1 FROM certification WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_2'));

INSERT INTO certification (user_id, student_id, email, status, reviewer_id, create_time, review_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_3'), '2024003', 'wangwu@campus.edu.cn', 'approved', (SELECT id FROM `user` WHERE openid = 'admin_fixed'), CURRENT_TIMESTAMP - 8, CURRENT_TIMESTAMP - 7
WHERE NOT EXISTS (SELECT 1 FROM certification WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_3'));

INSERT INTO certification (user_id, student_id, email, status, reject_reason, reviewer_id, create_time, review_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_4'), '2024004', 'zhaoliu@campus.edu.cn', 'rejected', '学号与姓名不匹配，请核实后再提交', (SELECT id FROM `user` WHERE openid = 'admin_fixed'), CURRENT_TIMESTAMP - 6, CURRENT_TIMESTAMP - 5
WHERE NOT EXISTS (SELECT 1 FROM certification WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_4'));

INSERT INTO certification (user_id, student_id, email, status, reviewer_id, create_time, review_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_5'), '2024005', 'sunqi@campus.edu.cn', 'approved', (SELECT id FROM `user` WHERE openid = 'admin_fixed'), CURRENT_TIMESTAMP - 12, CURRENT_TIMESTAMP - 11
WHERE NOT EXISTS (SELECT 1 FROM certification WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_5'));

-- =====================================
-- 测试商品数据
-- 类别: 1=数码, 2=图书, 3=生活, 4=运动, 5=服装, 6=其他
-- 状态: 0=在售, 1=已售出, 2=已下架
-- =====================================

-- 张三的 iPhone 14（在售）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT 'iPhone 14 128GB 蓝色', '自用iPhone 14，2025年9月购入，电池健康86%，带原装充电器和数据线，屏幕贴膜使用无划痕。', 3800.00, (SELECT id FROM `user` WHERE openid = 'test_user_1'), 1, 0, CURRENT_TIMESTAMP - 20, CURRENT_TIMESTAMP - 20
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = 'iPhone 14 128GB 蓝色' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_1'));

-- 张三的 二手自行车（在售）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '永久牌山地自行车 21速', '毕业季出，骑了两年，变速顺畅，刹车灵敏，前后灯齐全。适合校园代步。需自提。', 350.00, (SELECT id FROM `user` WHERE openid = 'test_user_1'), 3, 0, CURRENT_TIMESTAMP - 15, CURRENT_TIMESTAMP - 15
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '永久牌山地自行车 21速' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_1'));

-- 张三的 高等数学（在售）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '高等数学（同济第七版）上册', '全新，没怎么翻过，考研用不上了。附赠配套习题解答。', 25.00, (SELECT id FROM `user` WHERE openid = 'test_user_1'), 2, 0, CURRENT_TIMESTAMP - 10, CURRENT_TIMESTAMP - 10
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '高等数学（同济第七版）上册' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_1'));

-- 李四的 羽毛球拍（在售）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '尤尼克斯羽毛球拍 NR-8', '买来打了两次，不太适合新手，拍线完好，送一筒羽毛球。', 180.00, (SELECT id FROM `user` WHERE openid = 'test_user_2'), 4, 0, CURRENT_TIMESTAMP - 8, CURRENT_TIMESTAMP - 8
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '尤尼克斯羽毛球拍 NR-8' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_2'));

-- 李四的 牛仔裤（在售）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT 'Levis 501 经典牛仔裤 28码', '去年双十一购入，穿了两三次，版型很好，偏修身款。', 299.00, (SELECT id FROM `user` WHERE openid = 'test_user_2'), 5, 0, CURRENT_TIMESTAMP - 6, CURRENT_TIMESTAMP - 6
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = 'Levis 501 经典牛仔裤 28码' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_2'));

-- 王五的 电饭煲（在售）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '美的电饭煲 3L 智能预约', '宿舍用了一年，功能正常，内胆不粘涂层完好。搬家带不走便宜出。', 120.00, (SELECT id FROM `user` WHERE openid = 'test_user_3'), 3, 0, CURRENT_TIMESTAMP - 12, CURRENT_TIMESTAMP - 12
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '美的电饭煲 3L 智能预约' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_3'));

-- 王五的 数据结构（在售）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '数据结构（C语言版）严蔚敏', '计算机专业必修课教材，九成新，有少量笔记标注。', 20.00, (SELECT id FROM `user` WHERE openid = 'test_user_3'), 2, 0, CURRENT_TIMESTAMP - 7, CURRENT_TIMESTAMP - 7
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '数据结构（C语言版）严蔚敏' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_3'));

-- 赵六的 吉他（已售出）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '卡马D1C 41寸民谣吉他 原木色', '入门级吉他，弦距适中适合新手，带琴包和变调夹。', 200.00, (SELECT id FROM `user` WHERE openid = 'test_user_4'), 6, 1, CURRENT_TIMESTAMP - 18, CURRENT_TIMESTAMP - 3
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '卡马D1C 41寸民谣吉他 原木色' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_4'));

-- 孙七的 跑步机（已售出）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '小米走步机 可折叠', '毕业出，买了半年使用频率不高，可折叠收纳，APP控制。', 600.00, (SELECT id FROM `user` WHERE openid = 'test_user_5'), 4, 1, CURRENT_TIMESTAMP - 25, CURRENT_TIMESTAMP - 4
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '小米走步机 可折叠' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_5'));

-- 孙七的 蓝牙耳机（在售）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT 'AirPods Pro 2 全新未拆封', '朋友送的，已经有同款了，全新未拆封官网正品。', 1500.00, (SELECT id FROM `user` WHERE openid = 'test_user_5'), 1, 0, CURRENT_TIMESTAMP - 3, CURRENT_TIMESTAMP - 3
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = 'AirPods Pro 2 全新未拆封' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_5'));

-- 张三的 台灯（已下架）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '飞利浦LED台灯 护眼', '用了半年，灯管有点暗了换个新的。', 40.00, (SELECT id FROM `user` WHERE openid = 'test_user_1'), 3, 2, CURRENT_TIMESTAMP - 22, CURRENT_TIMESTAMP - 14
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '飞利浦LED台灯 护眼' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_user_1'));

-- 测试用户的 笔记本电脑（在售，用于测试"我卖出的"待确认订单）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT 'MacBook Pro M2 13寸', '自用办公本，M2芯片16G内存，电池循环50次，运行流畅。', 6500.00, (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001'), 1, 0, CURRENT_TIMESTAMP - 15, CURRENT_TIMESTAMP - 15
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = 'MacBook Pro M2 13寸' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001'));

-- 测试用户的 显示器（已售出，用于测试"已售"标签）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT '戴尔27寸4K显示器 U2723QX', '色彩准确，适合设计和影音，已出给校友。', 2500.00, (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001'), 1, 1, CURRENT_TIMESTAMP - 30, CURRENT_TIMESTAMP - 5
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = '戴尔27寸4K显示器 U2723QX' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001'));

-- 为上述已售显示器创建订单记录，使其同步显示在"我卖出的"中
INSERT INTO orders (item_id, buyer_id, seller_id, status, create_time, update_time)
SELECT (SELECT id FROM item WHERE title = '戴尔27寸4K显示器 U2723QX' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001')), NULL, (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001'), 1, CURRENT_TIMESTAMP - 5, CURRENT_TIMESTAMP - 5
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE item_id = (SELECT id FROM item WHERE title = '戴尔27寸4K显示器 U2723QX' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001')) AND buyer_id IS NULL);

-- 测试用户的 键盘（已下架，用于测试"已下架"标签）
INSERT INTO item (title, description, price, seller_id, category_id, status, create_time, update_time)
SELECT 'Keychron K2 机械键盘 茶轴', '87键无线机械键盘，茶轴手感好，买了HHKB所以出掉。', 280.00, (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001'), 1, 2, CURRENT_TIMESTAMP - 20, CURRENT_TIMESTAMP - 12
WHERE NOT EXISTS (SELECT 1 FROM item WHERE title = 'Keychron K2 机械键盘 茶轴' AND seller_id = (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001'));

-- =====================================
-- 测试订单数据
-- 状态: 0=待确认, 1=已完成, 2=已取消
-- =====================================

-- 李四 买 张三的 iPhone 14（待确认）
INSERT INTO orders (item_id, buyer_id, seller_id, status, create_time, update_time)
SELECT (SELECT id FROM item WHERE title = 'iPhone 14 128GB 蓝色'), (SELECT id FROM `user` WHERE openid = 'test_user_2'), (SELECT id FROM `user` WHERE openid = 'test_user_1'), 0, CURRENT_TIMESTAMP - 3, CURRENT_TIMESTAMP - 3
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE item_id = (SELECT id FROM item WHERE title = 'iPhone 14 128GB 蓝色') AND buyer_id = (SELECT id FROM `user` WHERE openid = 'test_user_2'));

-- 赵六 买 张三的 自行车（已完成 - 张三确认售出，双方加信用分）
INSERT INTO orders (item_id, buyer_id, seller_id, status, create_time, update_time)
SELECT (SELECT id FROM item WHERE title = '永久牌山地自行车 21速'), (SELECT id FROM `user` WHERE openid = 'test_user_4'), (SELECT id FROM `user` WHERE openid = 'test_user_1'), 1, CURRENT_TIMESTAMP - 7, CURRENT_TIMESTAMP - 5
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE item_id = (SELECT id FROM item WHERE title = '永久牌山地自行车 21速') AND buyer_id = (SELECT id FROM `user` WHERE openid = 'test_user_4'));

-- 王五 买 孙七的 跑步机（已取消）
INSERT INTO orders (item_id, buyer_id, seller_id, status, create_time, update_time)
SELECT (SELECT id FROM item WHERE title = '小米走步机 可折叠'), (SELECT id FROM `user` WHERE openid = 'test_user_3'), (SELECT id FROM `user` WHERE openid = 'test_user_5'), 2, CURRENT_TIMESTAMP - 10, CURRENT_TIMESTAMP - 8
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE item_id = (SELECT id FROM item WHERE title = '小米走步机 可折叠') AND buyer_id = (SELECT id FROM `user` WHERE openid = 'test_user_3'));

-- 张三 买 王五的 电饭煲（已完成）
INSERT INTO orders (item_id, buyer_id, seller_id, status, create_time, update_time)
SELECT (SELECT id FROM item WHERE title = '美的电饭煲 3L 智能预约'), (SELECT id FROM `user` WHERE openid = 'test_user_1'), (SELECT id FROM `user` WHERE openid = 'test_user_3'), 1, CURRENT_TIMESTAMP - 5, CURRENT_TIMESTAMP - 4
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE item_id = (SELECT id FROM item WHERE title = '美的电饭煲 3L 智能预约') AND buyer_id = (SELECT id FROM `user` WHERE openid = 'test_user_1'));

-- 李四 买 赵六的 吉他（待确认）
INSERT INTO orders (item_id, buyer_id, seller_id, status, create_time, update_time)
SELECT (SELECT id FROM item WHERE title = '卡马D1C 41寸民谣吉他 原木色'), (SELECT id FROM `user` WHERE openid = 'test_user_2'), (SELECT id FROM `user` WHERE openid = 'test_user_4'), 0, CURRENT_TIMESTAMP - 2, CURRENT_TIMESTAMP - 2
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE item_id = (SELECT id FROM item WHERE title = '卡马D1C 41寸民谣吉他 原木色') AND buyer_id = (SELECT id FROM `user` WHERE openid = 'test_user_2'));

-- =====================================
-- 测试收藏数据
-- =====================================
INSERT INTO favorite (user_id, item_id, create_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_2'), (SELECT id FROM item WHERE title = 'iPhone 14 128GB 蓝色'), CURRENT_TIMESTAMP - 4
WHERE NOT EXISTS (SELECT 1 FROM favorite WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_2') AND item_id = (SELECT id FROM item WHERE title = 'iPhone 14 128GB 蓝色'));

INSERT INTO favorite (user_id, item_id, create_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_3'), (SELECT id FROM item WHERE title = '永久牌山地自行车 21速'), CURRENT_TIMESTAMP - 6
WHERE NOT EXISTS (SELECT 1 FROM favorite WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_3') AND item_id = (SELECT id FROM item WHERE title = '永久牌山地自行车 21速'));

INSERT INTO favorite (user_id, item_id, create_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_2'), (SELECT id FROM item WHERE title = '美的电饭煲 3L 智能预约'), CURRENT_TIMESTAMP - 3
WHERE NOT EXISTS (SELECT 1 FROM favorite WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_2') AND item_id = (SELECT id FROM item WHERE title = '美的电饭煲 3L 智能预约'));

INSERT INTO favorite (user_id, item_id, create_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_4'), (SELECT id FROM item WHERE title = 'AirPods Pro 2 全新未拆封'), CURRENT_TIMESTAMP - 1
WHERE NOT EXISTS (SELECT 1 FROM favorite WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_4') AND item_id = (SELECT id FROM item WHERE title = 'AirPods Pro 2 全新未拆封'));

INSERT INTO favorite (user_id, item_id, create_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_5'), (SELECT id FROM item WHERE title = '高等数学（同济第七版）上册'), CURRENT_TIMESTAMP - 2
WHERE NOT EXISTS (SELECT 1 FROM favorite WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_user_5') AND item_id = (SELECT id FROM item WHERE title = '高等数学（同济第七版）上册'));

-- =====================================
-- 测试求购数据
-- 状态: 0=进行中, 1=已成交, 2=已取消
-- =====================================
INSERT INTO wanted (user_id, title, description, category_id, budget, status, create_time, update_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_2'), '求购二手iPad', '想买个iPad看网课做笔记，预算3000以内，希望电池健康85%以上', 1, 3000.00, 0, CURRENT_TIMESTAMP - 5, CURRENT_TIMESTAMP - 5
WHERE NOT EXISTS (SELECT 1 FROM wanted WHERE title = '求购二手iPad' AND user_id = (SELECT id FROM `user` WHERE openid = 'test_user_2'));

INSERT INTO wanted (user_id, title, description, category_id, budget, status, create_time, update_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_3'), '求购考研英语资料', '2027考研，求购考研英语词汇书和真题，有笔记也行', 2, 100.00, 0, CURRENT_TIMESTAMP - 3, CURRENT_TIMESTAMP - 3
WHERE NOT EXISTS (SELECT 1 FROM wanted WHERE title = '求购考研英语资料' AND user_id = (SELECT id FROM `user` WHERE openid = 'test_user_3'));

INSERT INTO wanted (user_id, title, description, category_id, budget, status, create_time, update_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_4'), '求购二手电风扇', '宿舍没空调想买个风扇，台扇或落地扇都行，价格不要太贵', 3, 80.00, 0, CURRENT_TIMESTAMP - 2, CURRENT_TIMESTAMP - 2
WHERE NOT EXISTS (SELECT 1 FROM wanted WHERE title = '求购二手电风扇' AND user_id = (SELECT id FROM `user` WHERE openid = 'test_user_4'));

INSERT INTO wanted (user_id, title, description, category_id, budget, status, create_time, update_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_5'), '求购羽毛球拍', '中级水平，求购一支进阶拍，预算500以内', 4, 500.00, 0, CURRENT_TIMESTAMP - 1, CURRENT_TIMESTAMP - 1
WHERE NOT EXISTS (SELECT 1 FROM wanted WHERE title = '求购羽毛球拍' AND user_id = (SELECT id FROM `user` WHERE openid = 'test_user_5'));

-- =====================================
-- 测试举报数据
-- =====================================
INSERT INTO report (reporter_id, item_id, type, description, status, create_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_4'), (SELECT id FROM item WHERE title = '尤尼克斯羽毛球拍 NR-8'), '虚假信息', '这个羽毛球拍图片看起来很旧但描述说只打了两次，与实际不符', 'pending', CURRENT_TIMESTAMP - 4
WHERE NOT EXISTS (SELECT 1 FROM report WHERE reporter_id = (SELECT id FROM `user` WHERE openid = 'test_user_4') AND item_id = (SELECT id FROM item WHERE title = '尤尼克斯羽毛球拍 NR-8'));

INSERT INTO report (reporter_id, item_id, type, description, status, create_time)
SELECT (SELECT id FROM `user` WHERE openid = 'test_user_2'), (SELECT id FROM item WHERE title = '美的电饭煲 3L 智能预约'), '欺诈', '这个电饭煲说九成新但实际内胆有划痕，描述不实', 'pending', CURRENT_TIMESTAMP - 3
WHERE NOT EXISTS (SELECT 1 FROM report WHERE reporter_id = (SELECT id FROM `user` WHERE openid = 'test_user_2') AND item_id = (SELECT id FROM item WHERE title = '美的电饭煲 3L 智能预约'));

-- =====================================
-- 每次启动时重置一键登录测试用户的认证状态（方便测试认证功能）
-- =====================================
UPDATE `user`
SET is_certified = NULL, student_id = NULL, grade = NULL, certified_at = NULL
WHERE openid = 'test_openid_fixed_user_001';

DELETE FROM certification
WHERE user_id = (SELECT id FROM `user` WHERE openid = 'test_openid_fixed_user_001');