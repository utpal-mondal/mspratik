// backend/routes/settings.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupSettingsRoutes registers the company-admin settings routes
// (user and role management).
func SetupSettingsRoutes(api fiber.Router, db *gorm.DB) {
	settings := api.Group("/settings", middleware.AuthMiddleware(db), middleware.RequireCadmin())

	settings.Get("/get-roles", func(c *fiber.Ctx) error {
		return handlers.GetRoles(c, db)
	})
	settings.Post("/create-role", func(c *fiber.Ctx) error {
		return handlers.CreateRole(c, db)
	})
	settings.Put("/update-role/:id", func(c *fiber.Ctx) error {
		return handlers.UpdateRole(c, db)
	})
	settings.Delete("/delete-role/:id", func(c *fiber.Ctx) error {
		return handlers.DeleteRole(c, db)
	})

	settings.Get("/get-users", func(c *fiber.Ctx) error {
		return handlers.GetSettingsUsers(c, db)
	})
	settings.Get("/get-user/:id", func(c *fiber.Ctx) error {
		return handlers.GetSettingsUser(c, db)
	})
	settings.Post("/create-user", func(c *fiber.Ctx) error {
		return handlers.CreateSettingsUser(c, db)
	})
	settings.Put("/update-user/:id", func(c *fiber.Ctx) error {
		return handlers.UpdateSettingsUser(c, db)
	})
	settings.Put("/change-password/:id", func(c *fiber.Ctx) error {
		return handlers.ChangeSettingsUserPassword(c, db)
	})
	settings.Delete("/delete-user/:id", func(c *fiber.Ctx) error {
		return handlers.DeleteSettingsUser(c, db)
	})
}
