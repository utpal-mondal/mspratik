-- Add location_api column to company table
-- (also auto-applied by GORM AutoMigrate on server start)

ALTER TABLE `company`
  ADD COLUMN `location_api` TEXT NULL AFTER `remark`;
