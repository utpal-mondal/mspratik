// backend/handlers/client.go
package handlers

import (
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type clientRequest struct {
	ClientName    string `json:"client_name"`
	ContactNo     string `json:"contact_no"`
	EmailID       string `json:"email_id"`
	ContactPerson string `json:"contact_person"`
	Address1      string `json:"address_1"`
	GstnNo        string `json:"gstn_no"`
	PanNo         string `json:"pan_no"`
}

// parseClientRequest accepts both multipart/form-data and JSON bodies
func parseClientRequest(c *fiber.Ctx) (clientRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req clientRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return clientRequest{
		ClientName:    c.FormValue("client_name"),
		ContactNo:     c.FormValue("contact_no"),
		EmailID:       c.FormValue("email_id"),
		ContactPerson: c.FormValue("contact_person"),
		Address1:      c.FormValue("address_1"),
		GstnNo:        c.FormValue("gstn_no"),
		PanNo:         c.FormValue("pan_no"),
	}, nil
}

func validateClientRequest(req *clientRequest) map[string]string {
	errors := map[string]string{}

	req.ClientName = strings.TrimSpace(req.ClientName)
	if req.ClientName == "" {
		errors["client_name"] = "Client name is required"
	} else if len(req.ClientName) < 2 {
		errors["client_name"] = "Client name must be at least 2 characters"
	} else if len(req.ClientName) > 50 {
		errors["client_name"] = "Client name must be less than 50 characters"
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

	req.GstnNo = strings.ToUpper(strings.TrimSpace(req.GstnNo))
	// if req.GstnNo != "" && !gstnRegex.MatchString(req.GstnNo) {
	// 	errors["gstn_no"] = "Enter a valid GSTN number"
	// }

	req.PanNo = strings.ToUpper(strings.TrimSpace(req.PanNo))
	// if req.PanNo != "" && !panRegex.MatchString(req.PanNo) {
	// 	errors["pan_no"] = "Enter a valid PAN number"
	// }

	return errors
}

// CreateClient creates a client for the current company
// POST /clients/create-client
func CreateClient(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parseClientRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	if errors := validateClientRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	now := time.Now()
	client := models.Client{
		CompanyID:     authUser.CompanyID,
		ClientName:    req.ClientName,
		ContactNo:     req.ContactNo,
		EmailID:       req.EmailID,
		ContactPerson: req.ContactPerson,
		Address1:      req.Address1,
		GstnNo:        req.GstnNo,
		PanNo:         req.PanNo,
		CreatedBy:     int64(authUser.ID),
		CreatedAt:     &now,
		UpdatedAt:     &now,
	}

	if err := db.Create(&client).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create client"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": client})
}

// GetClients lists clients of the current company, paginated
// GET /clients/get-all-client?page=1&limit=10&query=
func GetClients(c *fiber.Ctx, db *gorm.DB) error {
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

	query := db.Model(&models.Client{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where("client_name LIKE ? OR contact_no LIKE ? OR email_id LIKE ? OR contact_person LIKE ?", like, like, like, like)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count clients"})
	}

	var clients []models.Client
	if err := query.Select("id", "client_name", "contact_no", "email_id", "contact_person").
		Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&clients).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch clients"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   clients,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetClient returns a single client of the current company
// GET /clients/:id/get-client-details
func GetClient(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	clientID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid client id"})
	}

	var client models.Client
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&client, clientID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Client not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": client})
}

// UpdateClient updates a client of the current company
// PUT /clients/:id/update-client
func UpdateClient(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	clientID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid client id"})
	}

	var client models.Client
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&client, clientID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Client not found"})
	}

	req, err := parseClientRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	if errors := validateClientRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	client.ClientName = req.ClientName
	client.ContactNo = req.ContactNo
	client.EmailID = req.EmailID
	client.ContactPerson = req.ContactPerson
	client.Address1 = req.Address1
	client.GstnNo = req.GstnNo
	client.PanNo = req.PanNo
	now := time.Now()
	client.UpdatedAt = &now

	if err := db.Save(&client).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update client"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": client})
}

// DeleteClient removes a client of the current company
// DELETE /clients/:id/delete-client
func DeleteClient(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	clientID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid client id"})
	}

	var client models.Client
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&client, clientID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Client not found"})
	}

	if err := db.Delete(&client).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete client"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Client deleted successfully"})
}
