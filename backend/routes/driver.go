// backend/routes/driver.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupDriverRoutes registers the driver entry routes used by the
// driver management section.
func SetupDriverRoutes(api fiber.Router, db *gorm.DB) {
	drivers := api.Group("/drivers", middleware.AuthMiddleware(db))

	drivers.Get("/get-all-driver", func(c *fiber.Ctx) error {
		return handlers.GetDrivers(c, db)
	})
	drivers.Get("/:id/get-driver-details", func(c *fiber.Ctx) error {
		return handlers.GetDriver(c, db)
	})
	drivers.Post("/create-driver", func(c *fiber.Ctx) error {
		return handlers.CreateDriver(c, db)
	})
	drivers.Put("/:id/update-driver", func(c *fiber.Ctx) error {
		return handlers.UpdateDriver(c, db)
	})
	drivers.Delete("/:id/delete-driver", func(c *fiber.Ctx) error {
		return handlers.DeleteDriver(c, db)
	})
}
