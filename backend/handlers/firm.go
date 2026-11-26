package handlers

import (
	"log"
	"regexp"
	"strconv"
	"strings"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type firmRequest struct {
	Name            string   `json:"name"`
	Address1        string   `json:"address_1"`
	Address2        string   `json:"address_2"`
	PanNo           string   `json:"pan_no"`
	GstnNo          string   `json:"gstn_no"`
	CashInHand      *float64 `json:"cash_in_hand"`
	ShortForm       string   `json:"short_form"`
	TanNo           string   `json:"tan_no"`
	StartingSession string   `json:"starting_session"`
}

var tanRegex = regexp.MustCompile(`^[A-Z]{4}[0-9]{5}[A-Z]$`)
var firmSessionRegex = regexp.MustCompile(`^([0-9]{4})-([0-9]{2})$`)

func validateFirmRequest(req *firmRequest) map[string]string {
	errors := map[string]string{}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		errors["name"] = "Firm name is required"
	} else if len(req.Name) > 100 {
		errors["name"] = "Firm name must be 100 characters or fewer"
	}

	req.Address1 = strings.TrimSpace(req.Address1)
	if len(req.Address1) > 255 {
		errors["address_1"] = "Address 1 must be 255 characters or fewer"
	}
	req.Address2 = strings.TrimSpace(req.Address2)
	if len(req.Address2) > 255 {
		errors["address_2"] = "Address 2 must be 255 characters or fewer"
	}

	req.PanNo = strings.ToUpper(strings.TrimSpace(req.PanNo))
	if req.PanNo == "" {
		errors["pan_no"] = "PAN number is required"
	} else if !panRegex.MatchString(req.PanNo) {
		errors["pan_no"] = "Enter a valid PAN number"
	}

	req.GstnNo = strings.ToUpper(strings.TrimSpace(req.GstnNo))
	if req.GstnNo == "" {
		errors["gstn_no"] = "GSTN number is required"
	} else if !gstnRegex.MatchString(req.GstnNo) {
		errors["gstn_no"] = "Enter a valid GSTN number"
	}

	if req.CashInHand != nil && *req.CashInHand < 0 {
		errors["cash_in_hand"] = "Opening cash cannot be negative"
	}

	req.ShortForm = strings.TrimSpace(req.ShortForm)
	if len(req.ShortForm) > 10 {
		errors["short_form"] = "Short form must be 10 characters or fewer"
	}

	req.TanNo = strings.ToUpper(strings.TrimSpace(req.TanNo))
	if req.TanNo == "" {
		errors["tan_no"] = "TAN number is required"
	} else if !tanRegex.MatchString(req.TanNo) {
		errors["tan_no"] = "Enter a valid TAN number"
	}

	req.StartingSession = strings.ToUpper(strings.TrimSpace(req.StartingSession))
	if req.StartingSession != "" && req.StartingSession != "ALL" {
		matches := firmSessionRegex.FindStringSubmatch(req.StartingSession)
		if len(matches) != 3 {
			errors["starting_session"] = "Select a valid starting session"
		} else {
			startYear, startErr := strconv.Atoi(matches[1])
			endYear, endErr := strconv.Atoi(matches[2])
			if startErr != nil || endErr != nil || endYear != (startYear+1)%100 {
				errors["starting_session"] = "Select a valid starting session"
			}
		}
	}

	return errors
}

func GetFirms(c *fiber.Ctx, db *gorm.DB) error {
	firms := make([]models.Firm, 0)
	query := db.Model(&models.Firm{})
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where(
			"name LIKE ? OR address_1 LIKE ? OR address_2 LIKE ? OR pan_no LIKE ? OR gstn_no LIKE ? OR tan_no LIKE ? OR short_form LIKE ? OR starting_session LIKE ?",
			like, like, like, like, like, like, like, like,
		)
	}
	if err := query.Order("id DESC").Find(&firms).Error; err != nil {
		log.Printf("Failed to fetch firms: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch firms",
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": firms})
}

func GetFirm(c *fiber.Ctx, db *gorm.DB) error {
	firmID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid firm id",
		})
	}

	var firm models.Firm
	if err := db.First(&firm, firmID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "fail", "message": "Firm not found",
			})
		}
		log.Printf("Failed to fetch firm %d: %v", firmID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch firm",
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": firm})
}

func CreateFirm(c *fiber.Ctx, db *gorm.DB) error {
	var req firmRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid request body",
		})
	}
	if errors := validateFirmRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "errors": errors,
		})
	}

	firm := models.Firm{
		Name:            req.Name,
		Address1:        req.Address1,
		Address2:        req.Address2,
		PanNo:           req.PanNo,
		GstnNo:          req.GstnNo,
		CashInHand:      req.CashInHand,
		ShortForm:       req.ShortForm,
		TanNo:           req.TanNo,
		StartingSession: req.StartingSession,
	}
	if err := db.Create(&firm).Error; err != nil {
		log.Printf("Failed to create firm: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to create firm",
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": firm})
}

func UpdateFirm(c *fiber.Ctx, db *gorm.DB) error {
	firmID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid firm id",
		})
	}

	var firm models.Firm
	if err := db.First(&firm, firmID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "fail", "message": "Firm not found",
			})
		}
		log.Printf("Failed to fetch firm %d: %v", firmID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch firm",
		})
	}

	var req firmRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid request body",
		})
	}
	if errors := validateFirmRequest(&req); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "errors": errors,
		})
	}

	if err := db.Model(&firm).Updates(map[string]interface{}{
		"name":             req.Name,
		"address_1":        req.Address1,
		"address_2":        req.Address2,
		"pan_no":           req.PanNo,
		"gstn_no":          req.GstnNo,
		"cash_in_hand":     req.CashInHand,
		"short_form":       req.ShortForm,
		"tan_no":           req.TanNo,
		"starting_session": req.StartingSession,
	}).Error; err != nil {
		log.Printf("Failed to update firm %d: %v", firmID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to update firm",
		})
	}
	if err := db.First(&firm, firmID).Error; err != nil {
		log.Printf("Failed to reload updated firm %d: %v", firmID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to load updated firm",
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": firm})
}

func DeleteFirm(c *fiber.Ctx, db *gorm.DB) error {
	firmID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid firm id",
		})
	}

	result := db.Delete(&models.Firm{}, firmID)
	if result.Error != nil {
		log.Printf("Failed to delete firm %d: %v", firmID, result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to delete firm",
		})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status": "fail", "message": "Firm not found",
		})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Firm deleted successfully"})
}
