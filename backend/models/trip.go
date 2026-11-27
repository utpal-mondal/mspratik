package models

import "time"

type Trip struct {
	ID                        uint      `gorm:"primaryKey" json:"id"`
	FolioID                   uint      `gorm:"not null;index" json:"folio_id"`
	GRChallanNo               string    `gorm:"type:varchar(100);not null" json:"gr_challan_no"`
	Date                      time.Time `gorm:"type:date;not null" json:"date"`
	InvoiceNo                 string    `gorm:"type:varchar(100);not null" json:"invoice_no"`
	BillingWeighmentClient    string    `gorm:"type:varchar(20)" json:"billing_weighment_client"`
	BillingWeighmentBroker    string    `gorm:"type:varchar(20)" json:"billing_weighment_broker"`
	WeightPort                *float64  `gorm:"type:decimal(15,3)" json:"weight_port"`
	WeightGRN                 *float64  `gorm:"type:decimal(15,3)" json:"weight_grn"`
	WeightOther               *float64  `gorm:"type:decimal(15,3)" json:"weight_other"`
	ProductID                 uint      `gorm:"not null;index" json:"product_id"`
	LoadingPointID            uint      `gorm:"not null;index" json:"loading_point_id"`
	UnloadingPointID          uint      `gorm:"not null;index" json:"unloading_point_id"`
	ProductConditionOnLoading string    `gorm:"type:varchar(30);not null" json:"product_condition_on_loading"`
	VessalID                  *uint     `gorm:"index" json:"vessal_id"`
	FirmID                    uint      `gorm:"not null;index" json:"firm_id"`
	Session                   string    `gorm:"type:varchar(7);not null" json:"session"`
	VehicleID                 *uint     `gorm:"index" json:"vehicle_id"`
	VehicleNameFallback       string    `gorm:"type:varchar(100)" json:"vehicle_name_fallback"`
	Wheel                     *int      `json:"wheel"`
	VehicleType               string    `gorm:"type:varchar(30)" json:"vehicle_type"`
	BrokerID                  uint      `gorm:"not null;index" json:"broker_id"`
	UpperLimitCondition       string    `gorm:"type:varchar(100)" json:"upper_limit_condition"`
	BrokerPaymentType         string    `gorm:"type:varchar(30)" json:"broker_payment_type"`
	BrokerPrice               *float64  `gorm:"type:decimal(15,2)" json:"broker_price"`
	FuelQty                   *float64  `gorm:"type:decimal(15,3)" json:"fuel_qty"`
	FuelPrice                 *float64  `gorm:"type:decimal(15,2)" json:"fuel_price"`
	FuelAdvance               *float64  `gorm:"type:decimal(15,2)" json:"fuel_advance"`
	PumpID                    *uint     `gorm:"index" json:"pump_id"`
	CashAdvance               *float64  `gorm:"type:decimal(15,2)" json:"cash_advance"`
	AdvanceFromClient         *float64  `gorm:"type:decimal(15,2)" json:"advance_from_client"`
	TransportingCharges       *float64  `gorm:"type:decimal(15,2)" json:"transporting_charges"`
	TotalAdvance              *float64  `gorm:"type:decimal(15,2)" json:"total_advance"`
	ClientID                  uint      `gorm:"not null;index" json:"client_id"`
	ClientPrice               *float64  `gorm:"type:decimal(15,2)" json:"client_price"`
	ClientPaymentType         string    `gorm:"type:varchar(30)" json:"client_payment_type"`
	ClientAdvance             *float64  `gorm:"type:decimal(15,2)" json:"client_advance"`
	ConsignorID               uint      `gorm:"not null;index" json:"consignor_id"`
	CreatedAt                 time.Time `json:"created_at"`
	UpdatedAt                 time.Time `json:"updated_at"`
}

func (Trip) TableName() string {
	return "trip"
}
