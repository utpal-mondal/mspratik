package models

import "time"

type UnloadingPoint struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	Name                  string    `gorm:"type:varchar(100);not null" json:"name"`
	ContactPerson         *string   `gorm:"type:varchar(100)" json:"contact_person"`
	ContactPersonMobileNo *string   `gorm:"type:varchar(20)" json:"contact_person_mobile_no"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

func (UnloadingPoint) TableName() string {
	return "unloading_point"
}
