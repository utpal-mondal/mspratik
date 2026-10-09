// backend/routes/pump.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupPumpRoutes registers the pump entry routes used by the
// pump management section.
func SetupPumpRoutes(api fiber.Router, db *gorm.DB) {
	pumps := api.Group("/pumps", middleware.AuthMiddleware(db))

	pumps.Get("/get-all-pump", func(c *fiber.Ctx) error {
		return handlers.GetPumps(c, db)
	})
	pumps.Get("/:id/get-pump-details", func(c *fiber.Ctx) error {
		return handlers.GetPump(c, db)
	})
	pumps.Post("/create-pump", func(c *fiber.Ctx) error {
		return handlers.CreatePump(c, db)
	})
	pumps.Put("/:id/update-pump", func(c *fiber.Ctx) error {
		return handlers.UpdatePump(c, db)
	})
	pumps.Delete("/:id/delete-pump", func(c *fiber.Ctx) error {
		return handlers.DeletePump(c, db)
	})
}
