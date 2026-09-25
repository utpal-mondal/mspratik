// backend/database/database.go
package database

import (
	"fmt"
	"log"

	"wms-backend/config"
	"wms-backend/models"
	"wms-backend/seed"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Init initializes the database connection and runs migrations
func Init() (*gorm.DB, error) {
	cfg, err := config.LoadConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	dsn := cfg.GetDSN()

	var dbLogger logger.Interface
	if cfg.IsDevelopment() {
		dbLogger = logger.Default.LogMode(logger.Info)
	} else {
		dbLogger = logger.Default.LogMode(logger.Error)
	}

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: dbLogger,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto migrate models
	if err := runMigrations(); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Database connection established")
	return DB, nil
}

// runMigrations runs database migrations
func runMigrations() error {
	// First create all tables without constraints
	models := []interface{}{
		// Core Models
		&models.User{},
		&models.Company{},

		// Roles and Permissions
		&models.Role{},
		&models.Permission{},
		&models.ModelHasRole{},
		&models.RoleHasPermission{},

		// Legacy Permissions
		&models.UserPermissionLegacy{},

		// Revoked auth tokens
		&models.RevokedToken{},
	}

	// Create tables with AutoMigrate (compatible with MariaDB)
	for _, model := range models {
		if err := DB.AutoMigrate(model); err != nil {
			log.Printf("Warning: Failed to migrate table for %T: %v", model, err)
			// Continue with other tables even if one fails
		}
	}

	// Skip custom constraints for MariaDB compatibility
	log.Println("Skipping custom constraints to avoid SQL syntax errors")

	return nil
}

// Seed can be implemented later if needed
func Seed() error {
	return seed.SeedInitialData(DB)
}
