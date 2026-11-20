// backend/models/vehicle_document.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type VehicleDocument struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	CompanyID     *uint          `gorm:"index" json:"company_id,omitempty"`
	VehicleID     uint           `gorm:"index;not null" json:"vehicle_id"`
	VehicleNumber string         `gorm:"type:varchar(20);not null" json:"vehicle_number"`
	DocumentType  string         `gorm:"type:varchar(50);not null" json:"document_type"`
	ExpiryDate    *time.Time     `gorm:"type:date" json:"expiry_date,omitempty"`
	DocumentName  string         `gorm:"type:varchar(255);not null" json:"document_name"`
	FilePath      string         `gorm:"type:varchar(500);not null" json:"file_path"`
	CreatedBy     int64          `json:"created_by,omitempty"`
	CreatedAt     *time.Time     `json:"created_at,omitempty"`
	UpdatedAt     *time.Time     `json:"updated_at,omitempty"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (VehicleDocument) TableName() string {
	return "vehicle_documents"
}
