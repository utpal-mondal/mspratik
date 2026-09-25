package models

import "time"

// Permission defines the permissions that can be assigned to roles.
type Permission struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"name"`
	GuardName string    `gorm:"type:varchar(255);not null;default:'web'" json:"guard_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name
func (Permission) TableName() string {
	return "permissions"
}
