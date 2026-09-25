// backend/main.go
package main

import (
	"log"
	"os"

	"wms-backend/database"
	"wms-backend/handlers" // Added missing import
	"wms-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables")
	}

	// Initialize database
	db, err := database.Init()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Seed initial data
	if err := database.Seed(); err != nil {
		log.Printf("Warning: Failed to seed database: %v", err)
	}

	// Auto-assign all permissions to company admin roles on startup
	if err := handlers.AutoAssignAdminPermissions(db); err != nil {
		log.Printf("Warning: Failed to auto-assign admin permissions: %v", err)
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "WMS Backend",
	})

	// Middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,https://order-nest-git-main-mata-inja-s-projects.vercel.app,https://order-nest-pearl.vercel.app,https://sales.afztel.com,https://sales.code-dev.in,https://www.sales.code-dev.in",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: true,
	}))
	app.Use(logger.New())

	// Setup routes
	api := app.Group("/api")
	routes.SetupAuthRoutes(api, db)
	routes.SetupHealthRoutes(api, db)
	routes.SetupPermissionRoutes(api, db)
	routes.SetupSettingsRoutes(api, db)
	routes.SetupCompanyRoutes(api, db)

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "ok",
			"version": "1.0.0",
		})
	})

	// root route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Order nest Backend is running successfully")
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on :%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
