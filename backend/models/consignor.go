package models

import "time"

type Consignor struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Address     string    `gorm:"type:varchar(255)" json:"address,omitempty"`
	Email       string    `gorm:"type:varchar(100)" json:"email,omitempty"`
	PhoneNumber string    `gorm:"type:varchar(10)" json:"phone_number,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Consignor) TableName() string {
	return "consignor"
}
