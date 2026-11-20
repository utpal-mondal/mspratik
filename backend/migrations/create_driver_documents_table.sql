-- backend/migrations/create_driver_documents_table.sql
-- Driver documents (also created or updated by GORM AutoMigrate on server start)

CREATE TABLE IF NOT EXISTS `driver_documents` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `driver_id`     BIGINT UNSIGNED NOT NULL,
  `expiry_date`   DATE NULL,
  `document_type` VARCHAR(50) NOT NULL,
  `document_name` VARCHAR(1024) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_driver_documents_driver_id` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `driver_documents`
  MODIFY COLUMN `document_name` VARCHAR(1024) NOT NULL;
