// backend/handlers/route.go
package handlers

import (
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type routeRequest struct {
	ClientID  string `json:"client_id"`
	StartName string `json:"start_name"`
	StartLat  string `json:"start_lat"`
	StartLong string `json:"start_long"`
	ViaName   string `json:"via_name"`
	ViaLat    string `json:"via_lat"`
	ViaLong   string `json:"via_long"`
	EndName   string `json:"end_name"`
	EndLat    string `json:"end_lat"`
	EndLong   string `json:"end_long"`
}

// parseRouteRequest accepts both JSON and multipart/form-data bodies
func parseRouteRequest(c *fiber.Ctx) (routeRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req routeRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return routeRequest{
		ClientID:  c.FormValue("client_id"),
		StartName: c.FormValue("start_name"),
		StartLat:  c.FormValue("start_lat"),
		StartLong: c.FormValue("start_long"),
		ViaName:   c.FormValue("via_name"),
		ViaLat:    c.FormValue("via_lat"),
		ViaLong:   c.FormValue("via_long"),
		EndName:   c.FormValue("end_name"),
		EndLat:    c.FormValue("end_lat"),
		EndLong:   c.FormValue("end_long"),
	}, nil
}

func validateRouteRequest(req *routeRequest) (map[string]string, *uint) {
	errors := map[string]string{}
	var clientID *uint

	req.ClientID = strings.TrimSpace(req.ClientID)
	if req.ClientID == "" {
		errors["client_id"] = "Client name is required"
	} else if n, err := strconv.ParseUint(req.ClientID, 10, 64); err != nil {
		errors["client_id"] = "Select a valid client"
	} else {
		id := uint(n)
		clientID = &id
	}

	req.StartName = strings.TrimSpace(req.StartName)
	if req.StartName == "" {
		errors["start_name"] = "Start point name is required"
	} else if len(req.StartName) > 100 {
		errors["start_name"] = "Start point name must be less than 100 characters"
	}

	req.StartLat = strings.TrimSpace(req.StartLat)
	if req.StartLat != "" {
		if len(req.StartLat) > 20 {
			errors["start_lat"] = "Enter a valid latitude"
		} else if _, err := strconv.ParseFloat(req.StartLat, 64); err != nil {
			errors["start_lat"] = "Enter a valid latitude"
		}
	}

	req.StartLong = strings.TrimSpace(req.StartLong)
	if req.StartLong != "" {
		if len(req.StartLong) > 20 {
			errors["start_long"] = "Enter a valid longitude"
		} else if _, err := strconv.ParseFloat(req.StartLong, 64); err != nil {
			errors["start_long"] = "Enter a valid longitude"
		}
	}

	req.ViaName = strings.TrimSpace(req.ViaName)
	if len(req.ViaName) > 100 {
		errors["via_name"] = "Via point name must be less than 100 characters"
	}

	req.ViaLat = strings.TrimSpace(req.ViaLat)
	if req.ViaLat != "" {
		if len(req.ViaLat) > 20 {
			errors["via_lat"] = "Enter a valid latitude"
		} else if _, err := strconv.ParseFloat(req.ViaLat, 64); err != nil {
			errors["via_lat"] = "Enter a valid latitude"
		}
	}

	req.ViaLong = strings.TrimSpace(req.ViaLong)
	if req.ViaLong != "" {
		if len(req.ViaLong) > 20 {
			errors["via_long"] = "Enter a valid longitude"
		} else if _, err := strconv.ParseFloat(req.ViaLong, 64); err != nil {
			errors["via_long"] = "Enter a valid longitude"
		}
	}

	req.EndName = strings.TrimSpace(req.EndName)
	if req.EndName == "" {
		errors["end_name"] = "End point name is required"
	} else if len(req.EndName) > 100 {
		errors["end_name"] = "End point name must be less than 100 characters"
	}

	req.EndLat = strings.TrimSpace(req.EndLat)
	if req.EndLat != "" {
		if len(req.EndLat) > 20 {
			errors["end_lat"] = "Enter a valid latitude"
		} else if _, err := strconv.ParseFloat(req.EndLat, 64); err != nil {
			errors["end_lat"] = "Enter a valid latitude"
		}
	}

	req.EndLong = strings.TrimSpace(req.EndLong)
	if req.EndLong != "" {
		if len(req.EndLong) > 20 {
			errors["end_long"] = "Enter a valid longitude"
		} else if _, err := strconv.ParseFloat(req.EndLong, 64); err != nil {
			errors["end_long"] = "Enter a valid longitude"
		}
	}

	return errors, clientID
}

// resolveClientName fetches the client name for the given id within the company
func resolveClientName(db *gorm.DB, companyID *uint, clientID uint) (string, error) {
	var client models.Client
	query := db.Select("id", "client_name")
	if companyID != nil {
		query = query.Where("company_id = ?", *companyID)
	}
	if err := query.First(&client, clientID).Error; err != nil {
		return "", err
	}
	return client.ClientName, nil
}

// CreateRoute creates a route for the current company
// POST /routes/create-route
func CreateRoute(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parseRouteRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, clientID := validateRouteRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	clientName, err := resolveClientName(db, authUser.CompanyID, *clientID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": map[string]string{"client_id": "Select a valid client"}})
	}

	now := time.Now()
	route := models.Route{
		CompanyID:  authUser.CompanyID,
		ClientID:   clientID,
		ClientName: clientName,
		StartName:  req.StartName,
		StartLat:   req.StartLat,
		StartLong:  req.StartLong,
		ViaName:    req.ViaName,
		ViaLat:     req.ViaLat,
		ViaLong:    req.ViaLong,
		EndName:    req.EndName,
		EndLat:     req.EndLat,
		EndLong:    req.EndLong,
		CreatedBy:  int64(authUser.ID),
		CreatedAt:  &now,
		UpdatedAt:  &now,
	}

	if err := db.Create(&route).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create route"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": route})
}

