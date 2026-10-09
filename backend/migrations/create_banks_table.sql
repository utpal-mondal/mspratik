-- backend/migrations/create_banks_table.sql
-- Banks master table (also auto-created by GORM AutoMigrate on server start)

CREATE TABLE IF NOT EXISTS `banks` (
  `id`         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `bank_name`  VARCHAR(100) NOT NULL,
  `created_at` DATETIME(3)  NULL,
  `updated_at` DATETIME(3)  NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- INSERT INTO `banks` (`bank_name`, `created_at`, `updated_at`)
-- SELECT * FROM (
--   SELECT 'State Bank of India' AS bank_name, NOW(3) AS created_at, NOW(3) AS updated_at
--   UNION ALL SELECT 'HDFC Bank', NOW(3), NOW(3)
--   UNION ALL SELECT 'ICICI Bank', NOW(3), NOW(3)
--   UNION ALL SELECT 'Punjab National Bank', NOW(3), NOW(3)
--   UNION ALL SELECT 'Bank of Baroda', NOW(3), NOW(3)
--   UNION ALL SELECT 'Axis Bank', NOW(3), NOW(3)
--   UNION ALL SELECT 'Kotak Mahindra Bank', NOW(3), NOW(3)
--   UNION ALL SELECT 'Canara Bank', NOW(3), NOW(3)
--   UNION ALL SELECT 'Union Bank of India', NOW(3), NOW(3)
--   UNION ALL SELECT 'IDBI Bank', NOW(3), NOW(3)
-- ) AS seed
-- WHERE NOT EXISTS (SELECT 1 FROM `banks`);
