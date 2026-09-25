// backend/models/user.go
package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	CompanyID      *uint          `gorm:"index" json:"company_id,omitempty"`
	Fname          string         `gorm:"type:varchar(30)" json:"fname,omitempty"`
	Lname          string         `gorm:"type:varchar(30)" json:"lname,omitempty"`
	Username       string         `gorm:"type:varchar(30);not null;uniqueIndex" json:"username"`
	Email          string         `gorm:"type:varchar(50);not null;uniqueIndex" json:"email"`
	Password       string         `gorm:"type:varchar(255)" json:"-"`
	PhoneNumber    string         `gorm:"type:varchar(20)" json:"phone_number,omitempty"`
	Usertype       int16          `gorm:"not null;default:2" json:"usertype"`
	IsActive       bool           `gorm:"not null;default:true" json:"is_active"`
	Language       string         `gorm:"type:varchar(2);not null;default:'nl'" json:"language"`
	Type           string         `gorm:"type:text;not null" json:"type"`
	UserType       string         `gorm:"type:text;not null" json:"user_type"`
	IsCadmin       string         `gorm:"type:char(1);not null;default:'0';check:is_cadmin IN ('0','1')" json:"is_cadmin"`
	CreatedBy      int64          `gorm:"not null" json:"created_by"`
	ReceiveNotify  bool           `gorm:"not null;default:false" json:"receive_notify"`
	LoginAllowedIP bool           `gorm:"not null;default:false" json:"login_allowed_ip"`
	IPAddress      string         `gorm:"type:varchar(20)" json:"ip_address,omitempty"`
	Tempass        string         `gorm:"type:char(1)" json:"tempass,omitempty"`
	PrinterPackage int64          `gorm:"not null;default:0" json:"printer_package"`
	LastLogin      *time.Time     `json:"last_login,omitempty"`
	CreatedAt      *time.Time     `json:"created_at,omitempty"`
	UpdatedAt      *time.Time     `json:"updated_at,omitempty"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Company *Company `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
	// Warehouses []Warehouse `gorm:"many2many:user_has_warehouses" json:"warehouses,omitempty"`
}

// BeforeCreate is a GORM hook that hashes the password before creating a user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

// CheckPassword verifies the password against the stored hash
func (u *User) CheckPassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
}

// TableName specifies the table name
func (User) TableName() string {
	return "users"
}
