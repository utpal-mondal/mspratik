// backend/handlers/driver-entry.go
package handlers

import (
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type driverRequest struct {
	DriverName      string `json:"driver_name"`
	PhoneNumber     string `json:"phone_number"`
	ExperienceYears string `json:"experience_years"`
}

// parseDriverRequest accepts both multipart/form-data and JSON bodies
func parseDriverRequest(c *fiber.Ctx) (driverRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req driverRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return driverRequest{
		DriverName:      c.FormValue("driver_name"),
		PhoneNumber:     c.FormValue("phone_number"),
		ExperienceYears: c.FormValue("experience_years"),
	}, nil
}

func validateDriverRequest(req *driverRequest) (map[string]string, *int) {
	errors := map[string]string{}
	var experience *int

	req.DriverName = strings.TrimSpace(req.DriverName)
	if req.DriverName == "" {
		errors["driver_name"] = "Driver name is required"
	} else if len(req.DriverName) < 2 {
		errors["driver_name"] = "Driver name must be at least 2 characters"
	} else if len(req.DriverName) > 50 {
		errors["driver_name"] = "Driver name must be less than 50 characters"
	}

	req.PhoneNumber = strings.TrimSpace(req.PhoneNumber)
	if req.PhoneNumber != "" {
		phone := strings.NewReplacer(" ", "", "-", "").Replace(req.PhoneNumber)
		if len(phone) < 7 || len(phone) > 15 {
			errors["phone_number"] = "Enter a valid phone number"
		}
	}

	if req.ExperienceYears != "" {
		if n, err := strconv.Atoi(req.ExperienceYears); err != nil || n < 0 || n > 60 {
			errors["experience_years"] = "Enter valid years of experience (0-60)"
		} else {
			experience = &n
		}
	}

	return errors, experience
}

// CreateDriver creates a driver for the current company
// POST /drivers/create-driver
func CreateDriver(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parseDriverRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, experience := validateDriverRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	now := time.Now()
	driver := models.Driver{
		CompanyID:       authUser.CompanyID,
		DriverName:      req.DriverName,
		PhoneNumber:     req.PhoneNumber,
		ExperienceYears: experience,
		DriverPhoto:     nil,
		LicenceImage:    nil,
		CreatedBy:       int64(authUser.ID),
		CreatedAt:       &now,
		UpdatedAt:       &now,
	}

	if err := db.Create(&driver).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create driver"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": driver})
}

// GetDrivers lists drivers of the current company, paginated
// GET /drivers/get-all-driver?page=1&limit=10&query=
func GetDrivers(c *fiber.Ctx, db *gorm.DB) error {
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

	query := db.Model(&models.Driver{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where("driver_name LIKE ? OR phone_number LIKE ?", like, like)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count drivers"})
	}

	var drivers []models.Driver
	if err := query.Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&drivers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch drivers"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   drivers,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetDriver returns a single driver of the current company
// GET /drivers/:id/get-driver-details
func GetDriver(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	driverID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid driver id"})
	}

	var driver models.Driver
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&driver, driverID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Driver not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": driver})
}

// UpdateDriver updates a driver of the current company
// PUT /drivers/:id/update-driver
func UpdateDriver(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	driverID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid driver id"})
	}

	var driver models.Driver
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&driver, driverID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Driver not found"})
	}

	req, err := parseDriverRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, experience := validateDriverRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	driver.DriverName = req.DriverName
	driver.PhoneNumber = req.PhoneNumber
	driver.ExperienceYears = experience
	now := time.Now()
	driver.UpdatedAt = &now

	if err := db.Save(&driver).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update driver"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": driver})
}

// DeleteDriver removes a driver of the current company
// DELETE /drivers/:id/delete-driver
func DeleteDriver(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	driverID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid driver id"})
	}

	var driver models.Driver
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&driver, driverID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Driver not found"})
	}

	if err := db.Delete(&driver).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete driver"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Driver deleted successfully"})
}
