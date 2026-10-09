// backend/handlers/vessal.go
package handlers

import (
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type vessalRequest struct {
	Name  string `json:"name"`
	Price string `json:"price"`
}

// parseVessalRequest accepts both multipart/form-data and JSON bodies
func parseVessalRequest(c *fiber.Ctx) (vessalRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req vessalRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return vessalRequest{
		Name:  c.FormValue("name"),
		Price: c.FormValue("price"),
	}, nil
}

func validateVessalRequest(req *vessalRequest) (map[string]string, *float64) {
	errors := map[string]string{}
	var price *float64

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		errors["name"] = "Vessal name is required"
	} else if len(req.Name) < 2 {
		errors["name"] = "Vessal name must be at least 2 characters"
	} else if len(req.Name) > 50 {
		errors["name"] = "Vessal name must be less than 50 characters"
	}

	req.Price = strings.TrimSpace(req.Price)
	if req.Price != "" {
		if n, err := strconv.ParseFloat(req.Price, 64); err != nil || n < 0 {
			errors["price"] = "Enter a valid price"
		} else {
			price = &n
		}
	}

	return errors, price
}

// CreateVessal creates a vessal for the current company
// POST /vessals/create-vessal
func CreateVessal(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parseVessalRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, price := validateVessalRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	now := time.Now()
	vessal := models.Vessal{
		CompanyID: authUser.CompanyID,
		Name:      req.Name,
		Price:     price,
		CreatedBy: int64(authUser.ID),
		CreatedAt: &now,
		UpdatedAt: &now,
	}

	if err := db.Create(&vessal).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create vessal"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": vessal})
}

// GetVessals lists vessals of the current company, paginated
// GET /vessals/get-all-vessal?page=1&limit=10&query=
func GetVessals(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
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

	query := db.Model(&models.Vessal{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count vessals"})
	}

	var vessals []models.Vessal
	if err := query.Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&vessals).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch vessals"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   vessals,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetVessal returns a single vessal of the current company
// GET /vessals/:id/get-vessal-details
func GetVessal(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	vessalID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid vessal id"})
	}

	var vessal models.Vessal
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&vessal, vessalID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Vessal not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": vessal})
}

// UpdateVessal updates a vessal of the current company
// PUT /vessals/:id/update-vessal
func UpdateVessal(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	vessalID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid vessal id"})
	}

	var vessal models.Vessal
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&vessal, vessalID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Vessal not found"})
	}

	req, err := parseVessalRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, price := validateVessalRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	vessal.Name = req.Name
	vessal.Price = price
	now := time.Now()
	vessal.UpdatedAt = &now

	if err := db.Save(&vessal).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update vessal"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": vessal})
}

// DeleteVessal removes a vessal of the current company
// DELETE /vessals/:id/delete-vessal
func DeleteVessal(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	vessalID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid vessal id"})
	}

	var vessal models.Vessal
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&vessal, vessalID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Vessal not found"})
	}

	if err := db.Delete(&vessal).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete vessal"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Vessal deleted successfully"})
}
