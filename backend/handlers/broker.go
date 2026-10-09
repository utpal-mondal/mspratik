// backend/handlers/broker.go
package handlers

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type brokerRequest struct {
	BrokerName     string `json:"broker_name"`
	ContactNo      string `json:"contact_no"`
	EmailID        string `json:"email_id"`
	ContactPerson  string `json:"contact_person"`
	Address1       string `json:"address_1"`
	Address2       string `json:"address_2"`
	Address3       string `json:"address_3"`
	OpeningBalance string `json:"opening_balance"`
	GstnNo         string `json:"gstn_no"`
	PanNo          string `json:"pan_no"`
	ShortForm      string `json:"short_form"`
	BankerName     string `json:"banker_name"`
	BankID         string `json:"bank_id"`
	BranchName     string `json:"branch_name"`
	AccountNo      string `json:"account_no"`
	IfscCode       string `json:"ifsc_code"`
	BrokerType     string `json:"broker_type"`
	OwnerBillType  string `json:"owner_bill_type"`
	AdharNo        string `json:"adhar_no"`
	QtyRound       string `json:"qty_round"`
}

var (
	gstnRegex = regexp.MustCompile(`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$`)
	panRegex  = regexp.MustCompile(`^[A-Z]{5}[0-9]{4}[A-Z]$`)
	ifscRegex = regexp.MustCompile(`^[A-Z]{4}0[A-Z0-9]{6}$`)
)

// parseBrokerRequest accepts both multipart/form-data and JSON bodies
func parseBrokerRequest(c *fiber.Ctx) (brokerRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req brokerRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return brokerRequest{
		BrokerName:     c.FormValue("broker_name"),
		ContactNo:      c.FormValue("contact_no"),
		EmailID:        c.FormValue("email_id"),
		ContactPerson:  c.FormValue("contact_person"),
		Address1:       c.FormValue("address_1"),
		Address2:       c.FormValue("address_2"),
		Address3:       c.FormValue("address_3"),
		OpeningBalance: c.FormValue("opening_balance"),
		GstnNo:         c.FormValue("gstn_no"),
		PanNo:          c.FormValue("pan_no"),
		ShortForm:      c.FormValue("short_form"),
		BankerName:     c.FormValue("banker_name"),
		BankID:         c.FormValue("bank_id"),
		BranchName:     c.FormValue("branch_name"),
		AccountNo:      c.FormValue("account_no"),
		IfscCode:       c.FormValue("ifsc_code"),
		BrokerType:     c.FormValue("broker_type"),
		OwnerBillType:  c.FormValue("owner_bill_type"),
		AdharNo:        c.FormValue("adhar_no"),
		QtyRound:       c.FormValue("qty_round"),
	}, nil
}

