// backend/handlers/pump.go
package handlers

import (
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type pumpRequest struct {
	PumpName       string `json:"pump_name"`
	ContactNo      string `json:"contact_no"`
	EmailID        string `json:"email_id"`
	ContactPerson  string `json:"contact_person"`
	Address1       string `json:"address_1"`
	Address2       string `json:"address_2"`
	Address3       string `json:"address_3"`
	OpeningBalance string `json:"opening_balance"`
	GstnNo         string `json:"gstn_no"`
	PanNo          string `json:"pan_no"`
	BankerName     string `json:"banker_name"`
	BranchName     string `json:"branch_name"`
	AccountNo      string `json:"account_no"`
	IfscCode       string `json:"ifsc_code"`
}

// parsePumpRequest accepts both multipart/form-data and JSON bodies
func parsePumpRequest(c *fiber.Ctx) (pumpRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req pumpRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return pumpRequest{
		PumpName:       c.FormValue("pump_name"),
		ContactNo:      c.FormValue("contact_no"),
		EmailID:        c.FormValue("email_id"),
		ContactPerson:  c.FormValue("contact_person"),
		Address1:       c.FormValue("address_1"),
		Address2:       c.FormValue("address_2"),
		Address3:       c.FormValue("address_3"),
		OpeningBalance: c.FormValue("opening_balance"),
		GstnNo:         c.FormValue("gstn_no"),
		PanNo:          c.FormValue("pan_no"),
		BankerName:     c.FormValue("banker_name"),
		BranchName:     c.FormValue("branch_name"),
		AccountNo:      c.FormValue("account_no"),
		IfscCode:       c.FormValue("ifsc_code"),
	}, nil
}

func validatePumpRequest(req *pumpRequest) (map[string]string, *float64) {
	errors := map[string]string{}
	var openingBalance *float64

	req.PumpName = strings.TrimSpace(req.PumpName)
	if req.PumpName == "" {
		errors["pump_name"] = "Pump name is required"
	} else if len(req.PumpName) < 2 {
		errors["pump_name"] = "Pump name must be at least 2 characters"
	} else if len(req.PumpName) > 50 {
		errors["pump_name"] = "Pump name must be less than 50 characters"
	}

	req.ContactNo = strings.TrimSpace(req.ContactNo)
	if req.ContactNo != "" {
		phone := strings.NewReplacer(" ", "", "-", "").Replace(req.ContactNo)
		if len(phone) < 7 || len(phone) > 15 {
			errors["contact_no"] = "Enter a valid contact number"
		}
	}

	req.EmailID = strings.TrimSpace(req.EmailID)
	if req.EmailID != "" {
		if len(req.EmailID) > 50 || !strings.Contains(req.EmailID, "@") || !strings.Contains(req.EmailID, ".") {
			errors["email_id"] = "Enter a valid email address"
		}
	}

	req.ContactPerson = strings.TrimSpace(req.ContactPerson)
	if len(req.ContactPerson) > 50 {
		errors["contact_person"] = "Contact person must be less than 50 characters"
	}

	if len(req.Address1) > 100 {
		errors["address_1"] = "Address line 1 must be less than 100 characters"
	}
	if len(req.Address2) > 100 {
		errors["address_2"] = "Address line 2 must be less than 100 characters"
	}
	if len(req.Address3) > 100 {
		errors["address_3"] = "Address line 3 must be less than 100 characters"
	}

	req.OpeningBalance = strings.TrimSpace(req.OpeningBalance)
	if req.OpeningBalance != "" {
		if n, err := strconv.ParseFloat(req.OpeningBalance, 64); err != nil {
			errors["opening_balance"] = "Enter a valid opening balance"
		} else {
			openingBalance = &n
		}
	}

	req.GstnNo = strings.ToUpper(strings.TrimSpace(req.GstnNo))
	if req.GstnNo != "" && !gstnRegex.MatchString(req.GstnNo) {
		errors["gstn_no"] = "Enter a valid GSTN number"
	}

	req.PanNo = strings.ToUpper(strings.TrimSpace(req.PanNo))
	if req.PanNo != "" && !panRegex.MatchString(req.PanNo) {
		errors["pan_no"] = "Enter a valid PAN number"
	}

	req.BankerName = strings.TrimSpace(req.BankerName)
	if len(req.BankerName) > 50 {
		errors["banker_name"] = "Banker name must be less than 50 characters"
	}

	req.BranchName = strings.TrimSpace(req.BranchName)
	if len(req.BranchName) > 50 {
		errors["branch_name"] = "Branch name must be less than 50 characters"
	}

	req.AccountNo = strings.TrimSpace(req.AccountNo)
	if req.AccountNo != "" && len(req.AccountNo) > 20 {
		errors["account_no"] = "Account number must be less than 20 characters"
	}

	req.IfscCode = strings.ToUpper(strings.TrimSpace(req.IfscCode))
	if req.IfscCode != "" && !ifscRegex.MatchString(req.IfscCode) {
		errors["ifsc_code"] = "Enter a valid IFSC code"
	}

	return errors, openingBalance
}

// CreatePump creates a pump for the current company
// POST /pumps/create-pump
func CreatePump(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parsePumpRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	// Validation temporarily disabled
	_, openingBalance := validatePumpRequest(&req)
	// errors, openingBalance := validatePumpRequest(&req)
	// if len(errors) > 0 {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	// }

	now := time.Now()
	pump := models.Pump{
		CompanyID:      authUser.CompanyID,
		PumpName:       req.PumpName,
		ContactNo:      req.ContactNo,
		EmailID:        req.EmailID,
		ContactPerson:  req.ContactPerson,
		Address1:       req.Address1,
		Address2:       req.Address2,
		Address3:       req.Address3,
		OpeningBalance: openingBalance,
		GstnNo:         req.GstnNo,
		PanNo:          req.PanNo,
		BankerName:     req.BankerName,
		BranchName:     req.BranchName,
		AccountNo:      req.AccountNo,
		IfscCode:       req.IfscCode,
		CreatedBy:      int64(authUser.ID),
		CreatedAt:      &now,
		UpdatedAt:      &now,
	}

	if err := db.Create(&pump).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create pump"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": pump})
}

