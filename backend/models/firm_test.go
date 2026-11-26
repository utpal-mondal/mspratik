package models

import (
	"sync"
	"testing"

	"gorm.io/gorm/schema"
)

func TestFirmAddressColumnsMatchMigration(t *testing.T) {
	firmSchema, err := schema.Parse(&Firm{}, &sync.Map{}, schema.NamingStrategy{})
	if err != nil {
		t.Fatalf("failed to parse firm schema: %v", err)
	}

	for field, column := range map[string]string{
		"Address1": "address_1",
		"Address2": "address_2",
	} {
		fieldSchema, ok := firmSchema.FieldsByName[field]
		if !ok {
			t.Fatalf("Firm is missing field %s", field)
		}
		if got := fieldSchema.DBName; got != column {
			t.Errorf("%s maps to %q; want %q", field, got, column)
		}
	}
}
