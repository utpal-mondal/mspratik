package models

// RoleHasPermission defines the pivot table for associating permissions with roles.
type RoleHasPermission struct {
	PermissionID uint `gorm:"primaryKey;autoIncrement:false"`
	RoleID       uint `gorm:"primaryKey;autoIncrement:false"`
}

// TableName specifies the table name
func (RoleHasPermission) TableName() string {
	return "role_has_permissions"
}
