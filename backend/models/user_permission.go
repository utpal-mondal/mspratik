package models

import (
	"gorm.io/gorm"
)

// Can checks if the user has a specific permission through their company's role.
func (u *User) Can(permissionName string, db *gorm.DB) bool {
	// Ensure user's company is loaded.
	var userWithCompany User
	if err := db.Preload("Company").First(&userWithCompany, u.ID).Error; err != nil {
		// User not found or other DB error.
		return false
	}

	// Check if the user or their company is valid.
	if userWithCompany.Company == nil || userWithCompany.Company.RoleName == "" {
		return false
	}

	// Check for permission based on the company's role name.
	var count int64
	db.Table("roles").
		Joins("join role_has_permissions on role_has_permissions.role_id = roles.id").
		Joins("join permissions on permissions.id = role_has_permissions.permission_id").
		Where("roles.name = ? AND permissions.name = ?", userWithCompany.Company.RoleName, permissionName).
		Count(&count)

	return count > 0
}
