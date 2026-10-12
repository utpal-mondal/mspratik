// backend/routes/route.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupRouteRoutes registers the route entry routes used by the
// route management section.
func SetupRouteRoutes(api fiber.Router, db *gorm.DB) {
	routes := api.Group("/routes", middleware.AuthMiddleware(db))

	routes.Get("/get-all-route", func(c *fiber.Ctx) error {
		return handlers.GetRoutes(c, db)
	})
	routes.Get("/:id/get-route-details", func(c *fiber.Ctx) error {
		return handlers.GetRoute(c, db)
	})
	routes.Post("/create-route", func(c *fiber.Ctx) error {
		return handlers.CreateRoute(c, db)
	})
	routes.Put("/:id/update-route", func(c *fiber.Ctx) error {
		return handlers.UpdateRoute(c, db)
	})
	routes.Delete("/:id/delete-route", func(c *fiber.Ctx) error {
		return handlers.DeleteRoute(c, db)
	})
}
