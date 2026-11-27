package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupTripRoutes(api fiber.Router, db *gorm.DB) {
	trips := api.Group("/trips", middleware.AuthMiddleware(db))
	trips.Get("/lookups", func(c *fiber.Ctx) error {
		return handlers.GetTripLookups(c, db)
	})

	folios := api.Group("/folios", middleware.AuthMiddleware(db))
	folios.Post("/:folioId/trips", func(c *fiber.Ctx) error {
		return handlers.CreateTrip(c, db)
	})
}
