package models

import (
	"time"
)

type Folio struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	BranchID    uint      `gorm:"not null;index" json:"branch_id"`
	Branch      Branch    `gorm:"foreignKey:BranchID" json:"branch"`
	FolioNo     string    `gorm:"type:varchar(32);not null;uniqueIndex:uq_folio_date_folio_no,priority:2" json:"folio_no"`
	Amount      *float64  `gorm:"type:decimal(12,2)" json:"amount"`
	BankPayment *float64  `gorm:"type:decimal(12,2)" json:"bank_payment"`
	Date        time.Time `gorm:"type:date;not null;index;uniqueIndex:uq_folio_date_folio_no,priority:1" json:"date"`
	Remark      string    `gorm:"type:text" json:"remark"`
	FolioType   string    `gorm:"type:varchar(20);not null" json:"folio_type"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Folio) TableName() string {
	return "folio"
}