func validateBrokerRequest(req *brokerRequest) (map[string]string, *float64, *uint) {
	errors := map[string]string{}
	var openingBalance *float64
	var bankID *uint

	req.BrokerName = strings.TrimSpace(req.BrokerName)
	if req.BrokerName == "" {
		errors["broker_name"] = "Broker name is required"
	} else if len(req.BrokerName) < 2 {
		errors["broker_name"] = "Broker name must be at least 2 characters"
	} else if len(req.BrokerName) > 50 {
		errors["broker_name"] = "Broker name must be less than 50 characters"
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

	req.ShortForm = strings.ToUpper(strings.TrimSpace(req.ShortForm))
	if len(req.ShortForm) > 10 {
		errors["short_form"] = "Short form must be less than 10 characters"
	}

	req.BankerName = strings.TrimSpace(req.BankerName)
	if len(req.BankerName) > 50 {
		errors["banker_name"] = "Banker name must be less than 50 characters"
	}

	req.BankID = strings.TrimSpace(req.BankID)
	if req.BankID != "" {
		if n, err := strconv.ParseUint(req.BankID, 10, 64); err != nil {
			errors["bank_id"] = "Select a valid bank"
		} else {
			id := uint(n)
			bankID = &id
		}
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

	req.AdharNo = strings.TrimSpace(req.AdharNo)
	if req.AdharNo != "" {
		if len(req.AdharNo) != 12 {
			errors["adhar_no"] = "Enter a valid 12-digit Adhar number"
		} else if _, err := strconv.ParseUint(req.AdharNo, 10, 64); err != nil {
			errors["adhar_no"] = "Enter a valid 12-digit Adhar number"
		}
	}

	req.BrokerType = strings.TrimSpace(req.BrokerType)
	req.OwnerBillType = strings.TrimSpace(req.OwnerBillType)
	req.QtyRound = strings.TrimSpace(req.QtyRound)

	return errors, openingBalance, bankID
}

// CreateBroker creates a broker for the current company
// POST /brokers/create-broker
func CreateBroker(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parseBrokerRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	// Validation temporarily disabled
	_, openingBalance, bankID := validateBrokerRequest(&req)
	// errors, openingBalance, bankID := validateBrokerRequest(&req)
	// if len(errors) > 0 {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	// }

	now := time.Now()
	broker := models.Broker{
		CompanyID:      authUser.CompanyID,
		BrokerName:     req.BrokerName,
		ContactNo:      req.ContactNo,
		EmailID:        req.EmailID,
		ContactPerson:  req.ContactPerson,
		Address1:       req.Address1,
		Address2:       req.Address2,
		Address3:       req.Address3,
		OpeningBalance: openingBalance,
		PreviousDue:    openingBalance,
		GstnNo:         req.GstnNo,
		PanNo:          req.PanNo,
		ShortForm:      req.ShortForm,
		BankerName:     req.BankerName,
		BankID:         bankID,
		BranchName:     req.BranchName,
		AccountNo:      req.AccountNo,
		IfscCode:       req.IfscCode,
		BrokerType:     req.BrokerType,
		OwnerBillType:  req.OwnerBillType,
		AdharNo:        req.AdharNo,
		QtyRound:       req.QtyRound,
		CreatedBy:      int64(authUser.ID),
		CreatedAt:      &now,
		UpdatedAt:      &now,
	}

	if err := db.Create(&broker).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create broker"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": broker})
}

// GetBrokers lists brokers of the current company, paginated
// GET /brokers/get-all-broker?page=1&limit=10&query=
func GetBrokers(c *fiber.Ctx, db *gorm.DB) error {
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

	query := db.Model(&models.Broker{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where("broker_name LIKE ? OR contact_no LIKE ? OR email_id LIKE ? OR contact_person LIKE ?", like, like, like, like)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count brokers"})
	}

	var brokers []models.Broker
	if err := query.Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&brokers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch brokers"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   brokers,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetBroker returns a single broker of the current company
// GET /brokers/:id/get-broker-details
func GetBroker(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	brokerID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid broker id"})
	}

	var broker models.Broker
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&broker, brokerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Broker not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": broker})
}

// UpdateBroker updates a broker of the current company
// PUT /brokers/:id/update-broker
func UpdateBroker(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	brokerID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid broker id"})
	}

	var broker models.Broker
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&broker, brokerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Broker not found"})
	}

	req, err := parseBrokerRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	// Validation temporarily disabled
	_, openingBalance, bankID := validateBrokerRequest(&req)
	// errors, openingBalance, bankID := validateBrokerRequest(&req)
	// if len(errors) > 0 {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	// }

	broker.BrokerName = req.BrokerName
	broker.ContactNo = req.ContactNo
	broker.EmailID = req.EmailID
	broker.ContactPerson = req.ContactPerson
	broker.Address1 = req.Address1
	broker.Address2 = req.Address2
	broker.Address3 = req.Address3
	broker.OpeningBalance = openingBalance
	broker.GstnNo = req.GstnNo
	broker.PanNo = req.PanNo
	broker.ShortForm = req.ShortForm
	broker.BankerName = req.BankerName
	broker.BankID = bankID
	broker.BranchName = req.BranchName
	broker.AccountNo = req.AccountNo
	broker.IfscCode = req.IfscCode
	broker.BrokerType = req.BrokerType
	broker.OwnerBillType = req.OwnerBillType
	broker.AdharNo = req.AdharNo
	broker.QtyRound = req.QtyRound
	now := time.Now()
	broker.UpdatedAt = &now

	if err := db.Save(&broker).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update broker"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": broker})
}

// DeleteBroker removes a broker of the current company
// DELETE /brokers/:id/delete-broker
func DeleteBroker(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	brokerID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid broker id"})
	}

	var broker models.Broker
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&broker, brokerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Broker not found"})
	}

	if err := db.Delete(&broker).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete broker"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Broker deleted successfully"})
}
