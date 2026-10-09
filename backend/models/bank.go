// backend/models/bank.go
package models

import (
	"time"
)

type Bank struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	BankName  string     `gorm:"type:varchar(100);not null" json:"bank_name"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

// TableName specifies the table name
func (Bank) TableName() string {
	return "banks"
}
