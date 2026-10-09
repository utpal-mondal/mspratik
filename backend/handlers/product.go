// backend/handlers/product.go
package handlers

import (
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type productRequest struct {
	Name  string `json:"name"`
	Price string `json:"price"`
}

// parseProductRequest accepts both multipart/form-data and JSON bodies
func parseProductRequest(c *fiber.Ctx) (productRequest, error) {
	if strings.Contains(c.Get("Content-Type"), "application/json") {
		var req productRequest
		if err := c.BodyParser(&req); err != nil {
			return req, err
		}
		return req, nil
	}
	return productRequest{
		Name:  c.FormValue("name"),
		Price: c.FormValue("price"),
	}, nil
}

func validateProductRequest(req *productRequest) (map[string]string, *float64) {
	errors := map[string]string{}
	var price *float64

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		errors["name"] = "Product name is required"
	} else if len(req.Name) < 2 {
		errors["name"] = "Product name must be at least 2 characters"
	} else if len(req.Name) > 100 {
		errors["name"] = "Product name must be less than 100 characters"
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

// CreateProduct creates a product for the current company
// POST /products/create-product
func CreateProduct(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	req, err := parseProductRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, price := validateProductRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	now := time.Now()
	product := models.Product{
		CompanyID: authUser.CompanyID,
		Name:      req.Name,
		Price:     price,
		CreatedBy: int64(authUser.ID),
		CreatedAt: &now,
		UpdatedAt: &now,
	}

	if err := db.Create(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create product"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": product})
}

// GetProducts lists products of the current company, paginated
// GET /products/get-all-product?page=1&limit=10&query=
func GetProducts(c *fiber.Ctx, db *gorm.DB) error {
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

	query := db.Model(&models.Product{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count products"})
	}

	var products []models.Product
	if err := query.Order("id DESC").Offset((page - 1) * limit).Limit(limit).Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch products"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   products,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetProduct returns a single product of the current company
// GET /products/:id/get-product-details
func GetProduct(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	productID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid product id"})
	}

	var product models.Product
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&product, productID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Product not found"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": product})
}

// UpdateProduct updates a product of the current company
// PUT /products/:id/update-product
func UpdateProduct(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	productID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid product id"})
	}

	var product models.Product
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&product, productID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Product not found"})
	}

	req, err := parseProductRequest(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	errors, price := validateProductRequest(&req)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	product.Name = req.Name
	product.Price = price
	now := time.Now()
	product.UpdatedAt = &now

	if err := db.Save(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update product"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": product})
}

// DeleteProduct removes a product of the current company
// DELETE /products/:id/delete-product
func DeleteProduct(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	productID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid product id"})
	}

	var product models.Product
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&product, productID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Product not found"})
	}

	if err := db.Delete(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete product"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Product deleted successfully"})
}
