package seed

import (
	"log"

	"wms-backend/models"

	"gorm.io/gorm"
)

func SeedInitialData(db *gorm.DB) error {
	// Create a default admin role
	role := &models.Role{
		Name: "admin",
	}

	if err := db.FirstOrCreate(role, "name = ?", "admin").Error; err != nil {
		log.Printf("Error creating admin role: %v", err)
		return err
	}

	// Assign all permissions to admin role
	var allPermissions []models.Permission
	if err := db.Find(&allPermissions).Error; err != nil {
		log.Printf("Error fetching permissions: %v", err)
		return err
	}

	for _, permission := range allPermissions {
		rolePermission := &models.RoleHasPermission{
			RoleID:       role.ID,
			PermissionID: permission.ID,
		}
		if err := db.FirstOrCreate(rolePermission, "role_id = ? AND permission_id = ?", role.ID, permission.ID).Error; err != nil {
			log.Printf("Error assigning permission to role: %v", err)
		}
	}

	// Create a default admin user
	admin := &models.User{
		Username:  "admin",
		Email:     "admin@example.com",
		Password:  "admin123", // Will be hashed by BeforeCreate hook
		Usertype:  1,          // Admin
		IsActive:  true,
		UserType:  "admin",
		CreatedBy: 0, // System
	}

	if err := db.FirstOrCreate(admin, "email = ?", "admin@example.com").Error; err != nil {
		log.Printf("Error creating admin user: %v", err)
		return err
	}

	// Seed bank master data
	// bankNames := []string{
	// 	"State Bank of India",
	// 	"HDFC Bank",
	// 	"ICICI Bank",
	// 	"Punjab National Bank",
	// 	"Bank of Baroda",
	// 	"Axis Bank",
	// 	"Kotak Mahindra Bank",
	// 	"Canara Bank",
	// 	"Union Bank of India",
	// 	"IDBI Bank",
	// }
	// for _, name := range bankNames {
	// 	bank := &models.Bank{BankName: name}
	// 	if err := db.FirstOrCreate(bank, "bank_name = ?", name).Error; err != nil {
	// 		log.Printf("Error seeding bank %s: %v", name, err)
	// 	}
	// }

	log.Println("Database seeded successfully")
	return nil
}
