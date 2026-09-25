// backend/models/company.go
package models

import (
	"time"

	"gorm.io/gorm"
)

type Company struct {
	ID                  uint           `gorm:"primaryKey" json:"id"`
	Name                string         `gorm:"type:varchar(30);not null" json:"name"`
	RoleName            string         `gorm:"type:text;not null" json:"role_name"`
	Address             string         `gorm:"type:varchar(100)" json:"address,omitempty"`
	Address2            string         `gorm:"type:varchar(100)" json:"address_2,omitempty"`
	PostCode            string         `gorm:"type:varchar(12)" json:"post_code,omitempty"`
	Region              string         `gorm:"type:varchar(50)" json:"region,omitempty"`
	City                string         `gorm:"type:varchar(100)" json:"city,omitempty"`
	Country             string         `gorm:"type:varchar(100)" json:"country,omitempty"`
	Email               string         `gorm:"type:varchar(50)" json:"email,omitempty"`
	EmailInvoice        string         `gorm:"type:varchar(100)" json:"email_invoice,omitempty"`
	PhoneNumber         string         `gorm:"type:varchar(20)" json:"phone_number,omitempty"`
	VatNumber           string         `gorm:"type:varchar(20)" json:"vat_number,omitempty"`
	InvoicePrefix       string         `gorm:"type:varchar(50)" json:"invoice_prefix,omitempty"`
	InvoiceAmountLayout int16          `gorm:"not null;default:1" json:"invoice_amount_layout"`
	Language            string         `gorm:"type:varchar(20)" json:"language,omitempty"`
	Currency            string         `gorm:"type:varchar(20)" json:"currency,omitempty"`
	ContactName         string         `gorm:"type:varchar(30)" json:"contact_name,omitempty"`
	ContactEmail        string         `gorm:"type:varchar(50)" json:"contact_email,omitempty"`
	ContactPhone        string         `gorm:"type:varchar(20)" json:"contact_phone,omitempty"`
	Remark              string         `gorm:"type:text" json:"remark,omitempty"`
	Status              bool           `gorm:"not null;default:false" json:"status"`
	IsVerified          bool           `gorm:"not null;default:false" json:"is_verified"`
	IsBlock             bool           `gorm:"not null;default:true" json:"is_block"`
	SubscriptionID      *uint          `gorm:"index" json:"subscription_id,omitempty"`
	MinOrderTotal       int64          `gorm:"default:0" json:"min_order_total,omitempty"`
	PurchaseDate        string         `gorm:"type:varchar(255)" json:"purchase_date,omitempty"`
	StartDate           string         `gorm:"type:varchar(255)" json:"start_date,omitempty"`
	RenewDate           string         `gorm:"type:varchar(255)" json:"renew_date,omitempty"`
	SubscriptionExpiry  string         `gorm:"type:varchar(3);check:subscription_expiry IN ('yes','no')" json:"subscription_expiry,omitempty"`
	Active              bool           `gorm:"not null;default:false" json:"active"`
	Expiry              string         `gorm:"type:varchar(3);check:expiry IN ('yes','no')" json:"expiry,omitempty"`
	ExpiredAt           *time.Time     `json:"expired_at,omitempty"`
	CreatedAt           *time.Time     `json:"created_at,omitempty"`
	UpdatedAt           *time.Time     `json:"updated_at,omitempty"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Users []User `gorm:"foreignKey:CompanyID" json:"users,omitempty"`
}

// TableName specifies the table name
func (Company) TableName() string {
	return "company"
}
