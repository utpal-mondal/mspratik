package handlers

import (
	"log"
	"strconv"
	"strings"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type pointRequest struct {
	Name                  string `json:"name"`
	ContactPerson         string `json:"contact_person"`
	ContactPersonMobileNo string `json:"contact_person_mobile_no"`
}

type pointConfig struct {
	name      string
	newEntity func(pointRequest) interface{}
	newList   func() interface{}
}

func optionalPointValue(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

var loadingPointConfig = pointConfig{
	name: "loading point",
	newEntity: func(req pointRequest) interface{} {
		return &models.LoadingPoint{
			Name: req.Name, ContactPerson: optionalPointValue(req.ContactPerson),
			ContactPersonMobileNo: optionalPointValue(req.ContactPersonMobileNo),
		}
	},
	newList: func() interface{} { return &[]models.LoadingPoint{} },
}

var unloadingPointConfig = pointConfig{
	name: "unloading point",
	newEntity: func(req pointRequest) interface{} {
		return &models.UnloadingPoint{
			Name: req.Name, ContactPerson: optionalPointValue(req.ContactPerson),
			ContactPersonMobileNo: optionalPointValue(req.ContactPersonMobileNo),
		}
	},
	newList: func() interface{} { return &[]models.UnloadingPoint{} },
}

func validatePointRequest(req *pointRequest) map[string]string {
	errors := map[string]string{}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		errors["name"] = "Name is required"
	} else if len(req.Name) > 100 {
		errors["name"] = "Name must be 100 characters or fewer"
	}

	req.ContactPerson = strings.TrimSpace(req.ContactPerson)
	if len(req.ContactPerson) > 100 {
		errors["contact_person"] = "Contact person must be 100 characters or fewer"
	}

	if req.ContactPersonMobileNo != "" {
		for _, digit := range req.ContactPersonMobileNo {
			if digit < '0' || digit > '9' {
				errors["contact_person_mobile_no"] = "Mobile number must contain digits only"
				break
			}
		}
		if errors["contact_person_mobile_no"] == "" && len(req.ContactPersonMobileNo) != 10 {
			errors["contact_person_mobile_no"] = "Mobile number must be exactly 10 digits"
		}
	}
	return errors
}

func getPoints(c *fiber.Ctx, db *gorm.DB, config pointConfig) error {
	query := db.Model(config.newEntity(pointRequest{}))
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where(
			"name LIKE ? OR contact_person LIKE ? OR contact_person_mobile_no LIKE ?",
			like, like, like,
		)
	}
	points := config.newList()
	if err := query.Order("id DESC").Find(points).Error; err != nil {
		log.Printf("Failed to fetch %s: %v", config.name, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch " + config.name + "s",
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": points})
}

func getPoint(c *fiber.Ctx, db *gorm.DB, config pointConfig) error {
	pointID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid point id"})
	}

	point := config.newEntity(pointRequest{})
	if err := db.First(point, pointID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "fail", "message": strings.Title(config.name) + " not found",
			})
		}
		log.Printf("Failed to fetch %s %d: %v", config.name, pointID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch " + config.name,
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": point})
}

func createPoint(c *fiber.Ctx, db *gorm.DB, config pointConfig) error {
	var req pointRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}
	if errors := validatePointRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}

	point := config.newEntity(req)
	if err := db.Create(point).Error; err != nil {
		log.Printf("Failed to create %s: %v", config.name, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to create " + config.name,
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": point})
}

func updatePoint(c *fiber.Ctx, db *gorm.DB, config pointConfig) error {
	pointID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid point id"})
	}
	point := config.newEntity(pointRequest{})
	if err := db.First(point, pointID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": strings.Title(config.name) + " not found"})
		}
		log.Printf("Failed to fetch %s %d: %v", config.name, pointID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch " + config.name,
		})
	}

	var req pointRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}
	if errors := validatePointRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": errors})
	}
	if err := db.Model(point).Updates(map[string]interface{}{
		"name":                     req.Name,
		"contact_person":           optionalPointValue(req.ContactPerson),
		"contact_person_mobile_no": optionalPointValue(req.ContactPersonMobileNo),
	}).Error; err != nil {
		log.Printf("Failed to update %s %d: %v", config.name, pointID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to update " + config.name,
		})
	}
	if err := db.First(point, pointID).Error; err != nil {
		log.Printf("Failed to reload updated %s %d: %v", config.name, pointID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to load updated " + config.name,
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": point})
}

func deletePoint(c *fiber.Ctx, db *gorm.DB, config pointConfig) error {
	pointID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid point id"})
	}
	result := db.Delete(config.newEntity(pointRequest{}), pointID)
	if result.Error != nil {
		log.Printf("Failed to delete %s %d: %v", config.name, pointID, result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to delete " + config.name,
		})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status": "fail", "message": strings.Title(config.name) + " not found",
		})
	}
	return c.JSON(fiber.Map{"status": "success", "message": strings.Title(config.name) + " deleted successfully"})
}

func GetLoadingPoints(c *fiber.Ctx, db *gorm.DB) error {
	return getPoints(c, db, loadingPointConfig)
}

func GetLoadingPoint(c *fiber.Ctx, db *gorm.DB) error {
	return getPoint(c, db, loadingPointConfig)
}

func CreateLoadingPoint(c *fiber.Ctx, db *gorm.DB) error {
	return createPoint(c, db, loadingPointConfig)
}

func UpdateLoadingPoint(c *fiber.Ctx, db *gorm.DB) error {
	return updatePoint(c, db, loadingPointConfig)
}

func DeleteLoadingPoint(c *fiber.Ctx, db *gorm.DB) error {
	return deletePoint(c, db, loadingPointConfig)
}

func GetUnloadingPoints(c *fiber.Ctx, db *gorm.DB) error {
	return getPoints(c, db, unloadingPointConfig)
}

func GetUnloadingPoint(c *fiber.Ctx, db *gorm.DB) error {
	return getPoint(c, db, unloadingPointConfig)
}

func CreateUnloadingPoint(c *fiber.Ctx, db *gorm.DB) error {
	return createPoint(c, db, unloadingPointConfig)
}

func UpdateUnloadingPoint(c *fiber.Ctx, db *gorm.DB) error {
	return updatePoint(c, db, unloadingPointConfig)
}

func DeleteUnloadingPoint(c *fiber.Ctx, db *gorm.DB) error {
	return deletePoint(c, db, unloadingPointConfig)
}
