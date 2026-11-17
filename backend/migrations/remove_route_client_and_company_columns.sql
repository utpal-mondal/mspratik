CREATE TABLE IF NOT EXISTS `route_companies` (
  `route_id`   BIGINT UNSIGNED NOT NULL,
  `company_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`route_id`, `company_id`),
  INDEX `idx_route_companies_company_route` (`company_id`, `route_id`),
  CONSTRAINT `fk_route_companies_route`
    FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET @company_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'routes'
    AND COLUMN_NAME = 'company_id'
);
SET @copy_route_companies_sql = IF(
  @company_column_exists > 0,
  'INSERT IGNORE INTO `route_companies` (`route_id`, `company_id`) SELECT `id`, `company_id` FROM `routes` WHERE `company_id` IS NOT NULL',
  'SELECT 1'
);
PREPARE copy_route_companies_stmt FROM @copy_route_companies_sql;
EXECUTE copy_route_companies_stmt;
DEALLOCATE PREPARE copy_route_companies_stmt;

SET @route_legacy_fk_clauses = (
  SELECT GROUP_CONCAT(
    DISTINCT CONCAT('DROP FOREIGN KEY `', CONSTRAINT_NAME, '`')
    SEPARATOR ', '
  )
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'routes'
    AND COLUMN_NAME IN ('company_id', 'client_id')
    AND REFERENCED_TABLE_NAME IS NOT NULL
);
SET @drop_route_legacy_fks_sql = IF(
  @route_legacy_fk_clauses IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `routes` ', @route_legacy_fk_clauses)
);
PREPARE drop_route_legacy_fks_stmt FROM @drop_route_legacy_fks_sql;
EXECUTE drop_route_legacy_fks_stmt;
DEALLOCATE PREPARE drop_route_legacy_fks_stmt;

SET @route_legacy_column_clauses = (
  SELECT GROUP_CONCAT(
    CONCAT('DROP COLUMN `', COLUMN_NAME, '`')
    ORDER BY FIELD(COLUMN_NAME, 'company_id', 'client_id', 'client_name')
    SEPARATOR ', '
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'routes'
    AND COLUMN_NAME IN ('company_id', 'client_id', 'client_name')
);
SET @drop_route_legacy_columns_sql = IF(
  @route_legacy_column_clauses IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `routes` ', @route_legacy_column_clauses)
);
PREPARE drop_route_legacy_columns_stmt FROM @drop_route_legacy_columns_sql;
EXECUTE drop_route_legacy_columns_stmt;
DEALLOCATE PREPARE drop_route_legacy_columns_stmt;

ALTER TABLE `route_stops`
  ALTER COLUMN `position` SET DEFAULT 1;
