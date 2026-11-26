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

type branchRequest struct {
	Name        string   `json:"name"`
	Head        string   `json:"head"`
	Address     string   `json:"address"`
	PhoneNumber string   `json:"phone_number"`
	Email       string   `json:"email"`
	Latitude    *float64 `json:"latitude"`
	Longitude   *float64 `json:"longitude"`
}

func validateBranchRequest(req *branchRequest) map[string]string {
	errors := map[string]string{}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		errors["name"] = "Branch name is required"
	} else if len(req.Name) > 100 {
		errors["name"] = "Branch name must be 100 characters or fewer"
	}

	req.Head = strings.TrimSpace(req.Head)
	if req.Head == "" {
		errors["head"] = "Branch head is required"
	} else if len(req.Head) > 100 {
		errors["head"] = "Branch head must be 100 characters or fewer"
	}

	req.Address = strings.TrimSpace(req.Address)
	if req.Address == "" {
		errors["address"] = "Branch address is required"
	} else if len(req.Address) > 255 {
		errors["address"] = "Branch address must be 255 characters or fewer"
	}

	req.PhoneNumber = strings.TrimSpace(req.PhoneNumber)
	if req.PhoneNumber != "" && len(req.PhoneNumber) != 10 {
		errors["phone_number"] = "Phone number must be exactly 10 digits"
	}
	for _, digit := range req.PhoneNumber {
		if digit < '0' || digit > '9' {
			errors["phone_number"] = "Phone number must contain digits only"
			break
		}
	}

	req.Email = strings.TrimSpace(req.Email)
	if len(req.Email) > 100 {
		errors["email"] = "Email must be 100 characters or fewer"
	} else if req.Email != "" {
		if _, err := mail.ParseAddress(req.Email); err != nil {
			errors["email"] = "Enter a valid email address"
		}
	}

	if (req.Latitude == nil) != (req.Longitude == nil) {
		errors["latitude"] = "Latitude and longitude must both be provided"
		errors["longitude"] = "Latitude and longitude must both be provided"
	}
	if req.Latitude != nil && (*req.Latitude < -90 || *req.Latitude > 90) {
		errors["latitude"] = "Enter a valid latitude"
	}
	if req.Longitude != nil && (*req.Longitude < -180 || *req.Longitude > 180) {
		errors["longitude"] = "Enter a valid longitude"
	}

	return errors
}

func GetBranches(c *fiber.Ctx, db *gorm.DB) error {
	var branches []models.Branch
	query := db.Model(&models.Branch{})
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where(
			"name LIKE ? OR head LIKE ? OR address LIKE ? OR phone_number LIKE ? OR email LIKE ?",
			like, like, like, like, like,
		)
	}
	if err := query.Order("id DESC").Find(&branches).Error; err != nil {
		log.Printf("Failed to fetch branches: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch branches"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": branches})
}

func GetBranch(c *fiber.Ctx, db *gorm.DB) error {
	branchID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid branch id"})
	}

	var branch models.Branch
	if err := db.First(&branch, branchID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Branch not found"})
		}
		log.Printf("Failed to fetch branch %d: %v", branchID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch branch"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": branch})
}

func CreateBranch(c *fiber.Ctx, db *gorm.DB) error {
	var req branchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}
	if errors := validateBranchRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	branch := models.Branch{
		Name:        req.Name,
		Head:        req.Head,
		Address:     req.Address,
		PhoneNumber: req.PhoneNumber,
		Email:       req.Email,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
	}
	if err := db.Create(&branch).Error; err != nil {
		log.Printf("Failed to create branch: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create branch"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": branch})
}

func UpdateBranch(c *fiber.Ctx, db *gorm.DB) error {
	branchID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid branch id"})
	}

	var branch models.Branch
	if err := db.First(&branch, branchID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Branch not found"})
		}
		log.Printf("Failed to fetch branch %d: %v", branchID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch branch"})
	}

	var req branchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}
	if errors := validateBranchRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	if err := db.Model(&branch).Updates(map[string]interface{}{
		"name":         req.Name,
		"head":         req.Head,
		"address":      req.Address,
		"phone_number": req.PhoneNumber,
		"email":        req.Email,
		"latitude":     req.Latitude,
		"longitude":    req.Longitude,
	}).Error; err != nil {
		log.Printf("Failed to update branch %d: %v", branchID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update branch"})
	}

	if err := db.First(&branch, branchID).Error; err != nil {
		log.Printf("Failed to reload updated branch %d: %v", branchID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to load updated branch"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": branch})
}

func DeleteBranch(c *fiber.Ctx, db *gorm.DB) error {
	branchID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid branch id"})
	}

	result := db.Delete(&models.Branch{}, branchID)
	if result.Error != nil {
		log.Printf("Failed to delete branch %d: %v", branchID, result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete branch"})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Branch not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Branch deleted successfully"})
}
