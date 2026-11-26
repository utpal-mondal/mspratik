package handlers

import "testing"

func TestValidateConsignorRequestRequiresName(t *testing.T) {
	req := consignorRequest{Name: " ", Address: "Some address"}
	errors := validateConsignorRequest(&req)
	if errors["name"] == "" {
		t.Fatal("expected a validation error for an empty name")
	}
	if errors["address"] != "" {
		t.Fatal("address should be optional")
	}
}

func TestValidateConsignorRequestAcceptsOptionalFields(t *testing.T) {
	req := consignorRequest{
		Name:        "  Acme Logistics ",
		Address:     "  10 Main Road ",
		Email:       "  contact@example.com ",
		PhoneNumber: " 1234567890 ",
	}
	if errors := validateConsignorRequest(&req); len(errors) != 0 {
		t.Fatalf("expected valid consignor details, got errors: %v", errors)
	}
	if req.Name != "Acme Logistics" || req.PhoneNumber != "1234567890" {
		t.Fatal("expected name and phone number to be trimmed")
	}
}

func TestValidateConsignorRequestRejectsInvalidPhoneNumbers(t *testing.T) {
	for _, phoneNumber := range []string{"123456789", "12345678901", "12345abc90"} {
		req := consignorRequest{Name: "Acme Logistics", PhoneNumber: phoneNumber}
		if errors := validateConsignorRequest(&req); errors["phone_number"] == "" {
			t.Errorf("expected a validation error for phone number %q", phoneNumber)
		}
	}
}
