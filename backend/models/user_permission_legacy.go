package models

import "time"

// UserPermissionLegacy represents the user_permissions table.
// This is a legacy structure and might be replaced by the role-based system.
type UserPermissionLegacy struct {
	UID            uint64     `gorm:"primaryKey;column:uid;autoIncrement:false" json:"uid"`
	Orders         *string    `gorm:"type:varchar(20)" json:"orders,omitempty"`
	Picklists      *string    `gorm:"type:varchar(20)" json:"picklists,omitempty"`
	Backorders     *string    `gorm:"type:varchar(20)" json:"backorders,omitempty"`
	PurchaseOrders *string    `gorm:"type:varchar(20)" json:"purchase_orders,omitempty"`
	Receipts       *string    `gorm:"type:varchar(20)" json:"receipts,omitempty"`
	Products       *string    `gorm:"type:varchar(20)" json:"products,omitempty"`
	Warehouses     *string    `gorm:"type:varchar(20)" json:"warehouses,omitempty"`
	Locations      *string    `gorm:"type:varchar(20)" json:"locations,omitempty"`
	Reports        *string    `gorm:"type:varchar(20)" json:"reports,omitempty"`
	ExportsImports *string    `gorm:"type:varchar(20)" json:"exports_imports,omitempty"`
	ReturnOrders   *string    `gorm:"type:varchar(20)" json:"return_orders,omitempty"`
	Shipments      *string    `gorm:"type:varchar(20)" json:"shipments,omitempty"`
	Settings       *string    `gorm:"type:varchar(20)" json:"settings,omitempty"`
	Customers      *string    `gorm:"type:varchar(20)" json:"customers,omitempty"`
	Invoice        *string    `gorm:"type:varchar(20)" json:"invoice,omitempty"`
	CreatedAt      *time.Time `json:"created_at,omitempty"`
	UpdatedAt      *time.Time `json:"updated_at,omitempty"`
}

// TableName specifies the table name for the UserPermissionLegacy model.
func (UserPermissionLegacy) TableName() string {
	return "user_permissions"
}
