//go:build ignore

// One-off migration runner: creates the vehicle_documents table.
// Run: go run cmd/migrate_vehicle_documents.go
package main

import (
	"log"

	"wms-backend/database"
	"wms-backend/models"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables")
	}
	db, err := database.Init()
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	if err := db.AutoMigrate(&models.VehicleDocument{}); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("vehicle_documents table created/verified")
}
