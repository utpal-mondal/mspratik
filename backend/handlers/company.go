// backend/handlers/company.go
package handlers

import (
	"log"
	"strconv"
	"strings"
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

// GetCompanies lists all companies, paginated
// GET /companies/get-all-company?page=1&limit=10&query=
func GetCompanies(c *fiber.Ctx, db *gorm.DB) error {
	if _, ok := getAuthUser(c); !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	query := db.Model(&models.Company{})
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where(
			"name LIKE ? OR email LIKE ? OR phone_number LIKE ? OR city LIKE ? OR country LIKE ? OR contact_name LIKE ?",
			like, like, like, like, like, like,
		)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count companies"})
	}

	var companies []models.Company
	if err := query.Select("id", "name", "email", "phone_number", "vat_number", "city", "country", "contact_name").
		Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&companies).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch companies"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   companies,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// CreateCompany creates a new company
// POST /companies/create-company
func CreateCompany(c *fiber.Ctx, db *gorm.DB) error {
	if _, ok := getAuthUser(c); !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	var req companyDetailsRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors := map[string]string{}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		errors["name"] = "Company name is required"
	} else if len(req.Name) > 30 {
		errors["name"] = "Company name must be less than 30 characters"
	}
	if len(req.Email) > 50 {
		errors["email"] = "Email must be less than 50 characters"
	}
	if len(req.PhoneNumber) > 20 {
		errors["phone_number"] = "Phone number must be less than 20 characters"
	}
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	var existing models.Company
	if err := db.Where("name = ?", req.Name).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "message": "Company with this name already exists"})
	}
	if req.Email != "" {
		if err := db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "message": "Company with this email already exists"})
		}
	}

	now := time.Now()
	company := models.Company{
		Name:               req.Name,
		Email:              req.Email,
		PhoneNumber:        req.PhoneNumber,
		VatNumber:          req.VatNumber,
		Address:            req.Address,
		Address2:           req.Address2,
		PostCode:           req.PostCode,
		Region:             req.Region,
		City:               req.City,
		Country:            req.Country,
		Language:           req.Language,
		Currency:           req.Currency,
		ContactName:        req.ContactName,
		ContactEmail:       req.ContactEmail,
		ContactPhone:       req.ContactPhone,
		Remark:             req.Remark,
		LocationAPI:        req.LocationAPI,
		RoleName:           "Company",
		Status:             true,
		IsVerified:         false,
		IsBlock:            false,
		Active:             true,
		SubscriptionExpiry: "no",
		Expiry:             "no",
		CreatedAt:          &now,
		UpdatedAt:          &now,
	}

	if err := db.Create(&company).Error; err != nil {
		log.Printf("Failed to create company: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create company"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": company})
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
	LocationAPI  string `json:"location_api"`
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

	if err := db.Model(&company).Updates(companyUpdates(req)).Error; err != nil {
		log.Printf("Failed to update company %d: %v", company.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "fail",
			"message": "Failed to update company details",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": company})
}

func companyUpdates(req companyDetailsRequest) map[string]interface{} {
	updates := map[string]interface{}{
		"email":         req.Email,
		"phone_number":  req.PhoneNumber,
		"vat_number":    req.VatNumber,
		"address":       req.Address,
		"address2":      req.Address2,
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
		"location_api":  req.LocationAPI,
		"updated_at":    time.Now(),
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	return updates
}

// GetCompany returns a single company by id
// GET /companies/:id/get-company-details
func GetCompany(c *fiber.Ctx, db *gorm.DB) error {
	if _, ok := getAuthUser(c); !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	companyID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid company id"})
	}

	var company models.Company
	if err := db.First(&company, companyID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Company not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": company})
}

// UpdateCompany updates a company by id
// PUT /companies/:id/update-company
func UpdateCompany(c *fiber.Ctx, db *gorm.DB) error {
	if _, ok := getAuthUser(c); !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	companyID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid company id"})
	}

	var company models.Company
	if err := db.First(&company, companyID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Company not found"})
	}

	var req companyDetailsRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors := map[string]string{}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		errors["name"] = "Company name is required"
	} else if len(req.Name) > 30 {
		errors["name"] = "Company name must be less than 30 characters"
	}
	if len(req.Email) > 50 {
		errors["email"] = "Email must be less than 50 characters"
	}
	if len(req.PhoneNumber) > 20 {
		errors["phone_number"] = "Phone number must be less than 20 characters"
	}
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	var existing models.Company
	if err := db.Where("name = ? AND id <> ?", req.Name, companyID).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "message": "Company with this name already exists"})
	}
	if req.Email != "" {
		if err := db.Where("email = ? AND id <> ?", req.Email, companyID).First(&existing).Error; err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "message": "Company with this email already exists"})
		}
	}

	if err := db.Model(&company).Updates(companyUpdates(req)).Error; err != nil {
		log.Printf("Failed to update company %d: %v", company.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update company"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": company})
}

// DeleteCompany removes a company by id
// DELETE /companies/:id/delete-company
func DeleteCompany(c *fiber.Ctx, db *gorm.DB) error {
	if _, ok := getAuthUser(c); !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	companyID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid company id"})
	}

	var company models.Company
	if err := db.First(&company, companyID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Company not found"})
	}

	if err := db.Delete(&company).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete company"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Company deleted successfully"})
}