// GetPumps lists pumps of the current company, paginated
// GET /pumps/get-all-pump?page=1&limit=10&query=
func GetPumps(c *fiber.Ctx, db *gorm.DB) error {
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

	query := db.Model(&models.Pump{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where("pump_name LIKE ? OR contact_no LIKE ? OR email_id LIKE ? OR contact_person LIKE ?", like, like, like, like)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count pumps"})
	}

	var pumps []models.Pump
	if err := query.Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&pumps).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch pumps"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   pumps,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetPump returns a single pump of the current company
// GET /pumps/:id/get-pump-details
func GetPump(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	pumpID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid pump id"})
	}

	var pump models.Pump
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&pump, pumpID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Pump not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": pump})
}

// UpdatePump updates a pump of the current company
// PUT /pumps/:id/update-pump
func UpdatePump(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	pumpID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid pump id"})
	}

	var pump models.Pump
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&pump, pumpID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Pump not found"})
	}

	req, err := parsePumpRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	// Validation temporarily disabled
	_, openingBalance := validatePumpRequest(&req)
	// errors, openingBalance := validatePumpRequest(&req)
	// if len(errors) > 0 {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	// }

	pump.PumpName = req.PumpName
	pump.ContactNo = req.ContactNo
	pump.EmailID = req.EmailID
	pump.ContactPerson = req.ContactPerson
	pump.Address1 = req.Address1
	pump.Address2 = req.Address2
	pump.Address3 = req.Address3
	pump.OpeningBalance = openingBalance
	pump.GstnNo = req.GstnNo
	pump.PanNo = req.PanNo
	pump.BankerName = req.BankerName
	pump.BranchName = req.BranchName
	pump.AccountNo = req.AccountNo
	pump.IfscCode = req.IfscCode
	now := time.Now()
	pump.UpdatedAt = &now

	if err := db.Save(&pump).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update pump"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": pump})
}

// DeletePump removes a pump of the current company
// DELETE /pumps/:id/delete-pump
func DeletePump(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	pumpID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid pump id"})
	}

	var pump models.Pump
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&pump, pumpID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Pump not found"})
	}

	if err := db.Delete(&pump).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete pump"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Pump deleted successfully"})
}
