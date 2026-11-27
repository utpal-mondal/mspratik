package handlers

import (
	"testing"
	"time"
)

func TestValidateTripRequestRequiresMarkedFields(t *testing.T) {
	_, fieldErrors := validateTripRequest(&tripRequest{})
	for _, field := range []string{
		"gr_challan_no",
		"date",
		"invoice_no",
		"product_id",
		"loading_point_id",
		"unloading_point_id",
		"product_condition_on_loading",
		"firm_id",
		"broker_id",
		"client_id",
		"consignor_id",
		"vehicle_name_fallback",
	} {
		if fieldErrors[field] == "" {
			t.Errorf("expected a validation error for %q", field)
		}
	}
}

func TestValidateTripRequestAcceptsRequiredFieldsAndConfiguredOptions(t *testing.T) {
	req := tripRequest{
		GRChallanNo:               "GR-100",
		Date:                      "2026-11-27",
		InvoiceNo:                 "INV-100",
		BillingWeighmentClient:    "PORT",
		BillingWeighmentBroker:    "GREEN",
		ProductID:                 1,
		LoadingPointID:            1,
		UnloadingPointID:          1,
		ProductConditionOnLoading: "Heavy Moisture",
		FirmID:                    1,
		VehicleID:                 uintPointer(1),
		VehicleType:               "Truck",
		BrokerID:                  1,
		BrokerPaymentType:         "Under Loading",
		ClientID:                  1,
		ClientPaymentType:         "Fixed",
		ConsignorID:               1,
	}
	date, fieldErrors := validateTripRequest(&req)
	if len(fieldErrors) != 0 {
		t.Fatalf("expected valid trip details, got errors: %v", fieldErrors)
	}
	if got := date.Format("2006-01-02"); got != req.Date {
		t.Fatalf("parsed trip date = %q, want %q", got, req.Date)
	}
}

func TestValidateTripRequestAcceptsVehicleNameWhenRCIsNotInDatabase(t *testing.T) {
	req := tripRequest{
		GRChallanNo:               "GR-100",
		Date:                      "2026-11-27",
		InvoiceNo:                 "INV-100",
		ProductID:                 1,
		LoadingPointID:            1,
		UnloadingPointID:          1,
		ProductConditionOnLoading: "Normal",
		FirmID:                    1,
		VehicleNameFallback:       "WB 15 ABC 1234",
		BrokerID:                  1,
		ClientID:                  1,
		ConsignorID:               1,
	}
	_, fieldErrors := validateTripRequest(&req)
	if fieldErrors["vehicle_name_fallback"] != "" {
		t.Fatalf("expected fallback vehicle name to satisfy vehicle selection, got %q", fieldErrors["vehicle_name_fallback"])
	}

	req.VehicleID = uintPointer(1)
	_, fieldErrors = validateTripRequest(&req)
	if fieldErrors["vehicle_name_fallback"] == "" {
		t.Fatal("expected an error when both a database vehicle and fallback name are provided")
	}
}

func TestValidateTripRequestRejectsUnknownDropdownValues(t *testing.T) {
	req := tripRequest{
		GRChallanNo:               "GR-100",
		Date:                      "2026-11-27",
		InvoiceNo:                 "INV-100",
		BillingWeighmentClient:    "UNKNOWN",
		BillingWeighmentBroker:    "UNKNOWN",
		ProductID:                 1,
		LoadingPointID:            1,
		UnloadingPointID:          1,
		ProductConditionOnLoading: "UNKNOWN",
		FirmID:                    1,
		VehicleID:                 uintPointer(1),
		VehicleType:               "UNKNOWN",
		BrokerID:                  1,
		BrokerPaymentType:         "UNKNOWN",
		ClientID:                  1,
		ClientPaymentType:         "UNKNOWN",
		ConsignorID:               1,
	}
	_, fieldErrors := validateTripRequest(&req)
	for _, field := range []string{
		"billing_weighment_client",
		"billing_weighment_broker",
		"product_condition_on_loading",
		"vehicle_type",
		"broker_payment_type",
		"client_payment_type",
	} {
		if fieldErrors[field] == "" {
			t.Errorf("expected a validation error for %q", field)
		}
	}
}

func uintPointer(value uint) *uint {
	return &value
}

func TestSessionForDateUsesAprilToMarchFinancialYear(t *testing.T) {
	for _, test := range []struct {
		date string
		want string
	}{
		{"2026-03-31", "2025-26"},
		{"2026-04-01", "2026-27"},
		{"2026-11-27", "2026-27"},
	} {
		date, err := time.Parse("2006-01-02", test.date)
		if err != nil {
			t.Fatal(err)
		}
		if got := sessionForDate(date); got != test.want {
			t.Errorf("sessionForDate(%s) = %q, want %q", test.date, got, test.want)
		}
	}
}
