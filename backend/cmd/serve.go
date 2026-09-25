package cmd

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Start the WMS API server",
	Run: func(cmd *cobra.Command, args []string) {
		app := fiber.New(fiber.Config{
			AppName: "WMS Backend",
		})

		// Middleware
		app.Use(cors.New())
		app.Use(logger.New())

		// Health check endpoint
		app.Get("/health", func(c *fiber.Ctx) error {
			return c.JSON(fiber.Map{
				"status":  "ok",
				"service": "wms-backend",
			})
		})

		// Start server in a goroutine
		port := os.Getenv("PORT")
		if port == "" {
			port = "3001"
		}

		// Graceful shutdown
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM)

		// Start server in a goroutine
		go func() {
			if err := app.Listen(":" + port); err != nil {
				log.Fatalf("Error starting server: %v", err)
			}
		}()

		log.Printf("Server started on :%s\n", port)
		<-c // Wait for interrupt signal
		log.Println("Shutting down server...")
		_ = app.Shutdown()
	},
}
