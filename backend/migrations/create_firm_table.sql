CREATE TABLE IF NOT EXISTS `firm` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `address_1` VARCHAR(255) NULL,
  `address_2` VARCHAR(255) NULL,
  `pan_no` VARCHAR(10) NOT NULL,
  `gstn_no` VARCHAR(15) NOT NULL,
  `cash_in_hand` DECIMAL(15,2) NULL,
  `short_form` VARCHAR(10) NULL,
  `tan_no` VARCHAR(10) NOT NULL,
  `starting_session` VARCHAR(7) NULL,
  `created_at` DATETIME(3) NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
