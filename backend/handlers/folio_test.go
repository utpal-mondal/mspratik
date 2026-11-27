package handlers

import (
	"testing"
	"time"
)

func TestFolioFiscalYearStartUsesApril(t *testing.T) {
	tests := []struct {
		date string
		want string
	}{
		{date: "2026-03-31", want: "2025-04-01"},
		{date: "2026-04-01", want: "2026-04-01"},
		{date: "2026-11-27", want: "2026-04-01"},
	}
	for _, test := range tests {
		date, err := time.Parse("2006-01-02", test.date)
		if err != nil {
			t.Fatal(err)
		}
		if got := fiscalYearStart(date).Format("2006-01-02"); got != test.want {
			t.Errorf("fiscalYearStart(%s) = %q, want %q", test.date, got, test.want)
		}
	}
}

func TestFormatFolioNumberLimitsGeneratedNumbersToFiveDigits(t *testing.T) {
	for sequence, want := range map[uint64]string{
		1:     "00001",
		99999: "99999",
	} {
		got, err := formatFolioNumber(sequence)
		if err != nil || got != want {
			t.Errorf("formatFolioNumber(%d) = %q, %v; want %q", sequence, got, err, want)
		}
	}
	for _, sequence := range []uint64{0, 100000} {
		if _, err := formatFolioNumber(sequence); err == nil {
			t.Errorf("expected sequence %d to be rejected", sequence)
		}
	}
}

func TestValidateFolioRequestRequiresBranchFolioDateAndType(t *testing.T) {
	_, errors := validateFolioRequest(&folioRequest{})
	for _, field := range []string{"branch_id", "folio_no", "date", "folio_type"} {
		if errors[field] == "" {
			t.Errorf("expected a validation error for %q", field)
		}
	}
	if errors["amount"] != "" || errors["bank_payment"] != "" {
		t.Fatal("amount and bank payment should be optional")
	}
}

func TestValidateFolioRequestAcceptsRequiredFields(t *testing.T) {
	req := folioRequest{
		BranchID:  2,
		FolioNo:   "001",
		Date:      "2026-11-27",
		FolioType: "Normal",
	}
	date, errors := validateFolioRequest(&req)
	if len(errors) != 0 {
		t.Fatalf("expected valid folio details, got errors: %v", errors)
	}
	if req.FolioNo != "001" || date.Format("2006-01-02") != req.Date {
		t.Fatal("expected folio number and date to be preserved")
	}
}

func TestValidateFolioRequestAcceptsOnlyUpToSixDigits(t *testing.T) {
	for _, folioNo := range []string{"1", "123456"} {
		req := folioRequest{
			BranchID:  1,
			FolioNo:   folioNo,
			Date:      "2026-11-27",
			FolioType: "Normal",
		}
		_, fieldErrors := validateFolioRequest(&req)
		if fieldErrors["folio_no"] != "" {
			t.Errorf("expected folio number %q to be accepted, got %q", folioNo, fieldErrors["folio_no"])
		}
	}

	for _, folioNo := range []string{"1234567", "12a", "1.2", " 123"} {
		req := folioRequest{
			BranchID:  1,
			FolioNo:   folioNo,
			Date:      "2026-11-27",
			FolioType: "Normal",
		}
		_, fieldErrors := validateFolioRequest(&req)
		if fieldErrors["folio_no"] == "" {
			t.Errorf("expected folio number %q to be rejected", folioNo)
		}
	}
}

func TestParseOptionalFolioAmount(t *testing.T) {
	if amount, err := parseOptionalFolioAmount(""); err != nil || amount != nil {
		t.Fatalf("expected empty amount to be optional, got amount %v and error %v", amount, err)
	}
	if amount, err := parseOptionalFolioAmount("1200.50"); err != nil || amount == nil || *amount != 1200.5 {
		t.Fatalf("expected numeric amount, got amount %v and error %v", amount, err)
	}
	for _, input := range []string{"abc", "-1", "NaN", "Inf"} {
		if _, err := parseOptionalFolioAmount(input); err == nil {
			t.Errorf("expected amount %q to be rejected", input)
		}
	}
}
