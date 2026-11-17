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
	companies := api.Group("/companies", middleware.AuthMiddleware(db), middleware.RequireCadmin())
	companies.Get("/get-all-company", func(c *fiber.Ctx) error {
		return handlers.GetCompanies(c, db)
	})
	companies.Get("/:id/get-company-details", func(c *fiber.Ctx) error {
		return handlers.GetCompany(c, db)
	})
	companies.Post("/create-company", func(c *fiber.Ctx) error {
		return handlers.CreateCompany(c, db)
	})
	companies.Put("/:id/update-company", func(c *fiber.Ctx) error {
		return handlers.UpdateCompany(c, db)
	})
	companies.Delete("/:id/delete-company", func(c *fiber.Ctx) error {
		return handlers.DeleteCompany(c, db)
	})

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
