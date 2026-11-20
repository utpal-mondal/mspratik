-- backend/migrations/create_vehicle_documents_table.sql
-- Vehicle documents table: stores uploaded documents (RC book, insurance, PUC, etc.) per vehicle

CREATE TABLE IF NOT EXISTS `vehicle_documents` (
  `id`             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id`     BIGINT UNSIGNED NULL,
  `vehicle_id`     BIGINT UNSIGNED NOT NULL,
  `vehicle_number` VARCHAR(20)  NOT NULL,
  `document_type`  VARCHAR(50)  NOT NULL,
  `expiry_date`    DATE         NULL,
  `document_name`  VARCHAR(255) NOT NULL,
  `file_path`      VARCHAR(500) NOT NULL,
  `created_by`     BIGINT       NULL,
  `created_at`     DATETIME(3)  NULL,
  `updated_at`     DATETIME(3)  NULL,
  `deleted_at`     DATETIME(3)  NULL,
  INDEX `idx_vehicle_documents_vehicle_id` (`vehicle_id`),
  INDEX `idx_vehicle_documents_company_id` (`company_id`),
  INDEX `idx_vehicle_documents_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
