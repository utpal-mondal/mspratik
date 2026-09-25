package middleware

import (
	"github.com/gofiber/fiber/v2"
)

func RequirePermission(permission string) fiber.Handler {
	return func(c *fiber.Ctx) error {

		user, ok := c.Locals("user").(AuthUser)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied",
			})
		}

		for _, p := range user.Permissions {
			if p == permission {
				c.Locals("permissions", user.Permissions)
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Permission denied",
		})
	}
}

func RequireAnyPermission(permissions ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := c.Locals("user").(AuthUser)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied",
			})
		}

		permissionSet := make(map[string]struct{}, len(permissions))
		for _, p := range permissions {
			permissionSet[p] = struct{}{}
		}

		for _, p := range user.Permissions {
			if _, exists := permissionSet[p]; exists {
				c.Locals("permissions", user.Permissions)
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Permission denied",
		})
	}
}
