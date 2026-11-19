package handlers

import (
	"strings"
	"testing"

	"wms-backend/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func TestRoutesForCompanyUsesCreatorCompanyWithoutRouteCompanies(t *testing.T) {
	db, err := gorm.Open(mysql.New(mysql.Config{
		DSN:                       "root:root@tcp(127.0.0.1:3306)/wms",
		SkipInitializeWithVersion: true,
	}), &gorm.Config{
		DryRun:               true,
		DisableAutomaticPing: true,
	})
	if err != nil {
		t.Fatalf("open dry-run database: %v", err)
	}

	companyID := uint(42)
	var routes []models.Route
	result := routesForCompany(db, &companyID).Find(&routes)
	if result.Error != nil {
		t.Fatalf("build route query: %v", result.Error)
	}

	sql := result.Statement.SQL.String()
	if !strings.Contains(sql, "routes.created_by IN (SELECT") {
		t.Fatalf("expected company scope through route creator, got SQL: %s", sql)
	}
	if !strings.Contains(sql, "users") || !strings.Contains(sql, "company_id") {
		t.Fatalf("expected company users subquery, got SQL: %s", sql)
	}
	if strings.Contains(sql, "route_companies") {
		t.Fatalf("route query must not reference route_companies: %s", sql)
	}
}
