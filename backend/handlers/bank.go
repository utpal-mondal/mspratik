// backend/handlers/bank.go
package handlers

import (
	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetBanks lists all banks for dropdowns
// GET /banks/get-all-bank
func GetBanks(c *fiber.Ctx, db *gorm.DB) error {
	_, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	var banks []models.Bank
	if err := db.Order("bank_name ASC").Find(&banks).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch banks"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": banks})
}
