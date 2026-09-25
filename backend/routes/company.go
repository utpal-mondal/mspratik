// backend/routes/company.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// SetupCompanyRoutes registers the company details routes used by the
// settings section.
func SetupCompanyRoutes(api fiber.Router, db *gorm.DB) {
	api.Get("/settings/company-details",
		middleware.AuthMiddleware(db),
		middleware.RequireCadmin(),
		func(c *fiber.Ctx) error {
			return handlers.GetCompanyDetails(c, db)
		},
	)
	api.Put("/settings/company-details",
		middleware.AuthMiddleware(db),
		middleware.RequireCadmin(),
		func(c *fiber.Ctx) error {
			return handlers.UpdateCompanyDetails(c, db)
		},
	)
}
