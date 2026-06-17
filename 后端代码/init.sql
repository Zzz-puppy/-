-- 创建数据库
CREATE DATABASE IF NOT EXISTS xyz_market DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xyz_market;

-- 用户表（微信小程序版：使用 openid 替代 username/password）
CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    openid VARCHAR(64) NOT NULL UNIQUE COMMENT '微信 openid',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    student_id VARCHAR(20) COMMENT '学号',
    is_certified TINYINT(1) DEFAULT 0 COMMENT '是否已认证',
    certified_at DATETIME COMMENT '认证时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 商品表
CREATE TABLE item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    title VARCHAR(100) NOT NULL COMMENT '商品标题',
    description TEXT COMMENT '商品描述',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    image_url VARCHAR(255) COMMENT '图片URL',
    seller_id BIGINT NOT NULL COMMENT '发布者ID',
    category_id INT DEFAULT 6 COMMENT '分类ID：1数码 2图书 3生活 4运动 5服装 6其他',
    status INT DEFAULT 0 COMMENT '状态：0在售 1已售出 2已下架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_seller_id (seller_id),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 订单表（新增）
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    item_id BIGINT NOT NULL COMMENT '商品ID',
    buyer_id BIGINT NOT NULL COMMENT '买家ID',
    seller_id BIGINT NOT NULL COMMENT '卖家ID',
    status INT DEFAULT 0 COMMENT '状态：0待确认 1已完成 2已取消',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_buyer (buyer_id),
    INDEX idx_seller (seller_id),
    INDEX idx_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 收藏表
CREATE TABLE favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    item_id BIGINT NOT NULL COMMENT '商品ID',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE INDEX idx_favorite_user_item (user_id, item_id),
    INDEX idx_favorite_user (user_id),
    INDEX idx_favorite_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 举报表
CREATE TABLE report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '举报ID',
    reporter_id BIGINT NOT NULL COMMENT '举报人ID',
    item_id BIGINT NOT NULL COMMENT '被举报商品ID',
    type VARCHAR(20) NOT NULL COMMENT '举报类型: fake/illegal/resale/dispute',
    description VARCHAR(500) COMMENT '举报描述',
    image_urls VARCHAR(1000) COMMENT '截图URL（JSON数组）',
    status VARCHAR(20) DEFAULT 'pending' COMMENT '处理状态: pending/approved/rejected',
    reject_reason VARCHAR(255) COMMENT '驳回原因',
    reviewer_id BIGINT COMMENT '审核人ID',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
    review_time TIMESTAMP COMMENT '审核时间',
    INDEX idx_report_status (status),
    INDEX idx_report_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='举报表';