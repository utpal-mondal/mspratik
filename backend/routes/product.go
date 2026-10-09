// backend/routes/product.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupProductRoutes registers the product entry routes used by the
// product management section.
func SetupProductRoutes(api fiber.Router, db *gorm.DB) {
	products := api.Group("/products", middleware.AuthMiddleware(db))

	products.Get("/get-all-product", func(c *fiber.Ctx) error {
		return handlers.GetProducts(c, db)
	})
	products.Get("/:id/get-product-details", func(c *fiber.Ctx) error {
		return handlers.GetProduct(c, db)
	})
	products.Post("/create-product", func(c *fiber.Ctx) error {
		return handlers.CreateProduct(c, db)
	})
	products.Put("/:id/update-product", func(c *fiber.Ctx) error {
		return handlers.UpdateProduct(c, db)
	})
	products.Delete("/:id/delete-product", func(c *fiber.Ctx) error {
		return handlers.DeleteProduct(c, db)
	})
}
