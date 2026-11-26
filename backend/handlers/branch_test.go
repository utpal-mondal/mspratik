package handlers

import "testing"

func TestValidateBranchRequestRequiresNameHeadAndAddress(t *testing.T) {
	req := branchRequest{
		Name:        " ",
		Head:        " ",
		Address:     " ",
		PhoneNumber: "",
		Email:       "",
	}

	errors := validateBranchRequest(&req)
	for _, field := range []string{"name", "head", "address"} {
		if errors[field] == "" {
			t.Errorf("expected a validation error for %q", field)
		}
	}
	if errors["phone_number"] != "" || errors["email"] != "" {
		t.Fatal("optional contact fields should not be required")
	}
}

func TestValidateBranchRequestAcceptsRequiredFieldsAndOptionalContacts(t *testing.T) {
	req := branchRequest{
		Name:        "  Main Branch ",
		Head:        "  Branch Manager ",
		Address:     "  10 Main Road ",
		PhoneNumber: " 1234567890 ",
		Email:       " manager@example.com ",
	}

	if errors := validateBranchRequest(&req); len(errors) != 0 {
		t.Fatalf("expected valid branch details, got errors: %v", errors)
	}
	if req.Name != "Main Branch" || req.Head != "Branch Manager" || req.Address != "10 Main Road" {
		t.Fatal("expected required branch fields to be trimmed")
	}
}

func TestValidateBranchRequestRejectsNonNumericPhoneNumber(t *testing.T) {
	req := branchRequest{
		Name:        "Main Branch",
		Head:        "Branch Manager",
		Address:     "10 Main Road",
		PhoneNumber: "123-456",
	}

	if errors := validateBranchRequest(&req); errors["phone_number"] == "" {
		t.Fatal("expected a validation error for a phone number containing non-digits")
	}
}

func TestValidateBranchRequestRequiresTenDigitPhoneNumberWhenProvided(t *testing.T) {
	for _, phoneNumber := range []string{"123456789", "12345678901"} {
		req := branchRequest{
			Name:        "Main Branch",
			Head:        "Branch Manager",
			Address:     "10 Main Road",
			PhoneNumber: phoneNumber,
		}

		if errors := validateBranchRequest(&req); errors["phone_number"] == "" {
			t.Errorf("expected a validation error for phone number %q", phoneNumber)
		}
	}
}

func TestValidateBranchRequestRequiresValidCoordinatePair(t *testing.T) {
	latitude := 91.0
	req := branchRequest{
		Name:      "Main Branch",
		Head:      "Branch Manager",
		Address:   "10 Main Road",
		Latitude:  &latitude,
		Longitude: nil,
	}

	errors := validateBranchRequest(&req)
	if errors["latitude"] == "" || errors["longitude"] == "" {
		t.Fatal("expected an error when latitude and longitude are not both provided")
	}
}
