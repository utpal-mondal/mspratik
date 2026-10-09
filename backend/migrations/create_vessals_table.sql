-- backend/migrations/create_vessals_table.sql
-- Vessals table (also auto-created by GORM AutoMigrate on server start)

CREATE TABLE IF NOT EXISTS `vessals` (
  `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id`  BIGINT UNSIGNED NULL,
  `name`        VARCHAR(50)  NOT NULL,
  `price`       DECIMAL(15,2) NULL,
  `created_by`  BIGINT       NULL,
  `created_at`  DATETIME(3)  NULL,
  `updated_at`  DATETIME(3)  NULL,
  `deleted_at`  DATETIME(3)  NULL,
  INDEX `idx_vessals_company_id` (`company_id`),
  INDEX `idx_vessals_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
