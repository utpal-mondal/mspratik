// backend/models/vessal.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Vessal struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CompanyID *uint          `gorm:"index" json:"company_id,omitempty"`
	Name      string         `gorm:"type:varchar(50);not null" json:"name"`
	Price     *float64       `gorm:"type:decimal(15,2)" json:"price,omitempty"`
	CreatedBy int64          `json:"created_by,omitempty"`
	CreatedAt *time.Time     `json:"created_at,omitempty"`
	UpdatedAt *time.Time     `json:"updated_at,omitempty"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (Vessal) TableName() string {
	return "vessals"
}
