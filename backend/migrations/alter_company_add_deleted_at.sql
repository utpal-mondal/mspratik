-- Add deleted_at column to company table for soft delete
-- (also auto-applied by GORM AutoMigrate on server start)

ALTER TABLE `company`
  ADD COLUMN `deleted_at` DATETIME(3) NULL,
  ADD INDEX `idx_company_deleted_at` (`deleted_at`);
