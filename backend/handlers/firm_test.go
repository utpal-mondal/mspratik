package handlers

import "testing"

func TestValidateFirmRequestRequiresNameAndTaxNumbers(t *testing.T) {
	req := firmRequest{}
	errors := validateFirmRequest(&req)
	for _, field := range []string{"name", "pan_no", "gstn_no", "tan_no"} {
		if errors[field] == "" {
			t.Errorf("expected a validation error for %q", field)
		}
	}
	if errors["address_1"] != "" || errors["address_2"] != "" {
		t.Fatal("addresses should be optional")
	}
}

func TestValidateFirmRequestAcceptsValidFirm(t *testing.T) {
	cash := 1250.50
	req := firmRequest{
		Name:            "  Example Firm ",
		Address1:        "  First address ",
		Address2:        "  Second address ",
		PanNo:           "abcde1234f",
		GstnNo:          "27abcde1234f1z5",
		CashInHand:      &cash,
		ShortForm:       "  EF ",
		TanNo:           "abcd12345e",
		StartingSession: "2026-27",
	}
	if errors := validateFirmRequest(&req); len(errors) != 0 {
		t.Fatalf("expected valid firm details, got errors: %v", errors)
	}
	if req.Name != "Example Firm" || req.PanNo != "ABCDE1234F" ||
		req.GstnNo != "27ABCDE1234F1Z5" || req.TanNo != "ABCD12345E" {
		t.Fatal("expected firm names and tax identifiers to be trimmed and normalized")
	}
}

func TestValidateFirmRequestRejectsInvalidTaxNumbersAndCash(t *testing.T) {
	cash := -1.0
	req := firmRequest{
		Name:       "Example Firm",
		PanNo:      "invalid",
		GstnNo:     "invalid",
		TanNo:      "invalid",
		CashInHand: &cash,
	}
	errors := validateFirmRequest(&req)
	for _, field := range []string{"pan_no", "gstn_no", "tan_no", "cash_in_hand"} {
		if errors[field] == "" {
			t.Errorf("expected a validation error for %q", field)
		}
	}
}

func TestValidateFirmRequestAcceptsAllStartingSession(t *testing.T) {
	req := firmRequest{
		Name:            "Example Firm",
		PanNo:           "ABCDE1234F",
		GstnNo:          "27ABCDE1234F1Z5",
		TanNo:           "ABCD12345E",
		StartingSession: "all",
	}
	if errors := validateFirmRequest(&req); len(errors) != 0 {
		t.Fatalf("expected ALL starting session to be accepted, got errors: %v", errors)
	}
	if req.StartingSession != "ALL" {
		t.Fatal("expected starting session to be normalized to uppercase")
	}
}
