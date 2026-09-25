// backend/routes/permission.go
package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"wms-backend/handlers"
)

// SetupPermissionRoutes sets up the permission-related routes
func SetupPermissionRoutes(api fiber.Router, db *gorm.DB) {
	permission := api.Group("/permissions")
	
	// Get all permissions grouped by category
	permission.Get("/", func(c *fiber.Ctx) error {
		return handlers.GetAllPermissions(c, db)
	})
}
