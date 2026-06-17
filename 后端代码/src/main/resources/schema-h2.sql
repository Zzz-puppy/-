-- user 在 H2 中是保留关键字，这里用 MySQL 风格反引号避免语法错误（配合 MODE=MySQL）
CREATE TABLE IF NOT EXISTS `user` (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(64) NOT NULL UNIQUE,
    nickname VARCHAR(50),
    avatar_url VARCHAR(255),
    student_id VARCHAR(20),
    is_certified TINYINT(1) DEFAULT 0,
    certified_at DATETIME,
    grade VARCHAR(50),
    credit_score INT DEFAULT 60,
    completed_deals INT DEFAULT 0,
    cancelled_deals INT DEFAULT 0,
    role VARCHAR(10) DEFAULT 'user',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_openid ON `user` (openid);

CREATE TABLE IF NOT EXISTS item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    seller_id BIGINT NOT NULL,
    category_id INT DEFAULT 6,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seller_id ON item (seller_id);
CREATE INDEX IF NOT EXISTS idx_status ON item (status);
CREATE INDEX IF NOT EXISTS idx_create_time ON item (create_time);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    status INT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_buyer ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_seller ON orders (seller_id);
CREATE INDEX IF NOT EXISTS idx_item ON orders (item_id);

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

CREATE TABLE IF NOT EXISTS favorite (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorite_user_item ON favorite (user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_favorite_user ON favorite (user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_item ON favorite (item_id);

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