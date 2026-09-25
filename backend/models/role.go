package models

import "time"

// Role defines the roles that can be assigned to users or companies.
type Role struct {
	ID          uint          `gorm:"primaryKey" json:"id"`
	Name        string        `gorm:"type:varchar(255);uniqueIndex;not null" json:"name"`
	GuardName   string        `gorm:"type:varchar(255);not null;default:'web'" json:"guard_name"`
	CompanyID   *uint         `gorm:"index" json:"company_id"`
	IsDefault   bool          `gorm:"default:false" json:"is_default"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`

	Permissions []*Permission `gorm:"many2many:role_has_permissions;" json:"permissions,omitempty"`
}

// TableName specifies the table name
func (Role) TableName() string {
	return "roles"
}
