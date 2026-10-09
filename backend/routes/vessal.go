// backend/routes/vessal.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupVessalRoutes registers the vessal entry routes used by the
// vessal management section.
func SetupVessalRoutes(api fiber.Router, db *gorm.DB) {
	vessals := api.Group("/vessals", middleware.AuthMiddleware(db))

	vessals.Get("/get-all-vessal", func(c *fiber.Ctx) error {
		return handlers.GetVessals(c, db)
	})
	vessals.Get("/:id/get-vessal-details", func(c *fiber.Ctx) error {
		return handlers.GetVessal(c, db)
	})
	vessals.Post("/create-vessal", func(c *fiber.Ctx) error {
		return handlers.CreateVessal(c, db)
	})
	vessals.Put("/:id/update-vessal", func(c *fiber.Ctx) error {
		return handlers.UpdateVessal(c, db)
	})
	vessals.Delete("/:id/delete-vessal", func(c *fiber.Ctx) error {
		return handlers.DeleteVessal(c, db)
	})
}
