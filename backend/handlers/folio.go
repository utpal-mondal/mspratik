package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"math"
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type folioRequest struct {
	BranchID    uint   `json:"branch_id"`
	FolioNo     string `json:"folio_no"`
	Amount      string `json:"amount"`
	BankPayment string `json:"bank_payment"`
	Date        string `json:"date"`
	Remark      string `json:"remark"`
	FolioType   string `json:"folio_type"`
}

func GetFolioBranches(c *fiber.Ctx, db *gorm.DB) error {
	var branches []models.Branch
	if err := db.Select("id", "name", "head").Order("name ASC").Find(&branches).Error; err != nil {
		log.Printf("Failed to fetch folio branches: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch branches",
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": branches})
}

func fiscalYearStart(now time.Time) time.Time {
	startYear := now.Year()
	if now.Month() < time.April {
		startYear--
	}
	return time.Date(startYear, time.April, 1, 0, 0, 0, 0, now.Location())
}

func formatFolioNumber(sequence uint64) (string, error) {
	if sequence == 0 || sequence > 99999 {
		return "", errors.New("folio number sequence exceeded five digits")
	}
	return fmt.Sprintf("%05d", sequence), nil
}

func nextFolioNumber(db *gorm.DB, now time.Time) (string, error) {
	startDate := fiscalYearStart(now)
	endDate := startDate.AddDate(1, 0, 0)
	var lastNumber uint64
	if err := db.Model(&models.Folio{}).
		Select("COALESCE(MAX(CAST(folio_no AS UNSIGNED)), 0)").
		Where("date >= ? AND date < ? AND folio_no REGEXP '^[0-9]+$' AND CAST(folio_no AS UNSIGNED) <= 99999", startDate, endDate).
		Scan(&lastNumber).Error; err != nil {
		return "", err
	}
	return formatFolioNumber(lastNumber + 1)
}

func parseOptionalFolioAmount(value string) (*float64, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	amount, err := strconv.ParseFloat(value, 64)
	if err != nil || math.IsNaN(amount) || math.IsInf(amount, 0) || amount < 0 {
		return nil, errors.New("amount must be a non-negative number")
	}
	return &amount, nil
}

func validateFolioRequest(req *folioRequest) (time.Time, map[string]string) {
	fieldErrors := map[string]string{}
	if req.BranchID == 0 {
		fieldErrors["branch_id"] = "Branch is required"
	}

	if req.FolioNo == "" {
		fieldErrors["folio_no"] = "Folio number is required"
	} else if len(req.FolioNo) > 6 {
		fieldErrors["folio_no"] = "Folio number must be six digits or fewer"
	} else {
		for _, digit := range req.FolioNo {
			if digit < '0' || digit > '9' {
				fieldErrors["folio_no"] = "Folio number must contain digits only"
				break
			}
		}
	}

	folioDate, err := time.Parse("2006-01-02", strings.TrimSpace(req.Date))
	if err != nil {
		fieldErrors["date"] = "A valid date is required"
	}

	req.FolioType = strings.TrimSpace(req.FolioType)
	if req.FolioType != "Normal" && req.FolioType != "Other" {
		fieldErrors["folio_type"] = "Folio type must be Normal or Other"
	}

	return folioDate, fieldErrors
}

func GetFolios(c *fiber.Ctx, db *gorm.DB) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	query := db.Model(&models.Folio{}).Preload("Branch")
	if search := strings.TrimSpace(c.Query("query")); search != "" {
		like := "%" + search + "%"
		query = query.Where(
			"(folio.folio_no LIKE ? OR EXISTS (SELECT 1 FROM branch WHERE branch.id = folio.branch_id AND branch.name LIKE ?) OR COALESCE(folio.remark, '') LIKE ? OR CAST(folio.amount AS CHAR) LIKE ? OR CAST(folio.bank_payment AS CHAR) LIKE ? OR folio.folio_type LIKE ?)",
			like, like, like, like, like, like,
		)
	}

	var startDate, endDate *time.Time
	for _, filter := range []struct {
		key       string
		operation string
		target    **time.Time
	}{
		{key: "start_date", operation: ">=", target: &startDate},
		{key: "end_date", operation: "<=", target: &endDate},
	} {
		value := strings.TrimSpace(c.Query(filter.key))
		if value == "" {
			continue
		}
		parsed, err := time.Parse("2006-01-02", value)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "fail", "message": filter.key + " must use YYYY-MM-DD format",
			})
		}
		*filter.target = &parsed
		query = query.Where("folio.date "+filter.operation+" ?", value)
	}
	if startDate != nil && endDate != nil && startDate.After(*endDate) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "start_date cannot be after end_date",
		})
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		log.Printf("Failed to count folios: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch folios",
		})
	}

	var latestDate sql.NullTime
	if err := db.Model(&models.Folio{}).Select("MAX(date)").Scan(&latestDate).Error; err != nil {
		log.Printf("Failed to find latest folio date: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch folios",
		})
	}

	var folios []models.Folio
	if err := query.Select("folio.*, (SELECT COUNT(*) FROM trip WHERE trip.folio_id = folio.id) AS no_of_trips").
		Order("folio.date DESC").Order("folio.id DESC").
		Offset((page - 1) * limit).Limit(limit).Find(&folios).Error; err != nil {
		log.Printf("Failed to fetch folios: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch folios",
		})
	}
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	var latestDateValue interface{}
	if latestDate.Valid {
		latestDateValue = latestDate.Time.Format("2006-01-02")
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   folios,
		"meta": fiber.Map{
			"total":       total,
			"totalPages":  totalPages,
			"page":        page,
			"limit":       limit,
			"latest_date": latestDateValue,
		},
	})
}

