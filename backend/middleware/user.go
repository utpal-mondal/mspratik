package middleware

import (
	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func DeserializeUser(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userID").(uint)
		if !ok {
			// If AuthMiddleware hasn't run or failed, userID won't be there.
			// We can just proceed, and downstream handlers will fail if they need a user.
			return c.Next()
		}

		var user models.User
		if err := db.Select("*").First(&user, userID).Error; err != nil {
			// User from token not found in DB, treat as unauthorized
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "fail", "message": "User not found"})
		}

		c.Locals("user", user)
		return c.Next()
	}
}
