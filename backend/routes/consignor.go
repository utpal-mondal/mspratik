package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupConsignorRoutes(api fiber.Router, db *gorm.DB) {
	consignors := api.Group("/consignors", middleware.AuthMiddleware(db), middleware.RequireCadmin())
	consignors.Get("/", func(c *fiber.Ctx) error {
		return handlers.GetConsignors(c, db)
	})
	consignors.Get("/:id", func(c *fiber.Ctx) error {
		return handlers.GetConsignor(c, db)
	})
	consignors.Post("/", func(c *fiber.Ctx) error {
		return handlers.CreateConsignor(c, db)
	})
	consignors.Put("/:id", func(c *fiber.Ctx) error {
		return handlers.UpdateConsignor(c, db)
	})
	consignors.Delete("/:id", func(c *fiber.Ctx) error {
		return handlers.DeleteConsignor(c, db)
	})
}
