// backend/routes/client.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupClientRoutes registers the client entry routes used by the
// client management section.
func SetupClientRoutes(api fiber.Router, db *gorm.DB) {
	clients := api.Group("/clients", middleware.AuthMiddleware(db))

	clients.Get("/get-all-client", func(c *fiber.Ctx) error {
		return handlers.GetClients(c, db)
	})
	clients.Get("/:id/get-client-details", func(c *fiber.Ctx) error {
		return handlers.GetClient(c, db)
	})
	clients.Post("/create-client", func(c *fiber.Ctx) error {
		return handlers.CreateClient(c, db)
	})
	clients.Put("/:id/update-client", func(c *fiber.Ctx) error {
		return handlers.UpdateClient(c, db)
	})
	clients.Delete("/:id/delete-client", func(c *fiber.Ctx) error {
		return handlers.DeleteClient(c, db)
	})
}
