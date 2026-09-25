// backend/middleware/auth.go
package middleware

import (
	"fmt"
	"strings"

	"wms-backend/models"
	"wms-backend/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func getUserPermissions(db *gorm.DB, userID uint) ([]string, error) {
	var modelHasRoles []models.ModelHasRole
	if err := db.Where("model_id = ? AND model_type = ?", userID, "App\\Models\\User").Find(&modelHasRoles).Error; err != nil {
		return nil, err
	}
	if len(modelHasRoles) == 0 {
		return []string{}, nil
	}

	roleIDs := make([]uint, 0, len(modelHasRoles))
	for _, mhr := range modelHasRoles {
		roleIDs = append(roleIDs, mhr.RoleID)
	}

	var roleHasPermissions []models.RoleHasPermission
	if err := db.Where("role_id IN ?", roleIDs).Find(&roleHasPermissions).Error; err != nil {
		return nil, err
	}
	if len(roleHasPermissions) == 0 {
		return []string{}, nil
	}

	permissionIDs := make([]uint, 0, len(roleHasPermissions))
	for _, rp := range roleHasPermissions {
		permissionIDs = append(permissionIDs, rp.PermissionID)
	}

	var permissions []models.Permission
	if err := db.Where("id IN ?", permissionIDs).Find(&permissions).Error; err != nil {
		return nil, err
	}

	seen := make(map[string]bool)
	permissionNames := make([]string, 0, len(permissions))
	for _, p := range permissions {
		if !seen[p.Name] {
			seen[p.Name] = true
			permissionNames = append(permissionNames, p.Name)
		}
	}
	return permissionNames, nil
}

// AuthMiddleware verifies the JWT token and sets the user in the context

type AuthUser struct {
	ID          uint
	CompanyID   *uint
	Role        string
	IsCadmin    string
	Permissions []string
}

func AuthMiddleware(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		fmt.Printf("DEBUG: AuthMiddleware called for %s\n", c.Path())

		authHeader := c.Get("Authorization")
		if authHeader == "" {
			fmt.Printf("DEBUG: No Authorization header found\n")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header is required",
			})
		}

		fmt.Printf("DEBUG: Authorization header: %s\n", authHeader)

		// Extract the token from the header
		tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		if tokenString == authHeader || tokenString == "" || tokenString == "null" || tokenString == "undefined" {
			fmt.Printf("DEBUG: Token does not start with 'Bearer '\n")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Bearer token is required",
			})
		}

		fmt.Printf("DEBUG: Extracted token: %s...\n", tokenString[:min(len(tokenString), 20)])

		// Parse and validate the token
		claims, err := utils.ParseToken(tokenString)
		if err != nil {
			fmt.Printf("DEBUG: Token parsing failed: %v\n", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		revoked, err := utils.IsTokenRevoked(db, tokenString)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to verify token",
			})
		}
		if revoked {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token has been revoked",
			})
		}

		fmt.Printf("DEBUG: Token parsed successfully, UserID: %d, Role: %s\n", claims.UserID, claims.Role)

		var user models.User
		if err := db.First(&user, claims.UserID).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User not found",
			})
		}

		// Load permissions
		permissions, err := getUserPermissions(db, user.ID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to load permissions",
			})
		}

		c.Locals("userID", user.ID)
		c.Locals("userRole", user.UserType)
		c.Locals("db", db)
		c.Locals("user", AuthUser{
			ID:          user.ID,
			CompanyID:   user.CompanyID,
			Role:        user.UserType,
			IsCadmin:    user.IsCadmin,
			Permissions: permissions,
		})

		return c.Next()

	}
}

// RequireCadmin blocks access if the authenticated user is not a company admin
func RequireCadmin() fiber.Handler {
	return func(c *fiber.Ctx) error {
		isCadmin := "0"

		switch u := c.Locals("user").(type) {
		case AuthUser:
			isCadmin = u.IsCadmin
		case models.User:
			isCadmin = u.IsCadmin
		default:
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied",
			})
		}

		if isCadmin != "1" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Only company admin can access this resource",
			})
		}

		return c.Next()
	}
}

// RoleMiddleware checks if the user has the required role
func RoleMiddleware(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, ok := c.Locals("userRole").(string)
		if !ok {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied",
			})
		}

		for _, role := range roles {
			if role == userRole {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You don't have permission to access this resource",
		})
	}
}
