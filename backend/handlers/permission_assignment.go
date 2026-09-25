// backend/handlers/permission_assignment.go
package handlers

import (
	"errors"
	"fmt"

	"wms-backend/middleware"
	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// AssignPermissionToAdminRole assigns an existing permission to the admin role
// of the current company admin user. It never creates permission rows.
// It is intended to replace manual SQL like:
//
//	INSERT IGNORE INTO role_has_permissions (permission_id, role_id)
//	SELECT id, 14 FROM permissions;
func AssignPermissionToAdminRole(c *fiber.Ctx, db *gorm.DB, permissionName string) error {
	// 1. Get the current user from the request context
	authUser, ok := c.Locals("user").(middleware.AuthUser)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	// 2. Only company admins can assign permissions
	if authUser.IsCadmin != "1" {
		return fiber.NewError(fiber.StatusForbidden, "Only company admin can assign permissions")
	}

	if authUser.CompanyID == nil {
		return fiber.NewError(fiber.StatusBadRequest, "User is not associated with a company")
	}

	// 3. Load the user's company to find the admin role name
	var company models.Company
	if err := db.First(&company, *authUser.CompanyID).Error; err != nil {
		return fmt.Errorf("failed to load company: %w", err)
	}

	if company.RoleName == "" {
		return errors.New("company has no role name configured")
	}

	// 4. Find the admin role for this company
	var role models.Role
	if err := db.Where("name = ?", company.RoleName).First(&role).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("admin role %q not found", company.RoleName)
		}
		return fmt.Errorf("failed to load admin role: %w", err)
	}

	// 5. The permission must already exist — never fabricate rows
	var permission models.Permission
	if err := db.Where("name = ?", permissionName).First(&permission).Error; err != nil {
		return fmt.Errorf("permission %q not found: %w", permissionName, err)
	}

	// 6. Assign the permission to the admin role (idempotent)
	rolePermission := models.RoleHasPermission{
		RoleID:       role.ID,
		PermissionID: permission.ID,
	}
	if err := db.FirstOrCreate(&rolePermission, "role_id = ? AND permission_id = ?", role.ID, permission.ID).Error; err != nil {
		return fmt.Errorf("failed to assign permission to admin role: %w", err)
	}

	return nil
}

// AutoAssignAdminPermissions assigns every permission to all company admin roles
// on application startup. It is idempotent, so it can be called every time the
// server starts without creating duplicate assignments.
func AutoAssignAdminPermissions(db *gorm.DB) error {
	return db.Exec(`
		INSERT IGNORE INTO role_has_permissions (permission_id, role_id)
		SELECT p.id, r.id
		FROM permissions p
		JOIN roles r
		JOIN company c ON c.role_name = r.name
		WHERE c.role_name != ''
	`).Error
}
