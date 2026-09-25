package routes

import (
	"wms-backend/handlers"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupHealthRoutes sets up the health check routes
func SetupHealthRoutes(api fiber.Router, db *gorm.DB) {
	api.Get("/db-health", handlers.DBHealthCheck(db))
}
