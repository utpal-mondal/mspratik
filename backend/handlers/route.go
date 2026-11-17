// backend/handlers/route.go
package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type routeRequest struct {
	RouteName string             `json:"route_name"`
	StartName string             `json:"start_name"`
	StartLat  string             `json:"start_lat"`
	StartLong string             `json:"start_long"`
	ViaPoints []routePointRequest `json:"via_points"`
	EndName   string             `json:"end_name"`
	EndLat    string             `json:"end_lat"`
	EndLong   string             `json:"end_long"`
}

type routePointRequest struct {
	Name   string `json:"name"`
	Lat    string `json:"lat"`
	Long   string `json:"long"`
	Notify bool   `json:"notify"`
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
	req := routeRequest{
		RouteName: c.FormValue("route_name"),
		StartName: c.FormValue("start_name"),
		StartLat:  c.FormValue("start_lat"),
		StartLong: c.FormValue("start_long"),
		EndName:   c.FormValue("end_name"),
		EndLat:    c.FormValue("end_lat"),
		EndLong:   c.FormValue("end_long"),
	}
	if viaPoints := c.FormValue("via_points"); viaPoints != "" {
		if err := json.Unmarshal([]byte(viaPoints), &req.ViaPoints); err != nil {
			return req, err
		}
	}
	return req, nil
}

func validateRouteRequest(req *routeRequest) map[string]string {
	errors := map[string]string{}

	req.RouteName = strings.TrimSpace(req.RouteName)
	if req.RouteName == "" {
		errors["route_name"] = "Route name is required"
	} else if len(req.RouteName) > 100 {
		errors["route_name"] = "Route name must be less than 100 characters"
	}

	req.StartName = strings.TrimSpace(req.StartName)
	if req.StartName == "" {
		errors["start_name"] = "Start point name is required"
	} else if len(req.StartName) > 100 {
		errors["start_name"] = "Start point name must be less than 100 characters"
	}

	req.StartLat = strings.TrimSpace(req.StartLat)
	if !validCoordinate(req.StartLat, -90, 90) {
		errors["start_lat"] = "Enter a valid latitude"
	}

	req.StartLong = strings.TrimSpace(req.StartLong)
	if !validCoordinate(req.StartLong, -180, 180) {
		errors["start_long"] = "Enter a valid longitude"
	}

	for i := range req.ViaPoints {
		point := &req.ViaPoints[i]
		point.Name = strings.TrimSpace(point.Name)
		point.Lat = strings.TrimSpace(point.Lat)
		point.Long = strings.TrimSpace(point.Long)
		if point.Name == "" || len(point.Name) > 100 {
			errors["via_points"] = "Each via point must have a name under 100 characters"
		}
		if !validCoordinate(point.Lat, -90, 90) {
			errors["via_points"] = "Each via point must have a valid latitude"
		}
		if !validCoordinate(point.Long, -180, 180) {
			errors["via_points"] = "Each via point must have a valid longitude"
		}
	}

	req.EndName = strings.TrimSpace(req.EndName)
	if req.EndName == "" {
		errors["end_name"] = "End point name is required"
	} else if len(req.EndName) > 100 {
		errors["end_name"] = "End point name must be less than 100 characters"
	}

	req.EndLat = strings.TrimSpace(req.EndLat)
	if !validCoordinate(req.EndLat, -90, 90) {
		errors["end_lat"] = "Enter a valid latitude"
	}

	req.EndLong = strings.TrimSpace(req.EndLong)
	if !validCoordinate(req.EndLong, -180, 180) {
		errors["end_long"] = "Enter a valid longitude"
	}

	return errors
}

func validCoordinate(value string, min, max float64) bool {
	if value == "" || len(value) > 20 {
		return false
	}
	number, err := strconv.ParseFloat(value, 64)
	return err == nil && number >= min && number <= max
}

