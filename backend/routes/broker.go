// backend/routes/broker.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupBrokerRoutes registers the broker entry routes used by the
// broker management section.
func SetupBrokerRoutes(api fiber.Router, db *gorm.DB) {
	brokers := api.Group("/brokers", middleware.AuthMiddleware(db))

	brokers.Get("/get-all-broker", func(c *fiber.Ctx) error {
		return handlers.GetBrokers(c, db)
	})
	brokers.Get("/:id/get-broker-details", func(c *fiber.Ctx) error {
		return handlers.GetBroker(c, db)
	})
	brokers.Post("/create-broker", func(c *fiber.Ctx) error {
		return handlers.CreateBroker(c, db)
	})
	brokers.Put("/:id/update-broker", func(c *fiber.Ctx) error {
		return handlers.UpdateBroker(c, db)
	})
	brokers.Delete("/:id/delete-broker", func(c *fiber.Ctx) error {
		return handlers.DeleteBroker(c, db)
	})
}
