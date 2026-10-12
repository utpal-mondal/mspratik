// backend/models/cargo.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Cargo struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CompanyID *uint          `gorm:"index" json:"company_id,omitempty"`
	CargoName string         `gorm:"type:varchar(50);not null" json:"cargo_name"`
	Status    string         `gorm:"type:varchar(10);default:active" json:"status,omitempty"`
	CreatedBy int64          `json:"created_by,omitempty"`
	CreatedAt *time.Time     `json:"created_at,omitempty"`
	UpdatedAt *time.Time     `json:"updated_at,omitempty"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (Cargo) TableName() string {
	return "cargos"
}
