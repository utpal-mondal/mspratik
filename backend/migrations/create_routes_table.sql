-- backend/migrations/create_routes_table.sql
-- Routes table (also auto-created by GORM AutoMigrate on server start)

CREATE TABLE IF NOT EXISTS `routes` (
  `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `route_name`  VARCHAR(100) NOT NULL DEFAULT '',
  `start_name`  VARCHAR(100) NULL,
  `start_lat`   VARCHAR(20)  NULL,
  `start_long`  VARCHAR(20)  NULL,
  `end_name`    VARCHAR(100) NULL,
  `end_lat`     VARCHAR(20)  NULL,
  `end_long`    VARCHAR(20)  NULL,
  `created_by`  BIGINT       NULL,
  `created_at`  DATETIME(3)  NULL,
  `updated_at`  DATETIME(3)  NULL,
  `deleted_at`  DATETIME(3)  NULL,
  INDEX `idx_routes_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `route_companies` (
  `route_id`   BIGINT UNSIGNED NOT NULL,
  `company_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`route_id`, `company_id`),
  INDEX `idx_route_companies_company_route` (`company_id`, `route_id`),
  CONSTRAINT `fk_route_companies_route`
    FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `route_stops` (
  `id`          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `route_id`    BIGINT UNSIGNED NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `lat`         VARCHAR(20) NOT NULL,
  `long`        VARCHAR(20) NOT NULL,
  `position`    INT NOT NULL DEFAULT 1,
  `notify`      BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX `idx_route_stops_route_position` (`route_id`, `position`),
  CONSTRAINT `fk_route_stops_route`
    FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