func GetFolio(c *fiber.Ctx, db *gorm.DB) error {
	folioID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil || folioID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid folio id",
		})
	}

	var folio models.Folio
	if err := db.Model(&models.Folio{}).
		Select("folio.*, (SELECT COUNT(*) FROM trip WHERE trip.folio_id = folio.id) AS no_of_trips").
		Preload("Branch").First(&folio, folioID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"status": "fail", "message": "Folio not found",
			})
		}
		log.Printf("Failed to fetch folio %d: %v", folioID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to fetch folio",
		})
	}
	return c.JSON(fiber.Map{"status": "success", "data": folio})
}

func GetNextFolioNumber(c *fiber.Ctx, db *gorm.DB) error {
	folioNo, err := nextFolioNumber(db, time.Now())
	if err != nil {
		log.Printf("Failed to reserve folio number: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to generate folio number",
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   fiber.Map{"folio_no": folioNo},
	})
}

func CreateFolio(c *fiber.Ctx, db *gorm.DB) error {
	var req folioRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail", "message": "Invalid request body",
		})
	}
	folioDate, fieldErrors := validateFolioRequest(&req)
	amount, err := parseOptionalFolioAmount(req.Amount)
	if err != nil {
		fieldErrors["amount"] = err.Error()
	}
	bankPayment, err := parseOptionalFolioAmount(req.BankPayment)
	if err != nil {
		fieldErrors["bank_payment"] = err.Error()
	}
	if len(fieldErrors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "errors": fieldErrors})
	}

	var branch models.Branch
	if err := db.First(&branch, req.BranchID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "fail", "errors": fiber.Map{"branch_id": "Selected branch was not found"},
			})
		}
		log.Printf("Failed to validate folio branch %d: %v", req.BranchID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to validate selected branch",
		})
	}

	var existingCount int64
	if err := db.Model(&models.Folio{}).
		Where("date = ? AND folio_no = ?", folioDate, req.FolioNo).
		Count(&existingCount).Error; err != nil {
		log.Printf("Failed to check folio number %q on %s: %v", req.FolioNo, folioDate.Format("2006-01-02"), err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to validate folio number",
		})
	}
	if existingCount > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"status": "fail", "errors": fiber.Map{"folio_no": "This folio number already exists for the selected date"},
		})
	}

	folio := models.Folio{
		BranchID:    req.BranchID,
		FolioNo:     req.FolioNo,
		Amount:      amount,
		BankPayment: bankPayment,
		Date:        folioDate,
		Remark:      strings.TrimSpace(req.Remark),
		FolioType:   req.FolioType,
	}
	if err := db.Create(&folio).Error; err != nil {
		var mysqlError *mysql.MySQLError
		if errors.As(err, &mysqlError) && mysqlError.Number == 1062 {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"status": "fail", "errors": fiber.Map{"folio_no": "This folio number already exists for the selected date"},
			})
		}
		log.Printf("Failed to create folio: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Failed to create folio",
		})
	}
	if err := db.Preload("Branch").First(&folio, folio.ID).Error; err != nil {
		log.Printf("Failed to load created folio %d: %v", folio.ID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "fail", "message": "Folio created but failed to load its details",
		})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": folio})
}
