// backend/routes/bank.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupBankRoutes registers the bank master routes used by dropdowns.
func SetupBankRoutes(api fiber.Router, db *gorm.DB) {
	banks := api.Group("/banks", middleware.AuthMiddleware(db))

	banks.Get("/get-all-bank", func(c *fiber.Ctx) error {
		return handlers.GetBanks(c, db)
	})
}
