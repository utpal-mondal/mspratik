-- backend/migrations/create_cargos_table.sql
-- Cargos table (also auto-created by GORM AutoMigrate on server start)

CREATE TABLE IF NOT EXISTS `cargos` (
  `id`         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` BIGINT UNSIGNED NULL,
  `cargo_name` VARCHAR(50) NOT NULL,
  `status`     VARCHAR(10) NULL DEFAULT 'active',
  `created_by` BIGINT      NULL,
  `created_at` DATETIME(3) NULL,
  `updated_at` DATETIME(3) NULL,
  `deleted_at` DATETIME(3) NULL,
  INDEX `idx_cargos_company_id` (`company_id`),
  INDEX `idx_cargos_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
