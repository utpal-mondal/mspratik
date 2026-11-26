package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupFirmRoutes(api fiber.Router, db *gorm.DB) {
	firms := api.Group("/firms", middleware.AuthMiddleware(db), middleware.RequireCadmin())
	firms.Get("/", func(c *fiber.Ctx) error {
		return handlers.GetFirms(c, db)
	})
	firms.Get("/:id", func(c *fiber.Ctx) error {
		return handlers.GetFirm(c, db)
	})
	firms.Post("/", func(c *fiber.Ctx) error {
		return handlers.CreateFirm(c, db)
	})
	firms.Put("/:id", func(c *fiber.Ctx) error {
		return handlers.UpdateFirm(c, db)
	})
	firms.Delete("/:id", func(c *fiber.Ctx) error {
		return handlers.DeleteFirm(c, db)
	})
}
