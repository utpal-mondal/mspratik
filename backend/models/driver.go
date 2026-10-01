// backend/models/driver.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Driver struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	CompanyID       *uint          `gorm:"index" json:"company_id,omitempty"`
	DriverName      string         `gorm:"type:varchar(50);not null" json:"driver_name"`
	PhoneNumber     string         `gorm:"type:varchar(20)" json:"phone_number,omitempty"`
	ExperienceYears *int           `json:"experience_years,omitempty"`
	LicenceNumber   string         `gorm:"type:varchar(30)" json:"licence_number,omitempty"`
	DriverPhoto     *string        `gorm:"type:varchar(255)" json:"driver_photo,omitempty"`
	LicenceImage    *string        `gorm:"type:varchar(255)" json:"licence_image,omitempty"`
	CreatedBy       int64          `json:"created_by,omitempty"`
	CreatedAt       *time.Time     `json:"created_at,omitempty"`
	UpdatedAt       *time.Time     `json:"updated_at,omitempty"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (Driver) TableName() string {
	return "drivers"
}
