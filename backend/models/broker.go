// backend/models/broker.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Broker struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	CompanyID      *uint          `gorm:"index" json:"company_id,omitempty"`
	BrokerName     string         `gorm:"type:varchar(50);not null" json:"broker_name"`
	ContactNo      string         `gorm:"type:varchar(20)" json:"contact_no,omitempty"`
	EmailID        string         `gorm:"type:varchar(50)" json:"email_id,omitempty"`
	ContactPerson  string         `gorm:"type:varchar(50)" json:"contact_person,omitempty"`
	Address1       string         `gorm:"type:varchar(100)" json:"address_1,omitempty"`
	Address2       string         `gorm:"type:varchar(100)" json:"address_2,omitempty"`
	Address3       string         `gorm:"type:varchar(100)" json:"address_3,omitempty"`
	OpeningBalance *float64       `gorm:"type:decimal(15,2)" json:"opening_balance,omitempty"`
	PreviousDue    *float64       `gorm:"type:decimal(15,2)" json:"previous_due,omitempty"`
	GstnNo         string         `gorm:"type:varchar(15)" json:"gstn_no,omitempty"`
	PanNo          string         `gorm:"type:varchar(10)" json:"pan_no,omitempty"`
	ShortForm      string         `gorm:"type:varchar(10)" json:"short_form,omitempty"`
	BankerName     string         `gorm:"type:varchar(50)" json:"banker_name,omitempty"`
	BankID         *uint          `gorm:"index" json:"bank_id,omitempty"`
	BranchName     string         `gorm:"type:varchar(50)" json:"branch_name,omitempty"`
	AccountNo      string         `gorm:"type:varchar(20)" json:"account_no,omitempty"`
	IfscCode       string         `gorm:"type:varchar(11)" json:"ifsc_code,omitempty"`
	BrokerType     string         `gorm:"type:varchar(20);default:normal" json:"broker_type,omitempty"`
	OwnerBillType  string         `gorm:"type:varchar(20);default:normal" json:"owner_bill_type,omitempty"`
	AdharNo        string         `gorm:"type:varchar(12)" json:"adhar_no,omitempty"`
	QtyRound       string         `gorm:"type:varchar(20);default:not_applicable" json:"qty_round,omitempty"`
	CreatedBy      int64          `json:"created_by,omitempty"`
	CreatedAt      *time.Time     `json:"created_at,omitempty"`
	UpdatedAt      *time.Time     `json:"updated_at,omitempty"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// TableName specifies the table name
func (Broker) TableName() string {
	return "brokers"
}
