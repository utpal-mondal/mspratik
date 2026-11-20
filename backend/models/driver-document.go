package models

import "time"

type DriverDocument struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	DriverID     uint       `gorm:"not null;index" json:"driver_id"`
	ExpiryDate   *time.Time `gorm:"type:date" json:"expiry_date,omitempty"`
	DocumentType string     `gorm:"type:varchar(50);not null" json:"document_type"`
	DocumentName string     `gorm:"type:varchar(1024);not null" json:"document_name"`
}

func (DriverDocument) TableName() string {
	return "driver_documents"
}
