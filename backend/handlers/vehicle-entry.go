// backend/handlers/vehicle-entry.go
package handlers

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"wms-backend/middleware"
	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var vehicleNumberRegex = regexp.MustCompile(`^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$`)

func normalizeVehicleNumber(s string) string {
	replacer := strings.NewReplacer(" ", "", "-", "")
	return strings.ToUpper(replacer.Replace(strings.TrimSpace(s)))
}

type vehicleRequest struct {
	VehicleNumber          string `json:"vehicle_number"`
	OwnerName              string `json:"owner_name"`
	OwnerPhone             string `json:"owner_phone"`
	VehicleType            string `json:"vehicle_type"`
	NumberOfWheels         string `json:"number_of_wheels"`
	RegistrationExpiryDate string `json:"registration_expiry_date"`
	RcNumber               string `json:"rc_number"`
	PermitNumber           string `json:"permit_number"`
	InsuranceNumber        string `json:"insurance_number"`
	InsuranceExpiryDate    string `json:"insurance_expiry_date"`
	PucNumber              string `json:"puc_number"`
	PucExpiryDate          string `json:"puc_expiry_date"`
	RoadTaxExpiryDate      string `json:"road_tax_expiry_date"`
}

// parseVehicleRequest accepts both multipart/form-data and JSON bodies
func parseVehicleRequest(c *fiber.Ctx) (vehicleRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req vehicleRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return vehicleRequest{
		VehicleNumber:          c.FormValue("vehicle_number"),
		OwnerName:              c.FormValue("owner_name"),
		OwnerPhone:             c.FormValue("owner_phone"),
		VehicleType:            c.FormValue("vehicle_type"),
		NumberOfWheels:         c.FormValue("number_of_wheels"),
		RegistrationExpiryDate: c.FormValue("registration_expiry_date"),
		RcNumber:               c.FormValue("rc_number"),
		PermitNumber:           c.FormValue("permit_number"),
		InsuranceNumber:        c.FormValue("insurance_number"),
		InsuranceExpiryDate:    c.FormValue("insurance_expiry_date"),
		PucNumber:              c.FormValue("puc_number"),
		PucExpiryDate:          c.FormValue("puc_expiry_date"),
		RoadTaxExpiryDate:      c.FormValue("road_tax_expiry_date"),
	}, nil
}

type vehicleValidation struct {
	RegistrationExpiryDate *time.Time
	InsuranceExpiryDate    *time.Time
	PucExpiryDate          *time.Time
	RoadTaxExpiryDate      *time.Time
	NumberOfWheels         *int
}

func parseDateField(value, field string, errors map[string]string) *time.Time {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}
	d, err := time.Parse("2006-01-02", value)
	if err != nil {
		// errors[field] = "Enter a valid date (YYYY-MM-DD)"
		return nil
	}
	return &d
}

func validateVehicleRequest(req *vehicleRequest) (map[string]string, vehicleValidation) {
	errors := map[string]string{}
	var v vehicleValidation

	// Only block the request when vehicle number is empty
	req.VehicleNumber = normalizeVehicleNumber(req.VehicleNumber)
	if req.VehicleNumber == "" {
		errors["vehicle_number"] = "Vehicle number is required"
	}
	// else if !vehicleNumberRegex.MatchString(req.VehicleNumber) {
	// 	errors["vehicle_number"] = "Enter a valid vehicle number (e.g. MH12AB1234)"
	// }

	req.OwnerName = strings.TrimSpace(req.OwnerName)
	// if len(req.OwnerName) > 50 {
	// 	errors["owner_name"] = "Owner name must be less than 50 characters"
	// }

	req.OwnerPhone = strings.TrimSpace(req.OwnerPhone)
	// if req.OwnerPhone != "" {
	// 	phone := strings.NewReplacer(" ", "", "-", "").Replace(req.OwnerPhone)
	// 	if len(phone) < 7 || len(phone) > 15 {
	// 		errors["owner_phone"] = "Enter a valid phone number"
	// 	}
	// }

	req.VehicleType = strings.ToLower(strings.TrimSpace(req.VehicleType))
	if req.VehicleType == "" {
		req.VehicleType = "self"
	}
	// else if req.VehicleType != "self" && req.VehicleType != "others" {
	// 	errors["vehicle_type"] = "Vehicle type must be 'self' or 'others'"
	// }

	if req.NumberOfWheels != "" {
		if n, err := strconv.Atoi(req.NumberOfWheels); err == nil {
			v.NumberOfWheels = &n
		}
		// if n, err := strconv.Atoi(req.NumberOfWheels); err != nil || n < 2 || n > 20 {
		// 	errors["number_of_wheels"] = "Enter a valid number of wheels (2-20)"
		// } else {
		// 	v.NumberOfWheels = &n
		// }
	}

	v.RegistrationExpiryDate = parseDateField(req.RegistrationExpiryDate, "registration_expiry_date", errors)
	v.InsuranceExpiryDate = parseDateField(req.InsuranceExpiryDate, "insurance_expiry_date", errors)
	v.PucExpiryDate = parseDateField(req.PucExpiryDate, "puc_expiry_date", errors)
	v.RoadTaxExpiryDate = parseDateField(req.RoadTaxExpiryDate, "road_tax_expiry_date", errors)

	req.RcNumber = strings.ToUpper(strings.TrimSpace(req.RcNumber))
	req.PermitNumber = strings.ToUpper(strings.TrimSpace(req.PermitNumber))
	req.InsuranceNumber = strings.ToUpper(strings.TrimSpace(req.InsuranceNumber))
	req.PucNumber = strings.ToUpper(strings.TrimSpace(req.PucNumber))

	return errors, v
}

