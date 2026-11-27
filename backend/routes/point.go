package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupLoadingPointRoutes(api fiber.Router, db *gorm.DB) {
	setupPointRoutes(api, db, "/loading-points", handlers.GetLoadingPoints, handlers.GetLoadingPoint, handlers.CreateLoadingPoint, handlers.UpdateLoadingPoint, handlers.DeleteLoadingPoint)
}

func SetupUnloadingPointRoutes(api fiber.Router, db *gorm.DB) {
	setupPointRoutes(api, db, "/unloading-points", handlers.GetUnloadingPoints, handlers.GetUnloadingPoint, handlers.CreateUnloadingPoint, handlers.UpdateUnloadingPoint, handlers.DeleteUnloadingPoint)
}

type pointHandler func(*fiber.Ctx, *gorm.DB) error

func setupPointRoutes(api fiber.Router, db *gorm.DB, path string, getList, getOne, create, update, delete pointHandler) {
	points := api.Group(path, middleware.AuthMiddleware(db), middleware.RequireCadmin())
	points.Get("/", func(c *fiber.Ctx) error { return getList(c, db) })
	points.Get("/:id", func(c *fiber.Ctx) error { return getOne(c, db) })
	points.Post("/", func(c *fiber.Ctx) error { return create(c, db) })
	points.Put("/:id", func(c *fiber.Ctx) error { return update(c, db) })
	points.Delete("/:id", func(c *fiber.Ctx) error { return delete(c, db) })
}