// GetRoutes lists routes of the current company, paginated
// GET /routes/get-all-route?page=1&limit=10&query=
func GetRoutes(c *fiber.Ctx, db *gorm.DB) error {
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

	query := db.Model(&models.Route{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where("client_name LIKE ? OR start_name LIKE ? OR via_name LIKE ? OR end_name LIKE ?", like, like, like, like)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count routes"})
	}

	var routes []models.Route
	if err := query.
		Select("id", "client_id", "client_name", "start_name", "start_lat", "start_long", "via_name", "via_lat", "via_long", "end_name", "end_lat", "end_long").
		Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&routes).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch routes"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   routes,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetRoute returns a single route of the current company
// GET /routes/:id/get-route-details
func GetRoute(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	routeID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid route id"})
	}

	var route models.Route
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&route, routeID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Route not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": route})
}

// UpdateRoute updates a route of the current company
// PUT /routes/:id/update-route
func UpdateRoute(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	routeID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid route id"})
	}

	var route models.Route
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&route, routeID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Route not found"})
	}

	req, err := parseRouteRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, clientID := validateRouteRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	clientName, err := resolveClientName(db, authUser.CompanyID, *clientID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": map[string]string{"client_id": "Select a valid client"}})
	}

	now := time.Now()
	route.ClientID = clientID
	route.ClientName = clientName
	route.StartName = req.StartName
	route.StartLat = req.StartLat
	route.StartLong = req.StartLong
	route.ViaName = req.ViaName
	route.ViaLat = req.ViaLat
	route.ViaLong = req.ViaLong
	route.EndName = req.EndName
	route.EndLat = req.EndLat
	route.EndLong = req.EndLong
	route.UpdatedAt = &now

	if err := db.Save(&route).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update route"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": route})
}

// DeleteRoute removes a route of the current company
// DELETE /routes/:id/delete-route
func DeleteRoute(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	routeID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid route id"})
	}

	var route models.Route
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&route, routeID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Route not found"})
	}

	if err := db.Delete(&route).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete route"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Route deleted successfully"})
}
