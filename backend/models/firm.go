package models

import "time"

type Firm struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"type:varchar(100);not null" json:"name"`
	Address1        string    `gorm:"column:address_1;type:varchar(255)" json:"address_1,omitempty"`
	Address2        string    `gorm:"column:address_2;type:varchar(255)" json:"address_2,omitempty"`
	PanNo           string    `gorm:"type:varchar(10);not null" json:"pan_no"`
	GstnNo          string    `gorm:"type:varchar(15);not null" json:"gstn_no"`
	CashInHand      *float64  `gorm:"type:decimal(15,2)" json:"cash_in_hand,omitempty"`
	ShortForm       string    `gorm:"type:varchar(10)" json:"short_form,omitempty"`
	TanNo           string    `gorm:"type:varchar(10);not null" json:"tan_no"`
	StartingSession string    `gorm:"type:varchar(7)" json:"starting_session,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (Firm) TableName() string {
	return "firm"
}
