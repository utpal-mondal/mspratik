CREATE TABLE IF NOT EXISTS `folio` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `folio_no` VARCHAR(32) NOT NULL,
  `amount` DECIMAL(12,2) NULL,
  `bank_payment` DECIMAL(12,2) NULL,
  `date` DATE NOT NULL,
  `remark` TEXT NULL,
  `folio_type` VARCHAR(20) NOT NULL,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_folio_date_folio_no` (`date`, `folio_no`),
  KEY `idx_folio_branch_id` (`branch_id`),
  KEY `idx_folio_date` (`date`),
  CONSTRAINT `fk_folio_branch` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
