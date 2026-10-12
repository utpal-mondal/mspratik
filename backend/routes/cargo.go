// backend/routes/cargo.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupCargoRoutes registers the cargo routes used by the
// cargo management section.
func SetupCargoRoutes(api fiber.Router, db *gorm.DB) {
	cargos := api.Group("/cargos", middleware.AuthMiddleware(db))

	cargos.Get("/get-all-cargo", func(c *fiber.Ctx) error {
		return handlers.GetCargos(c, db)
	})
	cargos.Post("/create-cargo", func(c *fiber.Ctx) error {
		return handlers.CreateCargo(c, db)
	})
	cargos.Put("/:id/update-cargo-status", func(c *fiber.Ctx) error {
		return handlers.UpdateCargoStatus(c, db)
	})
}
