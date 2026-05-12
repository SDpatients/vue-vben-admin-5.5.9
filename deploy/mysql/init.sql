-- ============================================
-- 律师事务所管理系统 - 数据库初始化脚本
-- ============================================
-- 说明：
-- 后端使用 JPA hibernate.ddl-auto: update 自动建表
-- 此脚本仅负责创建数据库、初始数据和字典配置
-- 表结构由 Spring Boot 启动时自动根据 Entity 类生成
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 创建数据库（如果不存在）
-- ============================================
CREATE DATABASE IF NOT EXISTS `law` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `law`;

-- ============================================
-- 系统初始化数据
-- 注意：tb_user 表由 JPA 自动生成，这里直接插入初始数据
-- ============================================

-- 系统管理员账号（密码需要在 Spring Boot 启动后通过 BCrypt 加密）
-- 默认密码: admin123
-- 建议首次部署后通过后端初始化接口或注册功能创建
-- 如果后端有 DataInitializer，可在此处留空

-- ============================================
-- 字典分类（如果后端有 DictionaryCategory 实体）
-- ============================================
-- INSERT IGNORE INTO `tb_dictionary_category` (`id`, `code`, `name`, `sort`, `status`) VALUES
-- (1, 'case_type', '案件类型', 1, 'ACTIVE'),
-- (2, 'claim_type', '债权类型', 2, 'ACTIVE'),
-- (3, 'document_type', '文档类型', 3, 'ACTIVE');

-- ============================================
-- 系统参数配置
-- ============================================
-- INSERT IGNORE INTO `tb_system_config` (`id`, `config_key`, `config_value`, `description`, `status`) VALUES
-- (1, 'system.name', '法律破产管理系统', '系统名称', 'ACTIVE'),
-- (2, 'system.version', '1.0.0', '系统版本', 'ACTIVE');

SET FOREIGN_KEY_CHECKS = 1;