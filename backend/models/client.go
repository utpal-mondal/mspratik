// backend/models/client.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Client struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	CompanyID     *uint          `gorm:"index" json:"company_id,omitempty"`
	ClientName    string         `gorm:"type:varchar(50);not null" json:"client_name"`
	ContactNo     string         `gorm:"type:varchar(20)" json:"contact_no,omitempty"`
	EmailID       string         `gorm:"type:varchar(50)" json:"email_id,omitempty"`
	ContactPerson string         `gorm:"type:varchar(50)" json:"contact_person,omitempty"`
	Address1      string         `gorm:"type:varchar(100)" json:"address_1,omitempty"`
	GstnNo        string         `gorm:"type:varchar(15)" json:"gstn_no,omitempty"`
	PanNo         string         `gorm:"type:varchar(10)" json:"pan_no,omitempty"`
	CreatedBy     int64          `json:"created_by,omitempty"`
	CreatedAt     *time.Time     `json:"created_at,omitempty"`
	UpdatedAt     *time.Time     `json:"updated_at,omitempty"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (Client) TableName() string {
	return "clients"
}
