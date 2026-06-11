-- 高校教材交易系统数据库设计
-- 创建数据库
CREATE DATABASE IF NOT EXISTS textbook_trading_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE textbook_trading_system;

-- 1. 用户表
CREATE TABLE users (
    id VARCHAR(32) PRIMARY KEY COMMENT '用户ID',
    student_id VARCHAR(20) NOT NULL UNIQUE COMMENT '学号',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) NOT NULL COMMENT '手机号（用于线下交易联系）',
    major VARCHAR(100) NOT NULL COMMENT '专业',
    grade VARCHAR(10) NOT NULL COMMENT '年级',
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student' COMMENT '角色',
    status ENUM('normal', 'frozen') NOT NULL DEFAULT 'normal' COMMENT '账户状态',
    approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
    rejection_reason VARCHAR(255) COMMENT '驳回原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_student_id (student_id),
    INDEX idx_approval_status (approval_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2 用户信息变更申请表
CREATE TABLE user_change_requests (
    id VARCHAR(32) PRIMARY KEY COMMENT '申请ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',

    phone VARCHAR(20) COMMENT '申请修改手机号',
    major VARCHAR(100) COMMENT '申请修改专业',
    grade VARCHAR(10) COMMENT '申请修改年级',
    password VARCHAR(255) COMMENT '申请修改密码（加密后）',

    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
    rejection_reason VARCHAR(255) COMMENT '驳回原因',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    INDEX idx_ucr_user_id (user_id),
    INDEX idx_ucr_status (status),
    CONSTRAINT fk_ucr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息变更申请表';

-- 3. 教材表
CREATE TABLE textbooks (
    id VARCHAR(32) PRIMARY KEY COMMENT '教材ID',
    title VARCHAR(200) NOT NULL COMMENT '书名',
    author VARCHAR(100) NOT NULL COMMENT '作者',
    course_name VARCHAR(100) NOT NULL COMMENT '适用课程名称',
    course_code VARCHAR(20) NOT NULL COMMENT '课程代码',
    applicable_major VARCHAR(100) NOT NULL COMMENT '适用专业',
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '价格（0表示免费）',
    book_condition ENUM('95新', '9新', '8新', '7新', '7新以下') NOT NULL COMMENT '新旧程度',
    notes TEXT COMMENT '使用备注',
    seller_id VARCHAR(32) NOT NULL COMMENT '卖家ID',
    seller_name VARCHAR(50) NOT NULL COMMENT '卖家姓名',
    seller_major VARCHAR(100) NOT NULL COMMENT '卖家专业',
    seller_grade VARCHAR(10) NOT NULL COMMENT '卖家年级',
    status ENUM('pending', 'approved', 'rejected', 'sold', 'deleted') NOT NULL DEFAULT 'pending' COMMENT '状态',
    approval_reason VARCHAR(255) COMMENT '审核意见',
    publish_time TIMESTAMP NULL COMMENT '发布时间（审核通过时间）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seller_id (seller_id),
    INDEX idx_course_code (course_code),
    INDEX idx_status (status),
    INDEX idx_publish_time (publish_time),
    FULLTEXT INDEX idx_search (title, author, course_name, applicable_major)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教材表';

-- 4. 教材图片表
CREATE TABLE textbook_images (
    id VARCHAR(32) PRIMARY KEY COMMENT '图片ID',
    textbook_id VARCHAR(32) NOT NULL COMMENT '教材ID',
    image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
    image_type ENUM('cover', 'page') NOT NULL COMMENT '图片类型：封面/内页',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id) ON DELETE CASCADE,
    INDEX idx_textbook_id (textbook_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教材图片表';

-- 5. 课程表（学生选课）
CREATE TABLE courses (
    id VARCHAR(32) PRIMARY KEY COMMENT '课程ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    course_code VARCHAR(20) NOT NULL COMMENT '课程代码',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_code (course_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';

-- 6. 订单表
CREATE TABLE orders (
    id VARCHAR(32) PRIMARY KEY COMMENT '订单ID',
    textbook_id VARCHAR(32) NOT NULL COMMENT '教材ID',
    textbook_title VARCHAR(200) NOT NULL COMMENT '教材名称',
    buyer_id VARCHAR(32) NOT NULL COMMENT '买家ID',
    buyer_name VARCHAR(50) NOT NULL COMMENT '买家姓名',
    buyer_phone VARCHAR(20) NOT NULL COMMENT '买家手机号',
    buyer_major VARCHAR(100) NOT NULL COMMENT '买家专业',
    buyer_grade VARCHAR(10) NOT NULL COMMENT '买家年级',
    seller_id VARCHAR(32) NOT NULL COMMENT '卖家ID',
    seller_name VARCHAR(50) NOT NULL COMMENT '卖家姓名',
    seller_phone VARCHAR(20) NOT NULL COMMENT '卖家手机号',
    seller_major VARCHAR(100) NOT NULL COMMENT '卖家专业',
    seller_grade VARCHAR(10) NOT NULL COMMENT '卖家年级',
    price DECIMAL(10, 2) NOT NULL COMMENT '交易价格',
    meeting_time VARCHAR(100) NOT NULL COMMENT '约定时间',
    meeting_location VARCHAR(200) NOT NULL COMMENT '约定地点',
    status ENUM('waiting_seller_confirm', 'waiting_meeting', 'completed', 'cancelled') NOT NULL DEFAULT 'waiting_seller_confirm' COMMENT '订单状态',
    cancel_reason VARCHAR(255) COMMENT '取消原因',
    buyer_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '买家删除标记（1=已删除）',
    seller_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '卖家删除标记（1=已删除）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 7. 评价表
CREATE TABLE reviews (
    id VARCHAR(32) PRIMARY KEY COMMENT '评价ID',
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    textbook_id VARCHAR(32) NOT NULL COMMENT '教材ID',
    reviewer_id VARCHAR(32) NOT NULL COMMENT '评价人ID',
    reviewer_name VARCHAR(50) NOT NULL COMMENT '评价人姓名',
    reviewee_id VARCHAR(32) NOT NULL COMMENT '被评价人ID',
    reviewee_name VARCHAR(50) NOT NULL COMMENT '被评价人姓名',
    review_type ENUM('buyer_to_seller', 'seller_to_buyer') NOT NULL COMMENT '评价类型：买家评价卖家/卖家评价买家',
    rating INT NOT NULL COMMENT '评分（1-5星）',
    content TEXT COMMENT '评价内容',
    is_anonymous BOOLEAN DEFAULT FALSE COMMENT '是否匿名评价',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_reviewee_id (reviewee_id),
    INDEX idx_review_type (review_type),
    INDEX idx_rating (rating),
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易评价表';

-- 8. 订单提醒表
CREATE TABLE IF NOT EXISTS order_reminders (
    id VARCHAR(32) PRIMARY KEY COMMENT '提醒ID',
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    sender_id VARCHAR(32) NOT NULL COMMENT '发送者ID',
    receiver_id VARCHAR(32) NOT NULL COMMENT '接收者ID',
    content VARCHAR(255) NOT NULL COMMENT '提醒内容',
    is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读：0未读，1已读',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_receiver_read (receiver_id, is_read),
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单提醒表';

-- 9. 登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
    id VARCHAR(32) PRIMARY KEY COMMENT '日志ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    student_id VARCHAR(20) NOT NULL COMMENT '学号',
    user_name VARCHAR(50) NOT NULL COMMENT '用户姓名',
    user_role ENUM('student', 'admin') NOT NULL COMMENT '用户角色',
    login_ip VARCHAR(50) COMMENT '登录IP地址',
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    user_agent VARCHAR(500) COMMENT '浏览器信息',
    login_status ENUM('success', 'failed') NOT NULL DEFAULT 'success' COMMENT '登录状态',
    failure_reason VARCHAR(255) COMMENT '失败原因',
    INDEX idx_user_id (user_id),
    INDEX idx_student_id (student_id),
    INDEX idx_login_time (login_time),
    INDEX idx_login_status (login_status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录日志表';


-- 测试数据插入


-- 1. 插入用户数据
-- 管理员账户
INSERT INTO users (id, student_id, password, name, phone, major, grade, role, status, approval_status)
VALUES ('admin001', '20210001', '$2a$10$/aRzz.sl.rfxfGgk0GEFCe1BZIra.dJrrZOiQ8SSbPv5pWU1Vzxbq', '王五', '13800000000', '数据科学', '2021', 'admin', 'normal', 'approved');

-- 学生账户
INSERT INTO users (id, student_id, password, name, phone, major, grade, role, status, approval_status) VALUES
('user001', '20240001', '$2a$10$LP3Ba6yliCHB054UGWt5se84DtKrN7o2xOJrAHTgnRr1Xybi6JYn6', '张三', '13912345678', '软件工程', '2024', 'student', 'normal', 'approved'),
('user002', '20240002', '$2a$10$LP3Ba6yliCHB054UGWt5se84DtKrN7o2xOJrAHTgnRr1Xybi6JYn6', '李四', '13923456789', '计算机科学与技术', '2024', 'student', 'normal', 'approved'),
('user003', '20230001', '$2a$10$LP3Ba6yliCHB054UGWt5se84DtKrN7o2xOJrAHTgnRr1Xybi6JYn6', '王芳', '13934567890', '人工智能', '2023', 'student', 'normal', 'approved'),
('user004', '20230002', '$2a$10$LP3Ba6yliCHB054UGWt5se84DtKrN7o2xOJrAHTgnRr1Xybi6JYn6', '赵敏', '13945678901', '数据科学', '2023', 'student', 'normal', 'approved'),
('user005', '20220001', '$2a$10$LP3Ba6yliCHB054UGWt5se84DtKrN7o2xOJrAHTgnRr1Xybi6JYn6', '刘洋', '13956789012', '网络工程', '2022', 'student', 'normal', 'approved');

-- 2. 插入教材数据（已审核通过）
INSERT INTO textbooks (id, title, author, course_name, course_code, applicable_major, price, book_condition, notes, seller_id, seller_name, seller_major, seller_grade, status, publish_time) VALUES
-- 张三发布的教材
('tb001', '数据结构与算法分析', 'Mark Allen Weiss', '数据结构', 'CS101', '计算机科学与技术', 45.00, '9新', '经典教材，有少量笔记', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb002', '计算机网络（第7版）', '谢希仁', '计算机网络', 'CS201', '计算机科学与技术', 38.00, '95新', '几乎全新', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb003', '操作系统概念（第9版）', 'Abraham Silberschatz', '操作系统', 'CS202', '计算机科学与技术', 50.00, '8新', '英文原版', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb004', '深入理解计算机系统', 'Randal E. Bryant', '计算机系统', 'CS203', '计算机科学与技术', 60.00, '9新', 'CSAPP经典', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb005', '算法导论（第3版）', 'Thomas H. Cormen', '算法设计', 'CS102', '计算机科学与技术', 0.00, '8新', '免费赠送，算法圣经', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb006', '软件工程导论', '张海藩', '软件工程', 'SE101', '软件工程', 35.00, '9新', '国内经典教材', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb007', '设计模式', 'Erich Gamma', '软件设计', 'SE202', '软件工程', 48.00, '9新', '四人帮经典', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb008', '高等数学（上册）', '同济大学', '高等数学', 'MATH101', '全校通用', 25.00, '9新', '经典教材', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb009', '线性代数', '同济大学', '线性代数', 'MATH201', '全校通用', 20.00, '8新', '国内经典', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),
('tb010', '概率论与数理统计', '浙江大学', '概率统计', 'MATH202', '全校通用', 22.00, '9新', '概率必修', 'user001', '张三', '软件工程', '2024', 'approved', NOW()),

-- 李四发布的教材
('tb011', '编译原理', 'Alfred V. Aho', '编译原理', 'CS301', '计算机科学与技术', 55.00, '7新', '龙书', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb012', '数据库系统概念', 'Abraham Silberschatz', '数据库系统', 'CS204', '计算机科学与技术', 48.00, '9新', '数据库经典', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb013', '计算机组成与设计', 'David A. Patterson', '计算机组成', 'CS205', '计算机科学与技术', 52.00, '8新', '硬件基础', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb014', '现代操作系统', 'Andrew S. Tanenbaum', '操作系统', 'CS202', '计算机科学与技术', 45.00, '9新', '现代OS', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb015', '计算机图形学', 'Peter Shirley', '计算机图形学', 'CS401', '计算机科学与技术', 58.00, '8新', '图形学入门', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb016', '敏捷软件开发', 'Robert C. Martin', '软件开发方法', 'SE201', '软件工程', 42.00, '8新', '敏捷开发', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb017', '重构', 'Martin Fowler', '代码重构', 'SE203', '软件工程', 40.00, '8新', '重构必读', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb018', '代码大全', 'Steve McConnell', '软件构造', 'SE204', '软件工程', 65.00, '9新', '编程百科', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb019', 'C程序设计', '谭浩强', 'C语言程序设计', 'CS001', '计算机科学与技术', 0.00, '7新', '免费赠送', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),
('tb020', 'Java程序设计', '清华大学', 'Java程序设计', 'CS002', '计算机科学与技术', 0.00, '8新', '免费赠送', 'user002', '李四', '计算机科学与技术', '2024', 'approved', NOW()),

-- 王芳发布的教材（人工智能方向）
('tb021', '机器学习', '周志华', '机器学习', 'AI101', '人工智能', 55.00, '9新', '西瓜书', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb022', '深度学习', 'Ian Goodfellow', '深度学习', 'AI201', '人工智能', 68.00, '8新', '花书', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb023', '统计学习方法', '李航', '统计学习', 'AI102', '人工智能', 42.00, '9新', '统计学习经典', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb024', 'Python机器学习', 'Sebastian Raschka', '机器学习实践', 'AI103', '人工智能', 48.00, '8新', 'Python ML', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb025', '模式识别', '边肇祺', '模式识别', 'AI202', '人工智能', 38.00, '7新', '模式识别基础', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb026', '自然语言处理', '宗成庆', '自然语言处理', 'AI301', '人工智能', 50.00, '9新', 'NLP入门', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb027', '计算机视觉', 'Richard Szeliski', '计算机视觉', 'AI302', '人工智能', 58.00, '8新', 'CV经典', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb028', '强化学习', 'Richard S. Sutton', '强化学习', 'AI303', '人工智能', 52.00, '9新', 'RL圣经', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb029', '离散数学', 'Kenneth H. Rosen', '离散数学', 'MATH301', '计算机科学与技术', 45.00, '8新', '计算机数学基础', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),
('tb030', '数值分析', '李庆扬', '数值计算', 'MATH302', '计算机科学与技术', 35.00, '7新', '数值方法', 'user003', '王芳', '人工智能', '2023', 'approved', NOW()),

-- 赵敏发布的教材（数据科学方向）
('tb031', 'Python数据分析', 'Wes McKinney', '数据分析', 'DS101', '数据科学', 45.00, '9新', 'Pandas作者', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb032', '数据挖掘概念与技术', 'Jiawei Han', '数据挖掘', 'DS201', '数据科学', 50.00, '8新', '数据挖掘经典', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb033', '大数据技术原理与应用', '林子雨', '大数据技术', 'DS202', '数据科学', 42.00, '9新', '大数据入门', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb034', 'Spark编程指南', 'Matei Zaharia', '分布式计算', 'DS301', '数据科学', 48.00, '8新', 'Spark官方', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb035', '运筹学', '《运筹学》教材编写组', '运筹学', 'MATH401', '数学与应用数学', 40.00, '9新', '优化理论', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb036', '高等数学（下册）', '同济大学', '高等数学', 'MATH102', '全校通用', 25.00, '9新', '经典教材', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb037', 'UML和模式应用', 'Craig Larman', '软件建模', 'SE205', '软件工程', 38.00, '7新', 'UML教程', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb038', '人月神话', 'Frederick P. Brooks', '项目管理', 'SE301', '软件工程', 30.00, '8新', '项目管理经典', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb039', '软件测试的艺术', 'Glenford J. Myers', '软件测试', 'SE206', '软件工程', 35.00, '9新', '测试入门', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),
('tb040', '英语四级词汇', '新东方', '大学英语', 'ENG401', '全校通用', 0.00, '7新', '免费赠送', 'user004', '赵敏', '数据科学', '2023', 'approved', NOW()),

-- 刘洋发布的教材
('tb041', '大学物理（上册）', '物理教研室', '大学物理', 'PHY101', '物理学', 28.00, '8新', '基础物理', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb042', '大学物理（下册）', '物理教研室', '大学物理', 'PHY102', '物理学', 28.00, '8新', '基础物理', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb043', '量子力学导论', '曾谨言', '量子力学', 'PHY301', '物理学', 45.00, '7新', '量子力学入门', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb044', '无机化学', '大连理工大学', '无机化学', 'CHEM101', '化学', 32.00, '9新', '化学基础', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb045', '有机化学', '高鸿宾', '有机化学', 'CHEM201', '化学', 38.00, '8新', '有机化学经典', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb046', '微观经济学', '平狄克', '微观经济学', 'ECON101', '经济学', 42.00, '9新', '经济学原理', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb047', '宏观经济学', '曼昆', '宏观经济学', 'ECON102', '经济学', 45.00, '8新', '宏观经济经典', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb048', '管理学原理', '斯蒂芬·罗宾斯', '管理学', 'MGT101', '工商管理', 40.00, '9新', '管理学入门', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb049', '市场营销学', '菲利普·科特勒', '市场营销', 'MGT201', '工商管理', 38.00, '8新', '营销圣经', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb050', '会计学原理', '中国人民大学', '会计学', 'ACC101', '会计学', 35.00, '9新', '会计基础', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW()),
('tb051', '财务管理', '中国人民大学', '财务管理', 'FIN201', '金融学', 40.00, '8新', '财务管理经典', 'user005', '刘洋', '网络工程', '2022', 'approved', NOW());

-- 3. 插入课程数据
INSERT INTO courses (id, user_id, course_name, course_code) VALUES
('c001', 'user001', '数据结构', 'CS101'),
('c002', 'user001', '计算机网络', 'CS201'),
('c003', 'user001', '操作系统', 'CS202'),
('c004', 'user002', '数据库系统', 'CS204'),
('c005', 'user002', '操作系统', 'CS202'),
('c006', 'user003', '机器学习', 'AI101'),
('c007', 'user003', '深度学习', 'AI201'),
('c008', 'user004', '数据分析', 'DS101'),
('c009', 'user004', '数据挖掘', 'DS201');

-- 4. 插入订单数据（模拟交易记录）
INSERT INTO orders (id, textbook_id, textbook_title, buyer_id, buyer_name, buyer_phone, buyer_major, buyer_grade, seller_id, seller_name, seller_phone, seller_major, seller_grade, price, meeting_time, meeting_location, status, created_at) VALUES
('o001', 'tb001', '数据结构与算法分析', 'user002', '李四', '13923456789', '计算机科学与技术', '2024', 'user001', '张三', '13912345678', '软件工程', '2024', 45.00, '周一下午 3:00-3:30', '7号宿舍楼大厅', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('o002', 'tb012', '数据库系统概念', 'user003', '王芳', '13934567890', '人工智能', '2023', 'user002', '李四', '13923456789', '计算机科学与技术', '2024', 48.00, '周二上午 10:30-11:00', '图书馆门口', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('o003', 'tb005', '算法导论（第3版）', 'user004', '赵敏', '13945678901', '数据科学', '2023', 'user001', '张三', '13912345678', '软件工程', '2024', 0.00, '周三下午 2:00-2:30', '食堂门口', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 5. 插入评价数据
INSERT INTO reviews (id, order_id, textbook_id, reviewer_id, reviewer_name, reviewee_id, reviewee_name, review_type, rating, content, is_anonymous, created_at) VALUES
-- 订单o001的评价（李四买《数据结构与算法分析》，买卖双方互评）
('r001', 'o001', 'tb001', 'user002', '李四', 'user001', '张三', 'buyer_to_seller', 5, '卖家人很好，书的质量也不错，比描述的还要新，交易很顺利！', FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
('r002', 'o001', 'tb001', 'user001', '张三', 'user002', '李四', 'seller_to_buyer', 5, '买家准时到达，交易很爽快，好评！', FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- 订单o002的评价（王芳买《数据库系统概念》，双方互评）
('r003', 'o002', 'tb012', 'user003', '王芳', 'user002', '李四', 'buyer_to_seller', 4, '书的成色不错，卖家很守时，就是见面地点稍微有点远。', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('r004', 'o002', 'tb012', 'user002', '李四', 'user003', '王芳', 'seller_to_buyer', 5, '交易愉快，买家很nice，推荐！', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- 订单o003的评价（赵敏免费领取《算法导论》）
('r005', 'o003', 'tb005', 'user004', '赵敏', 'user001', '张三', 'buyer_to_seller', 5, '卖家免费赠送，人品超好！书虽然有点旧但内容完整，非常感谢！', FALSE, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
('r006', 'o003', 'tb005', 'user001', '张三', 'user004', '赵敏', 'seller_to_buyer', 5, '买家很有礼貌，希望这本书对你有帮助！', FALSE, DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- 插入教材封面图片
INSERT INTO textbook_images (id, textbook_id, image_url, image_type) VALUES
  ('img_tb001', 'tb001', '/images/book1.jpg', 'cover'),
  ('img_tb002', 'tb002', '/images/book2.jpg', 'cover'),
  ('img_tb003', 'tb003', '/images/book3.jpg', 'cover'),
  ('img_tb004', 'tb004', '/images/book4.jpg', 'cover'),
  ('img_tb005', 'tb005', '/images/book5.jpg', 'cover'),
  ('img_tb006', 'tb006', '/images/book6.jpg', 'cover'),
  ('img_tb007', 'tb007', '/images/book7.jpg', 'cover'),
  ('img_tb008', 'tb008', '/images/book8.jpg', 'cover'),
  ('img_tb009', 'tb009', '/images/book9.jpg', 'cover'),
  ('img_tb010', 'tb010', '/images/book10.jpg', 'cover'),
  ('img_tb011', 'tb011', '/images/book11.jpg', 'cover'),
  ('img_tb012', 'tb012', '/images/book12.jpg', 'cover'),
  ('img_tb013', 'tb013', '/images/book13.jpg', 'cover'),
  ('img_tb014', 'tb014', '/images/book14.jpg', 'cover'),
  ('img_tb015', 'tb015', '/images/book15.jpg', 'cover'),
  ('img_tb016', 'tb016', '/images/book16.jpg', 'cover'),
  ('img_tb017', 'tb017', '/images/book17.jpg', 'cover'),
  ('img_tb018', 'tb018', '/images/book18.jpg', 'cover'),
  ('img_tb019', 'tb019', '/images/book19.jpg', 'cover'),
  ('img_tb020', 'tb020', '/images/book20.jpg', 'cover'),
  ('img_tb021', 'tb021', '/images/book21.jpg', 'cover'),
  ('img_tb022', 'tb022', '/images/book22.jpg', 'cover'),
  ('img_tb023', 'tb023', '/images/book23.jpg', 'cover'),
  ('img_tb024', 'tb024', '/images/book24.jpg', 'cover'),
  ('img_tb025', 'tb025', '/images/book25.jpg', 'cover'),
  ('img_tb026', 'tb026', '/images/book26.jpg', 'cover'),
  ('img_tb027', 'tb027', '/images/book27.jpg', 'cover'),
  ('img_tb028', 'tb028', '/images/book28.jpg', 'cover'),
  ('img_tb029', 'tb029', '/images/book29.jpg', 'cover'),
  ('img_tb030', 'tb030', '/images/book30.jpg', 'cover'),
  ('img_tb031', 'tb031', '/images/book31.jpg', 'cover'),
  ('img_tb032', 'tb032', '/images/book32.jpg', 'cover'),
  ('img_tb033', 'tb033', '/images/book33.jpg', 'cover'),
  ('img_tb034', 'tb034', '/images/book34.jpg', 'cover'),
  ('img_tb035', 'tb035', '/images/book35.jpg', 'cover'),
  ('img_tb036', 'tb036', '/images/book36.jpg', 'cover'),
  ('img_tb037', 'tb037', '/images/book37.jpg', 'cover'),
  ('img_tb038', 'tb038', '/images/book38.jpg', 'cover'),
  ('img_tb039', 'tb039', '/images/book39.jpg', 'cover'),
  ('img_tb040', 'tb040', '/images/book40.jpg', 'cover'),
  ('img_tb041', 'tb041', '/images/book41.jpg', 'cover'),
  ('img_tb042', 'tb042', '/images/book42.jpg', 'cover'),
  ('img_tb043', 'tb043', '/images/book43.jpg', 'cover'),
  ('img_tb044', 'tb044', '/images/book44.jpg', 'cover'),
  ('img_tb045', 'tb045', '/images/book45.jpg', 'cover'),
  ('img_tb046', 'tb046', '/images/book46.jpg', 'cover'),
  ('img_tb047', 'tb047', '/images/book47.jpg', 'cover'),
  ('img_tb048', 'tb048', '/images/book48.jpg', 'cover'),
  ('img_tb049', 'tb049', '/images/book49.jpg', 'cover'),
  ('img_tb050', 'tb050', '/images/book50.jpg', 'cover'),
  ('img_tb051', 'tb051', '/images/book51.jpg', 'cover');
-- 数据插入完成