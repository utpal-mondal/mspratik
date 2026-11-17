-- Preserve existing via data before removing the legacy columns from routes.
SET @route_name_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'routes'
    AND COLUMN_NAME = 'route_name'
);
SET @add_route_name_sql = IF(
  @route_name_column_exists = 0,
  CONCAT(
    'ALTER TABLE `routes` ADD COLUMN `route_name` VARCHAR(100) NOT NULL DEFAULT ',
    QUOTE(''),
    ' AFTER `client_name`'
  ),
  'SELECT 1'
);
PREPARE add_route_name_stmt FROM @add_route_name_sql;
EXECUTE add_route_name_stmt;
DEALLOCATE PREPARE add_route_name_stmt;

UPDATE `routes`
SET `route_name` = CONCAT('Route ', `id`)
WHERE `route_name` = '';

CREATE TABLE IF NOT EXISTS `route_stops` (
  `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `route_id`    BIGINT UNSIGNED NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `lat`         VARCHAR(20) NOT NULL,
  `long`        VARCHAR(20) NOT NULL,
  `position`    INT NOT NULL DEFAULT 0,
  `notify`      BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX `idx_route_stops_route_position` (`route_id`, `position`),
  CONSTRAINT `fk_route_stops_route`
    FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET @route_points_table_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'route_points'
);
SET @copy_route_points_sql = IF(
  @route_points_table_exists > 0,
  'INSERT INTO `route_stops` (`route_id`, `name`, `lat`, `long`, `position`) SELECT old_points.`route_id`, old_points.`name`, old_points.`lat`, old_points.`long`, old_points.`position` FROM `route_points` AS old_points WHERE NOT EXISTS (SELECT 1 FROM `route_stops` AS existing_stops WHERE existing_stops.`route_id` = old_points.`route_id`) ORDER BY old_points.`route_id`, old_points.`position`',
  'SELECT 1'
);
PREPARE copy_route_points_stmt FROM @copy_route_points_sql;
EXECUTE copy_route_points_stmt;
DEALLOCATE PREPARE copy_route_points_stmt;

SET @legacy_via_columns_exist = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'routes'
    AND COLUMN_NAME IN ('via_name', 'via_lat', 'via_long')
);
SET @copy_legacy_via_sql = IF(
  @legacy_via_columns_exist = 3,
  CONCAT(
    'INSERT INTO `route_stops` (`route_id`, `name`, `lat`, `long`, `position`) SELECT `routes`.`id`, `routes`.`via_name`, `routes`.`via_lat`, `routes`.`via_long`, 0 FROM `routes` WHERE COALESCE(`routes`.`via_name`, ',
    QUOTE(''),
    ') <> ',
    QUOTE(''),
    ' AND NOT EXISTS (SELECT 1 FROM `route_stops` WHERE `route_stops`.`route_id` = `routes`.`id`)'
  ),
  'SELECT 1'
);
PREPARE copy_legacy_via_stmt FROM @copy_legacy_via_sql;
EXECUTE copy_legacy_via_stmt;
DEALLOCATE PREPARE copy_legacy_via_stmt;

SET @route_points_drop_sql = IF(
  @route_points_table_exists > 0,
  'DROP TABLE `route_points`',
  'SELECT 1'
);
PREPARE drop_route_points_stmt FROM @route_points_drop_sql;
EXECUTE drop_route_points_stmt;
DEALLOCATE PREPARE drop_route_points_stmt;

SET @legacy_via_drop_clauses = (
  SELECT GROUP_CONCAT(
    CONCAT('DROP COLUMN `', COLUMN_NAME, '`')
    ORDER BY FIELD(COLUMN_NAME, 'via_name', 'via_lat', 'via_long')
    SEPARATOR ', '
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'routes'
    AND COLUMN_NAME IN ('via_name', 'via_lat', 'via_long')
);
SET @drop_legacy_via_sql = IF(
  @legacy_via_drop_clauses IS NULL,
  'SELECT 1',
  CONCAT('ALTER TABLE `routes` ', @legacy_via_drop_clauses)
);
PREPARE drop_legacy_via_stmt FROM @drop_legacy_via_sql;
EXECUTE drop_legacy_via_stmt;
DEALLOCATE PREPARE drop_legacy_via_stmt;
