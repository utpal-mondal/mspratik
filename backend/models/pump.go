// backend/models/pump.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Pump struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	CompanyID      *uint          `gorm:"index" json:"company_id,omitempty"`
	PumpName       string         `gorm:"type:varchar(50);not null" json:"pump_name"`
	ContactNo      string         `gorm:"type:varchar(20)" json:"contact_no,omitempty"`
	EmailID        string         `gorm:"type:varchar(50)" json:"email_id,omitempty"`
	ContactPerson  string         `gorm:"type:varchar(50)" json:"contact_person,omitempty"`
	Address1       string         `gorm:"type:varchar(100)" json:"address_1,omitempty"`
	Address2       string         `gorm:"type:varchar(100)" json:"address_2,omitempty"`
	Address3       string         `gorm:"type:varchar(100)" json:"address_3,omitempty"`
	OpeningBalance *float64       `gorm:"type:decimal(15,2)" json:"opening_balance,omitempty"`
	GstnNo         string         `gorm:"type:varchar(15)" json:"gstn_no,omitempty"`
	PanNo          string         `gorm:"type:varchar(10)" json:"pan_no,omitempty"`
	BankerName     string         `gorm:"type:varchar(50)" json:"banker_name,omitempty"`
	BranchName     string         `gorm:"type:varchar(50)" json:"branch_name,omitempty"`
	AccountNo      string         `gorm:"type:varchar(20)" json:"account_no,omitempty"`
	IfscCode       string         `gorm:"type:varchar(11)" json:"ifsc_code,omitempty"`
	CreatedBy      int64          `json:"created_by,omitempty"`
	CreatedAt      *time.Time     `json:"created_at,omitempty"`
	UpdatedAt      *time.Time     `json:"updated_at,omitempty"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (Pump) TableName() string {
	return "pumps"
}
