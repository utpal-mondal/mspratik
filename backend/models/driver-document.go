package models

import (
	"time"

	"gorm.io/gorm"
)

type DriverDocument struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	CompanyID    *uint          `gorm:"index" json:"company_id,omitempty"`
	DriverID     uint           `gorm:"not null;index" json:"driver_id"`
	DriverName   string         `gorm:"type:varchar(255);not null;default:''" json:"driver_name"`
	DocumentType string         `gorm:"type:varchar(50);not null" json:"document_type"`
	ExpiryDate   *time.Time     `gorm:"type:date" json:"expiry_date,omitempty"`
	DocumentName string         `gorm:"type:varchar(1024);not null" json:"document_name"`
	FilePath     string         `gorm:"type:varchar(500);not null;default:''" json:"file_path"`
	CreatedBy    int64          `gorm:"not null;default:0" json:"created_by,omitempty"`
	CreatedAt    *time.Time     `json:"created_at,omitempty"`
	UpdatedAt    *time.Time     `json:"updated_at,omitempty"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (DriverDocument) TableName() string {
	return "driver_documents"
}
