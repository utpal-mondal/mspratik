package handlers

import "testing"

func TestValidatePointRequestRequiresOnlyName(t *testing.T) {
	req := pointRequest{}
	errors := validatePointRequest(&req)
	if errors["name"] == "" {
		t.Fatal("expected a validation error for an empty name")
	}
	if errors["contact_person"] != "" || errors["contact_person_mobile_no"] != "" {
		t.Fatal("contact fields should be optional")
	}
}

func TestValidatePointRequestAcceptsNameWithoutContactValues(t *testing.T) {
	req := pointRequest{Name: "Main depot"}
	if errors := validatePointRequest(&req); len(errors) != 0 {
		t.Fatalf("expected name-only point details to be valid, got errors: %v", errors)
	}
}

func TestValidatePointRequestTrimsProvidedContactValues(t *testing.T) {
	req := pointRequest{
		Name:                  "  Main depot ",
		ContactPerson:         "  Depot manager ",
		ContactPersonMobileNo: "9876543210",
	}
	if errors := validatePointRequest(&req); len(errors) != 0 {
		t.Fatalf("expected valid point details, got errors: %v", errors)
	}
	if req.Name != "Main depot" || req.ContactPerson != "Depot manager" || req.ContactPersonMobileNo != "9876543210" {
		t.Fatal("expected point details to be trimmed")
	}
}

func TestValidatePointRequestRejectsInvalidMobileNumbers(t *testing.T) {
	for _, mobileNumber := range []string{
		"123456789",
		"12345678901",
		"12345abc90",
		"123-567890",
		" 1234567890 ",
	} {
		req := pointRequest{Name: "Main depot", ContactPersonMobileNo: mobileNumber}
		if errors := validatePointRequest(&req); errors["contact_person_mobile_no"] == "" {
			t.Errorf("expected mobile number %q to be rejected", mobileNumber)
		}
	}
}
