-- backend/migrations/create_pumps_table.sql
-- Pumps table (also auto-created by GORM AutoMigrate on server start)

CREATE TABLE IF NOT EXISTS `pumps` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id`      BIGINT UNSIGNED NULL,
  `pump_name`       VARCHAR(50)  NOT NULL,
  `contact_no`      VARCHAR(20)  NULL,
  `email_id`        VARCHAR(50)  NULL,
  `contact_person`  VARCHAR(50)  NULL,
  `address_1`       VARCHAR(100) NULL,
  `address_2`       VARCHAR(100) NULL,
  `address_3`       VARCHAR(100) NULL,
  `opening_balance` DECIMAL(15,2) NULL,
  `gstn_no`         VARCHAR(15)  NULL,
  `pan_no`          VARCHAR(10)  NULL,
  `banker_name`     VARCHAR(50)  NULL,
  `branch_name`     VARCHAR(50)  NULL,
  `account_no`      VARCHAR(20)  NULL,
  `ifsc_code`       VARCHAR(11)  NULL,
  `created_by`      BIGINT       NULL,
  `created_at`      DATETIME(3)  NULL,
  `updated_at`      DATETIME(3)  NULL,
  `deleted_at`      DATETIME(3)  NULL,
  INDEX `idx_pumps_company_id` (`company_id`),
  INDEX `idx_pumps_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- If the `pumps` table was already created with the old columns, run:
-- ALTER TABLE `pumps` DROP FOREIGN KEY `fk_pumps_bank`, DROP COLUMN `bank_id`, DROP COLUMN `previous_due`;