func getAuthUser(c *fiber.Ctx) (middleware.AuthUser, bool) {
	authUser, ok := c.Locals("user").(middleware.AuthUser)
	return authUser, ok
}

// CreateVehicle creates a vehicle for the current company
// POST /vehicles
func CreateVehicle(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parseVehicleRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	if errors, v := validateVehicleRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	} else {
		var existing models.Vehicle
		query := db.Where("vehicle_number = ?", req.VehicleNumber)
		if authUser.CompanyID != nil {
			query = query.Where("company_id = ?", *authUser.CompanyID)
		}
		if err := query.First(&existing).Error; err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "field": "vehicle_number", "message": "Vehicle number already exists"})
		}

		now := time.Now()
		vehicle := models.Vehicle{
			CompanyID:              authUser.CompanyID,
			VehicleNumber:          req.VehicleNumber,
			OwnerName:              req.OwnerName,
			OwnerPhone:             req.OwnerPhone,
			VehicleType:            req.VehicleType,
			NumberOfWheels:         v.NumberOfWheels,
			RegistrationExpiryDate: v.RegistrationExpiryDate,
			RcNumber:               req.RcNumber,
			PermitNumber:           req.PermitNumber,
			InsuranceNumber:        req.InsuranceNumber,
			InsuranceExpiryDate:    v.InsuranceExpiryDate,
			PucNumber:              req.PucNumber,
			PucExpiryDate:          v.PucExpiryDate,
			RoadTaxExpiryDate:      v.RoadTaxExpiryDate,
			VehicleImage:           nil,
			RcBookImage:            nil,
			CreatedBy:              int64(authUser.ID),
			CreatedAt:              &now,
			UpdatedAt:              &now,
		}

		if err := db.Create(&vehicle).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create vehicle"})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": vehicle})
	}
}

// GetVehicles lists vehicles of the current company, paginated
// GET /vehicles?page=1&limit=10&query=
func GetVehicles(c *fiber.Ctx, db *gorm.DB) error {
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

	query := db.Model(&models.Vehicle{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where("vehicle_number LIKE ? OR owner_name LIKE ? OR rc_number LIKE ?", like, like, like)
	}
	if vehicleType := strings.ToLower(strings.TrimSpace(c.Query("vehicle_type"))); vehicleType != "" {
		query = query.Where("vehicle_type = ?", vehicleType)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count vehicles"})
	}

	var vehicles []models.Vehicle
	if err := query.Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&vehicles).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch vehicles"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   vehicles,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetVehicle returns a single vehicle of the current company
// GET /vehicles/:id
func GetVehicle(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	vehicleID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid vehicle id"})
	}

	var vehicle models.Vehicle
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&vehicle, vehicleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Vehicle not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": vehicle})
}

// UpdateVehicle updates a vehicle of the current company
// PUT /vehicles/:id
func UpdateVehicle(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	vehicleID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid vehicle id"})
	}

	var vehicle models.Vehicle
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&vehicle, vehicleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Vehicle not found"})
	}

	req, err := parseVehicleRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, v := validateVehicleRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	if req.VehicleNumber != vehicle.VehicleNumber {
		var existing models.Vehicle
		dupQuery := db.Where("vehicle_number = ? AND id != ?", req.VehicleNumber, vehicle.ID)
		if authUser.CompanyID != nil {
			dupQuery = dupQuery.Where("company_id = ?", *authUser.CompanyID)
		}
		if err := dupQuery.First(&existing).Error; err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "field": "vehicle_number", "message": "Vehicle number already exists"})
		}
	}

	vehicle.VehicleNumber = req.VehicleNumber
	vehicle.OwnerName = req.OwnerName
	vehicle.OwnerPhone = req.OwnerPhone
	vehicle.VehicleType = req.VehicleType
	vehicle.NumberOfWheels = v.NumberOfWheels
	vehicle.RegistrationExpiryDate = v.RegistrationExpiryDate
	vehicle.RcNumber = req.RcNumber
	vehicle.PermitNumber = req.PermitNumber
	vehicle.InsuranceNumber = req.InsuranceNumber
	vehicle.InsuranceExpiryDate = v.InsuranceExpiryDate
	vehicle.PucNumber = req.PucNumber
	vehicle.PucExpiryDate = v.PucExpiryDate
	vehicle.RoadTaxExpiryDate = v.RoadTaxExpiryDate
	now := time.Now()
	vehicle.UpdatedAt = &now

	if err := db.Save(&vehicle).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update vehicle"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": vehicle})
}

// DeleteVehicle removes a vehicle of the current company
// DELETE /vehicles/:id
func DeleteVehicle(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	vehicleID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid vehicle id"})
	}

	var vehicle models.Vehicle
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&vehicle, vehicleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Vehicle not found"})
	}

	if err := db.Delete(&vehicle).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete vehicle"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Vehicle deleted successfully"})
}
