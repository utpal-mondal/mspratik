package models

import "time"

type Branch struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Head        string    `gorm:"type:varchar(100);not null" json:"head"`
	Address     string    `gorm:"type:varchar(255);not null" json:"address"`
	PhoneNumber string    `gorm:"type:varchar(20)" json:"phone_number,omitempty"`
	Email       string    `gorm:"type:varchar(100)" json:"email,omitempty"`
	Latitude    *float64  `gorm:"type:decimal(10,7)" json:"latitude,omitempty"`
	Longitude   *float64  `gorm:"type:decimal(11,7)" json:"longitude,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Branch) TableName() string {
	return "branch"
}
