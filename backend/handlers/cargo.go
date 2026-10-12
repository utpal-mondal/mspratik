// backend/handlers/cargo.go
package handlers

import (
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type cargoRequest struct {
	CargoName string `json:"cargo_name"`
	Status    string `json:"status"`
}

// parseCargoRequest accepts both multipart/form-data and JSON bodies
func parseCargoRequest(c *fiber.Ctx) (cargoRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req cargoRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return cargoRequest{
		CargoName: c.FormValue("cargo_name"),
		Status:    c.FormValue("status"),
	}, nil
}

func validateCargoRequest(req *cargoRequest) map[string]string {
	errors := map[string]string{}

	req.CargoName = strings.TrimSpace(req.CargoName)
	if req.CargoName == "" {
		errors["cargo_name"] = "Cargo name is required"
	} else if len(req.CargoName) < 2 {
		errors["cargo_name"] = "Cargo name must be at least 2 characters"
	} else if len(req.CargoName) > 50 {
		errors["cargo_name"] = "Cargo name must be less than 50 characters"
	}

	req.Status = strings.ToLower(strings.TrimSpace(req.Status))
	if req.Status == "" {
		req.Status = "active"
	} else if req.Status != "active" && req.Status != "deactive" {
		errors["status"] = "Enter a valid status"
	}

	return errors
}

// CreateCargo creates a cargo for the current company
// POST /cargos/create-cargo
func CreateCargo(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parseCargoRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	if errors := validateCargoRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	now := time.Now()
	cargo := models.Cargo{
		CompanyID: authUser.CompanyID,
		CargoName: req.CargoName,
		Status:    req.Status,
		CreatedBy: int64(authUser.ID),
		CreatedAt: &now,
		UpdatedAt: &now,
	}

	if err := db.Create(&cargo).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create cargo"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": cargo})
}

// GetCargos lists cargos of the current company, paginated
// GET /cargos/get-all-cargo?page=1&limit=10&query=
func GetCargos(c *fiber.Ctx, db *gorm.DB) error {
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

	query := db.Model(&models.Cargo{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		query = query.Where("cargo_name LIKE ?", "%"+search+"%")
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count cargos"})
	}

	var cargos []models.Cargo
	if err := query.Select("id", "cargo_name", "status").
		Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&cargos).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch cargos"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   cargos,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// UpdateCargoStatus toggles a cargo between active and deactive
// PUT /cargos/:id/update-cargo-status
func UpdateCargoStatus(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	cargoID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid cargo id"})
	}

	var cargo models.Cargo
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&cargo, cargoID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Cargo not found"})
	}

	req, err := parseCargoRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	status := strings.ToLower(strings.TrimSpace(req.Status))
	if status != "active" && status != "deactive" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": map[string]string{"status": "Enter a valid status"}})
	}

	cargo.Status = status
	now := time.Now()
	cargo.UpdatedAt = &now

	if err := db.Save(&cargo).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update cargo status"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": cargo})
}
