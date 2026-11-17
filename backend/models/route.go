// backend/models/route.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Route struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	RouteName  string         `gorm:"type:varchar(100);not null" json:"route_name"`
	StartName  string         `gorm:"type:varchar(100)" json:"start_name,omitempty"`
	StartLat   string         `gorm:"type:varchar(20)" json:"start_lat,omitempty"`
	StartLong  string         `gorm:"type:varchar(20)" json:"start_long,omitempty"`
	ViaPoints  []RouteStop    `gorm:"foreignKey:RouteID" json:"via_points,omitempty"`
	EndName    string         `gorm:"type:varchar(100)" json:"end_name,omitempty"`
	EndLat     string         `gorm:"type:varchar(20)" json:"end_lat,omitempty"`
	EndLong    string         `gorm:"type:varchar(20)" json:"end_long,omitempty"`
	CreatedBy  int64          `json:"created_by,omitempty"`
	CreatedAt  *time.Time     `json:"created_at,omitempty"`
	UpdatedAt  *time.Time     `json:"updated_at,omitempty"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

type RouteCompany struct {
	RouteID   uint `gorm:"primaryKey;not null" json:"route_id"`
	CompanyID uint `gorm:"primaryKey;index;not null" json:"company_id"`
}

type RouteStop struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	RouteID  uint   `gorm:"index;not null" json:"route_id,omitempty"`
	Name     string `gorm:"type:varchar(100);not null" json:"name"`
	Lat      string `gorm:"type:varchar(20);not null" json:"lat"`
	Long     string `gorm:"type:varchar(20);not null" json:"long"`
	Position int    `gorm:"not null;default:1" json:"position"`
	Notify   bool   `gorm:"not null;default:false" json:"notify"`
}

// TableName specifies the table name
func (Route) TableName() string {
	return "routes"
}

func (RouteCompany) TableName() string {
	return "route_companies"
}

func (RouteStop) TableName() string {
	return "route_stops"
}
