package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupFolioRoutes(api fiber.Router, db *gorm.DB) {
	folios := api.Group("/folios", middleware.AuthMiddleware(db))
	folios.Get("/branches", func(c *fiber.Ctx) error {
		return handlers.GetFolioBranches(c, db)
	})
	folios.Get("/", func(c *fiber.Ctx) error {
		return handlers.GetFolios(c, db)
	})
	folios.Get("/next-number", func(c *fiber.Ctx) error {
		return handlers.GetNextFolioNumber(c, db)
	})
	folios.Get("/:id", func(c *fiber.Ctx) error {
		return handlers.GetFolio(c, db)
	})
	folios.Post("/", func(c *fiber.Ctx) error {
		return handlers.CreateFolio(c, db)
	})
}
