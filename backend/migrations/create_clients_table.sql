-- backend/migrations/create_clients_table.sql
-- Clients table (also auto-created by GORM AutoMigrate on server start)

CREATE TABLE IF NOT EXISTS `clients` (
  `id`             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id`     BIGINT UNSIGNED NULL,
  `client_name`    VARCHAR(50)  NOT NULL,
  `contact_no`     VARCHAR(20)  NULL,
  `email_id`       VARCHAR(50)  NULL,
  `contact_person` VARCHAR(50)  NULL,
  `address_1`      VARCHAR(100) NULL,
  `gstn_no`        VARCHAR(15)  NULL,
  `pan_no`         VARCHAR(10)  NULL,
  `created_by`     BIGINT       NULL,
  `created_at`     DATETIME(3)  NULL,
  `updated_at`     DATETIME(3)  NULL,
  `deleted_at`     DATETIME(3)  NULL,
  INDEX `idx_clients_company_id` (`company_id`),
  INDEX `idx_clients_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