func persistViaPoints(db *gorm.DB, routeID uint, points []routePointRequest) error {
	if err := db.Where("route_id = ?", routeID).Delete(&models.RouteStop{}).Error; err != nil {
		return err
	}
	if len(points) == 0 {
		return nil
	}
	records := make([]models.RouteStop, len(points))
	for i, point := range points {
		records[i] = models.RouteStop{
			RouteID:  routeID,
			Name:     point.Name,
			Lat:      point.Lat,
			Long:     point.Long,
			Position: i + 1,
			Notify:   point.Notify,
		}
	}
	return db.Create(&records).Error
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

	errors := validateRouteRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	now := time.Now()
	route := models.Route{
		RouteName:  req.RouteName,
		StartName:  req.StartName,
		StartLat:   req.StartLat,
		StartLong:  req.StartLong,
		EndName:    req.EndName,
		EndLat:     req.EndLat,
		EndLong:    req.EndLong,
		CreatedBy:  int64(authUser.ID),
		CreatedAt:  &now,
		UpdatedAt:  &now,
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&route).Error; err != nil {
			return fmt.Errorf("insert route: %w", err)
		}
		if authUser.CompanyID != nil {
			owner := models.RouteCompany{
				RouteID:   route.ID,
				CompanyID: *authUser.CompanyID,
			}
			if err := tx.Create(&owner).Error; err != nil {
				return fmt.Errorf("associate route with company: %w", err)
			}
		}
		if err := persistViaPoints(tx, route.ID, req.ViaPoints); err != nil {
			return fmt.Errorf("save route via points: %w", err)
		}
		return nil
	}); err != nil {
		log.Printf("Failed to create route: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create route"})
	}
	route.ViaPoints = make([]models.RouteStop, len(req.ViaPoints))
	for i, point := range req.ViaPoints {
		route.ViaPoints[i] = models.RouteStop{
			RouteID:  route.ID,
			Name:     point.Name,
			Lat:      point.Lat,
			Long:     point.Long,
			Position: i + 1,
			Notify:   point.Notify,
		}
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
		query = query.Where(
			"EXISTS (SELECT 1 FROM route_companies WHERE route_companies.route_id = routes.id AND route_companies.company_id = ?)",
			*authUser.CompanyID,
		)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where(
			"(route_name LIKE ? OR start_name LIKE ? OR end_name LIKE ? OR EXISTS (SELECT 1 FROM route_stops WHERE route_stops.route_id = routes.id AND route_stops.name LIKE ?))",
			like, like, like, like,
		)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count routes"})
	}

	var routes []models.Route
	if err := query.
		Preload("ViaPoints", func(db *gorm.DB) *gorm.DB { return db.Order("position ASC") }).
		Select("id", "route_name", "start_name", "start_lat", "start_long", "end_name", "end_lat", "end_long").
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
		query = query.Where(
			"EXISTS (SELECT 1 FROM route_companies WHERE route_companies.route_id = routes.id AND route_companies.company_id = ?)",
			*authUser.CompanyID,
		)
	}
	if err := query.Preload("ViaPoints", func(db *gorm.DB) *gorm.DB { return db.Order("position ASC") }).First(&route, routeID).Error; err != nil {
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
		query = query.Where(
			"EXISTS (SELECT 1 FROM route_companies WHERE route_companies.route_id = routes.id AND route_companies.company_id = ?)",
			*authUser.CompanyID,
		)
	}
	if err := query.First(&route, routeID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Route not found"})
	}

	req, err := parseRouteRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors := validateRouteRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	now := time.Now()
	route.RouteName = req.RouteName
	route.StartName = req.StartName
	route.StartLat = req.StartLat
	route.StartLong = req.StartLong
	route.EndName = req.EndName
	route.EndLat = req.EndLat
	route.EndLong = req.EndLong
	route.UpdatedAt = &now

	if err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Omit("ViaPoints").Save(&route).Error; err != nil {
			return err
		}
		return persistViaPoints(tx, route.ID, req.ViaPoints)
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update route"})
	}
	route.ViaPoints = make([]models.RouteStop, len(req.ViaPoints))
	for i, point := range req.ViaPoints {
		route.ViaPoints[i] = models.RouteStop{
			RouteID:  route.ID,
			Name:     point.Name,
			Lat:      point.Lat,
			Long:     point.Long,
			Position: i + 1,
			Notify:   point.Notify,
		}
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
		query = query.Where(
			"EXISTS (SELECT 1 FROM route_companies WHERE route_companies.route_id = routes.id AND route_companies.company_id = ?)",
			*authUser.CompanyID,
		)
	}
	if err := query.First(&route, routeID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Route not found"})
	}

	if err := db.Delete(&route).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete route"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Route deleted successfully"})
}
