package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// DBHealthCheck checks the database connection status
func DBHealthCheck(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		sqlDB, err := db.DB()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "Failed to get database connection from pool",
			})
		}

		err = sqlDB.Ping()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "Database connection is down",
				"details": err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "ok",
			"message": "Database connection is healthy",
		})
	}
}
