// backend/handlers/company.go
package handlers

import (
	"time"

	"wms-backend/middleware"
	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetCompanyDetails returns the company of the current company admin
// GET /settings/company-details
func GetCompanyDetails(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := c.Locals("user").(middleware.AuthUser)
	if !ok || authUser.CompanyID == nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "fail",
			"message": "User is not associated with a company",
		})
	}

	var company models.Company
	if err := db.First(&company, *authUser.CompanyID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "fail",
			"message": "Company not found",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": company})
}

type companyDetailsRequest struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	PhoneNumber  string `json:"phone_number"`
	VatNumber    string `json:"vat_number"`
	Address      string `json:"address"`
	Address2     string `json:"address_2"`
	PostCode     string `json:"post_code"`
	Region       string `json:"region"`
	City         string `json:"city"`
	Country      string `json:"country"`
	Language     string `json:"language"`
	Currency     string `json:"currency"`
	ContactName  string `json:"contact_name"`
	ContactEmail string `json:"contact_email"`
	ContactPhone string `json:"contact_phone"`
	Remark       string `json:"remark"`
}

// UpdateCompanyDetails updates the company of the current company admin
// PUT /settings/company-details
func UpdateCompanyDetails(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := c.Locals("user").(middleware.AuthUser)
	if !ok || authUser.CompanyID == nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "fail",
			"message": "User is not associated with a company",
		})
	}

	var company models.Company
	if err := db.First(&company, *authUser.CompanyID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "fail",
			"message": "Company not found",
		})
	}

	var req companyDetailsRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "fail",
			"message": "Invalid request body",
		})
	}

	updates := map[string]interface{}{
		"email":         req.Email,
		"phone_number":  req.PhoneNumber,
		"vat_number":    req.VatNumber,
		"address":       req.Address,
		"address_2":     req.Address2,
		"post_code":     req.PostCode,
		"region":        req.Region,
		"city":          req.City,
		"country":       req.Country,
		"language":      req.Language,
		"currency":      req.Currency,
		"contact_name":  req.ContactName,
		"contact_email": req.ContactEmail,
		"contact_phone": req.ContactPhone,
		"remark":        req.Remark,
		"updated_at":    time.Now(),
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}

	if err := db.Model(&company).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "fail",
			"message": "Failed to update company details",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": company})
}
