package handlers

import (
	"log"
	"net/mail"
	"strconv"
	"strings"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type consignorRequest struct {
	Name        string `json:"name"`
	Address     string `json:"address"`
	Email       string `json:"email"`
	PhoneNumber string `json:"phone_number"`
}

func validateConsignorRequest(req *consignorRequest) map[string]string {
	errors := map[string]string{}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		errors["name"] = "Consignor name is required"
	} else if len(req.Name) > 100 {
		errors["name"] = "Consignor name must be 100 characters or fewer"
	}

	req.Address = strings.TrimSpace(req.Address)
	if len(req.Address) > 255 {
		errors["address"] = "Address must be 255 characters or fewer"
	}

	req.Email = strings.TrimSpace(req.Email)
	if len(req.Email) > 100 {
		errors["email"] = "Email must be 100 characters or fewer"
	} else if req.Email != "" {
		if _, err := mail.ParseAddress(req.Email); err != nil {
			errors["email"] = "Enter a valid email address"
		}
	}

	req.PhoneNumber = strings.TrimSpace(req.PhoneNumber)
	if req.PhoneNumber != "" {
		if len(req.PhoneNumber) != 10 {
			errors["phone_number"] = "Mobile number must be exactly 10 digits"
		}
		for _, digit := range req.PhoneNumber {
			if digit < '0' || digit > '9' {
				errors["phone_number"] = "Mobile number must contain digits only"
				break
			}
		}
	}

	return errors
}

func GetConsignors(c *fiber.Ctx, db *gorm.DB) error {
	consignors := make([]models.Consignor, 0)
	query := db.Model(&models.Consignor{})
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where(
			"name LIKE ? OR address LIKE ? OR email LIKE ? OR phone_number LIKE ?",
			like, like, like, like,
		)
	}
	if err := query.Order("id DESC").Find(&consignors).Error; err != nil {
		log.Printf("Failed to fetch consignors: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch consignors",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": consignors})
}

func GetConsignor(c *fiber.Ctx, db *gorm.DB) error {
	consignorID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid consignor id",
		})
	}

	var consignor models.Consignor
	if err := db.First(&consignor, consignorID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "fail", "message": "Consignor not found",
			})
		}
		log.Printf("Failed to fetch consignor %d: %v", consignorID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch consignor",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": consignor})
}

func CreateConsignor(c *fiber.Ctx, db *gorm.DB) error {
	var req consignorRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid request body",
		})
	}
	if errors := validateConsignorRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "errors": errors,
		})
	}

	consignor := models.Consignor{
		Name:        req.Name,
		Address:     req.Address,
		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,
	}
	if err := db.Create(&consignor).Error; err != nil {
		log.Printf("Failed to create consignor: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to create consignor",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": consignor})
}

func UpdateConsignor(c *fiber.Ctx, db *gorm.DB) error {
	consignorID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid consignor id",
		})
	}

	var consignor models.Consignor
	if err := db.First(&consignor, consignorID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "fail", "message": "Consignor not found",
			})
		}
		log.Printf("Failed to fetch consignor %d: %v", consignorID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch consignor",
		})
	}

	var req consignorRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid request body",
		})
	}
	if errors := validateConsignorRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "errors": errors,
		})
	}

	if err := db.Model(&consignor).Updates(map[string]interface{}{
		"name":         req.Name,
		"address":      req.Address,
		"email":        req.Email,
		"phone_number": req.PhoneNumber,
	}).Error; err != nil {
		log.Printf("Failed to update consignor %d: %v", consignorID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to update consignor",
		})
	}
	if err := db.First(&consignor, consignorID).Error; err != nil {
		log.Printf("Failed to reload updated consignor %d: %v", consignorID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to load updated consignor",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": consignor})
}

func DeleteConsignor(c *fiber.Ctx, db *gorm.DB) error {
	consignorID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid consignor id",
		})
	}

	result := db.Delete(&models.Consignor{}, consignorID)
	if result.Error != nil {
		log.Printf("Failed to delete consignor %d: %v", consignorID, result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to delete consignor",
		})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status": "fail", "message": "Consignor not found",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Consignor deleted successfully"})
}
