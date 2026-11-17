SET @route_stops_table_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'route_stops'
);
SET @route_stops_notify_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'route_stops'
    AND COLUMN_NAME = 'notify'
);
SET @add_route_stops_notify_sql = IF(
  @route_stops_table_exists = 0 OR @route_stops_notify_column_exists > 0,
  'SELECT 1',
  'ALTER TABLE `route_stops` ADD COLUMN `notify` BOOLEAN NOT NULL DEFAULT FALSE AFTER `position`'
);
PREPARE add_route_stops_notify_stmt FROM @add_route_stops_notify_sql;
EXECUTE add_route_stops_notify_stmt;
DEALLOCATE PREPARE add_route_stops_notify_stmt;
