// backend/main.go
package main

import (
	"log"
	"mime"
	"os"
	"path/filepath"
	"strings"

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
		AppName:   "WMS Backend",
		BodyLimit: 11 * 1024 * 1024,
	})

	// Middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,https://mspratik.code-dev.in",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: true,
	}))
	app.Use(logger.New())

	// Serve uploaded files (vehicle documents, etc.)
	// Read the file into memory per request so the handle is released
	// immediately — app.Static/fasthttp caches open handles, which blocks
	// os.Remove on Windows. Registered below, after the authenticated
	// /uploads/driver-documents route so it doesn't shadow it.
	serveUpload := func(c *fiber.Ctx) error {
		rel := filepath.Clean(filepath.FromSlash(c.Params("*")))
		if rel == "." || rel == "" || rel == ".." || strings.HasPrefix(rel, ".."+string(os.PathSeparator)) {
			return fiber.ErrNotFound
		}
		abs, err := filepath.Abs(filepath.Join("uploads", rel))
		if err != nil {
			return fiber.ErrNotFound
		}
		root, _ := filepath.Abs("uploads")
		if !strings.HasPrefix(abs, root+string(os.PathSeparator)) {
			return fiber.ErrNotFound
		}
		data, err := os.ReadFile(abs)
		if err != nil {
			return fiber.ErrNotFound
		}
		if ct := mime.TypeByExtension(strings.ToLower(filepath.Ext(abs))); ct != "" {
			c.Set("Content-Type", ct)
		}
		return c.Send(data)
	}

	// Setup routes
	api := app.Group("/api")
	routes.SetupAuthRoutes(api, db)
	routes.SetupHealthRoutes(api, db)
	routes.SetupPermissionRoutes(api, db)
	routes.SetupSettingsRoutes(api, db)
	routes.SetupCompanyRoutes(api, db)
	routes.SetupFirmRoutes(api, db)
	routes.SetupBranchRoutes(api, db)
	routes.SetupFolioRoutes(api, db)
	routes.SetupLoadingPointRoutes(api, db)
	routes.SetupUnloadingPointRoutes(api, db)
	routes.SetupVehicleRoutes(api, db)
	routes.SetupDriverRoutes(api, db)
	app.Get("/uploads/*", serveUpload)
	routes.SetupBrokerRoutes(api, db)
	routes.SetupConsignorRoutes(api, db)
	routes.SetupClientRoutes(api, db)
	routes.SetupCargoRoutes(api, db)
	routes.SetupRouteRoutes(api, db)
	routes.SetupBankRoutes(api, db)
	routes.SetupVessalRoutes(api, db)
	routes.SetupProductRoutes(api, db)
	routes.SetupPumpRoutes(api, db)

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "ok",
			"version": "1.0.0",
		})
	})

	// root route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Pratik transport Backend is running successfully")
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
