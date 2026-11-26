CREATE TABLE IF NOT EXISTS `branch` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `head` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10,7) NULL,
  `longitude` DECIMAL(11,7) NULL,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
