-- backend/migrations/create_routes_table.sql
-- Routes table (also auto-created by GORM AutoMigrate on server start)

CREATE TABLE IF NOT EXISTS `routes` (
  `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id`  BIGINT UNSIGNED NULL,
  `client_id`   BIGINT UNSIGNED NULL,
  `client_name` VARCHAR(50)  NULL,
  `start_name`  VARCHAR(100) NULL,
  `start_lat`   VARCHAR(20)  NULL,
  `start_long`  VARCHAR(20)  NULL,
  `via_name`    VARCHAR(100) NULL,
  `via_lat`     VARCHAR(20)  NULL,
  `via_long`    VARCHAR(20)  NULL,
  `end_name`    VARCHAR(100) NULL,
  `end_lat`     VARCHAR(20)  NULL,
  `end_long`    VARCHAR(20)  NULL,
  `created_by`  BIGINT       NULL,
  `created_at`  DATETIME(3)  NULL,
  `updated_at`  DATETIME(3)  NULL,
  `deleted_at`  DATETIME(3)  NULL,
  INDEX `idx_routes_company_id` (`company_id`),
  INDEX `idx_routes_client_id` (`client_id`),
  INDEX `idx_routes_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_routes_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
