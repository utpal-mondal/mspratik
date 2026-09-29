// backend/routes/vehicle.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupVehicleRoutes registers the vehicle entry routes used by the
// vehicle management section.
func SetupVehicleRoutes(api fiber.Router, db *gorm.DB) {
	vehicles := api.Group("/vehicles", middleware.AuthMiddleware(db))

	vehicles.Get("/get-all-vehicle", func(c *fiber.Ctx) error {
		return handlers.GetVehicles(c, db)
	})
	vehicles.Get("/:id/get-vehicle-details", func(c *fiber.Ctx) error {
		return handlers.GetVehicle(c, db)
	})
	vehicles.Post("/create-vahicle", func(c *fiber.Ctx) error {
		return handlers.CreateVehicle(c, db)
	})
	vehicles.Put("/:id/update-vehicle", func(c *fiber.Ctx) error {
		return handlers.UpdateVehicle(c, db)
	})
	vehicles.Delete("/:id/delete-vehicle", func(c *fiber.Ctx) error {
		return handlers.DeleteVehicle(c, db)
	})
}
