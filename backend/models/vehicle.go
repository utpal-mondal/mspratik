// backend/models/vehicle.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Vehicle struct {
	ID                     uint           `gorm:"primaryKey" json:"id"`
	CompanyID              *uint          `gorm:"index" json:"company_id,omitempty"`
	VehicleNumber          string         `gorm:"type:varchar(20);not null" json:"vehicle_number"`
	OwnerName              string         `gorm:"type:varchar(50)" json:"owner_name,omitempty"`
	OwnerPhone             string         `gorm:"type:varchar(20)" json:"owner_phone,omitempty"`
	VehicleType            string         `gorm:"type:varchar(20);default:'self'" json:"vehicle_type,omitempty"`
	NumberOfWheels         *int           `json:"number_of_wheels,omitempty"`
	RegistrationExpiryDate *time.Time     `gorm:"type:date" json:"registration_expiry_date,omitempty"`
	RcNumber               string         `gorm:"type:varchar(30)" json:"rc_number,omitempty"`
	PermitNumber           string         `gorm:"type:varchar(30)" json:"permit_number,omitempty"`
	InsuranceNumber        string         `gorm:"type:varchar(30)" json:"insurance_number,omitempty"`
	InsuranceExpiryDate    *time.Time     `gorm:"type:date" json:"insurance_expiry_date,omitempty"`
	PucNumber              string         `gorm:"type:varchar(30)" json:"puc_number,omitempty"`
	PucExpiryDate          *time.Time     `gorm:"type:date" json:"puc_expiry_date,omitempty"`
	RoadTaxExpiryDate      *time.Time     `gorm:"type:date" json:"road_tax_expiry_date,omitempty"`
	VehicleImage           *string        `gorm:"type:varchar(255)" json:"vehicle_image,omitempty"`
	RcBookImage            *string        `gorm:"type:varchar(255)" json:"rc_book_image,omitempty"`
	CreatedBy              int64          `json:"created_by,omitempty"`
	CreatedAt              *time.Time     `json:"created_at,omitempty"`
	UpdatedAt              *time.Time     `json:"updated_at,omitempty"`
	DeletedAt              gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (Vehicle) TableName() string {
	return "vehicles"
}
