// backend/models/route.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Route struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	CompanyID  *uint          `gorm:"index" json:"company_id,omitempty"`
	ClientID   *uint          `gorm:"index" json:"client_id,omitempty"`
	ClientName string         `gorm:"type:varchar(50)" json:"client_name,omitempty"`
	StartName  string         `gorm:"type:varchar(100)" json:"start_name,omitempty"`
	StartLat   string         `gorm:"type:varchar(20)" json:"start_lat,omitempty"`
	StartLong  string         `gorm:"type:varchar(20)" json:"start_long,omitempty"`
	ViaName    string         `gorm:"type:varchar(100)" json:"via_name,omitempty"`
	ViaLat     string         `gorm:"type:varchar(20)" json:"via_lat,omitempty"`
	ViaLong    string         `gorm:"type:varchar(20)" json:"via_long,omitempty"`
	EndName    string         `gorm:"type:varchar(100)" json:"end_name,omitempty"`
	EndLat     string         `gorm:"type:varchar(20)" json:"end_lat,omitempty"`
	EndLong    string         `gorm:"type:varchar(20)" json:"end_long,omitempty"`
	CreatedBy  int64          `json:"created_by,omitempty"`
	CreatedAt  *time.Time     `json:"created_at,omitempty"`
	UpdatedAt  *time.Time     `json:"updated_at,omitempty"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (Route) TableName() string {
	return "routes"
}
