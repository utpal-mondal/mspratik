package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupBranchRoutes(api fiber.Router, db *gorm.DB) {
	branches := api.Group("/branches", middleware.AuthMiddleware(db), middleware.RequireCadmin())
	branches.Get("/", func(c *fiber.Ctx) error {
		return handlers.GetBranches(c, db)
	})
	branches.Get("/:id", func(c *fiber.Ctx) error {
		return handlers.GetBranch(c, db)
	})
	branches.Post("/", func(c *fiber.Ctx) error {
		return handlers.CreateBranch(c, db)
	})
	branches.Put("/:id", func(c *fiber.Ctx) error {
		return handlers.UpdateBranch(c, db)
	})
	branches.Delete("/:id", func(c *fiber.Ctx) error {
		return handlers.DeleteBranch(c, db)
	})
}
