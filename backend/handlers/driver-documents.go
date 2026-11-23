package handlers

import (
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

const maxDriverDocumentSize = 5 * 1024 * 1024
const driverDocumentRelativePath = "uploads/driver-documents/"

var driverDocumentTypes = map[string]struct{}{
	"Aadhar Card":     {},
	"PAN Card":        {},
	"Voter Card":      {},
	"Driving License": {},
	"Passport":        {},
}

var driverDocumentExtensions = map[string]struct{}{
	".pdf":  {},
	".svg":  {},
	".png":  {},
	".jpg":  {},
	".jpeg": {},
	".webp": {},
}

func driverDocumentsDirectory() string {
	if dir := os.Getenv("DRIVER_DOCUMENTS_DIR"); dir != "" {
		return dir
	}
	return filepath.Join("uploads", "driver-documents")
}

func safeDriverDocumentFilename(documentID uint, originalName string) string {
	extension := strings.ToLower(filepath.Ext(originalName))
	stem := strings.TrimSuffix(originalName, filepath.Ext(originalName))
	var safeStem strings.Builder
	for _, char := range stem {
		switch {
		case char >= 'a' && char <= 'z', char >= 'A' && char <= 'Z', char >= '0' && char <= '9':
			safeStem.WriteRune(char)
		case char == '-' || char == '_' || char == '.':
			safeStem.WriteRune(char)
		default:
			safeStem.WriteByte('-')
		}
	}
	cleanStem := strings.Trim(safeStem.String(), ".-_")
	if cleanStem == "" {
		cleanStem = "document"
	}
	if len(cleanStem) > 100 {
		cleanStem = cleanStem[:100]
	}
	return fmt.Sprintf("%d-%s%s", documentID, cleanStem, extension)
}

func driverDocumentStorageInfo(document models.DriverDocument) (string, string, string, error) {
	// Newer rows store the storage path in file_path ("/uploads/driver-documents/<file>")
	if fp := strings.TrimSpace(document.FilePath); fp != "" {
		fp = strings.TrimPrefix(fp, "/")
		if !strings.HasPrefix(fp, driverDocumentRelativePath) {
			return "", "", "", fmt.Errorf("invalid stored driver document path")
		}
		filename := strings.TrimPrefix(fp, driverDocumentRelativePath)
		if filename == "" || path.Base(filename) != filename {
			return "", "", "", fmt.Errorf("invalid stored driver document filename")
		}
		extension := strings.ToLower(filepath.Ext(filename))
		if _, valid := driverDocumentExtensions[extension]; !valid {
			return "", "", "", fmt.Errorf("invalid stored driver document type")
		}
		return filepath.Join(driverDocumentsDirectory(), filename), filename, extension, nil
	}

	if strings.HasPrefix(document.DocumentName, driverDocumentRelativePath) {
		filename := strings.TrimPrefix(document.DocumentName, driverDocumentRelativePath)
		if filename == "" || path.Base(filename) != filename {
			return "", "", "", fmt.Errorf("invalid stored driver document filename")
		}
		extension := strings.ToLower(filepath.Ext(filename))
		if _, valid := driverDocumentExtensions[extension]; !valid {
			return "", "", "", fmt.Errorf("invalid stored driver document type")
		}
		return filepath.Join(driverDocumentsDirectory(), filename), filename, extension, nil
	}

	// Older rows stored only the original name and used ID-based filenames.
	extension := strings.ToLower(filepath.Ext(document.DocumentName))
	if _, valid := driverDocumentExtensions[extension]; !valid {
		return "", "", "", fmt.Errorf("invalid stored driver document type")
	}
	filename := fmt.Sprintf("%d%s", document.ID, extension)
	return filepath.Join(driverDocumentsDirectory(), filename), filename, extension, nil
}

func saveDriverDocument(file *multipart.FileHeader, storagePath string) error {
	input, err := file.Open()
	if err != nil {
		return fmt.Errorf("open uploaded document: %w", err)
	}
	defer input.Close()

	output, err := os.OpenFile(storagePath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	if err != nil {
		return fmt.Errorf("create document file: %w", err)
	}
	written, copyErr := io.Copy(output, io.LimitReader(input, maxDriverDocumentSize+1))
	closeErr := output.Close()
	if copyErr != nil {
		removePartialDriverDocument(storagePath)
		return fmt.Errorf("write document: %w", copyErr)
	}
	if closeErr != nil {
		removePartialDriverDocument(storagePath)
		return fmt.Errorf("close document: %w", closeErr)
	}
	if written == 0 || written > maxDriverDocumentSize || written != file.Size {
		removePartialDriverDocument(storagePath)
		return fmt.Errorf("uploaded document size does not match")
	}
	return nil
}

func removePartialDriverDocument(storagePath string) {
	if err := os.Remove(storagePath); err != nil && !errors.Is(err, os.ErrNotExist) {
		log.Printf("Failed to remove partial driver document file %q: %v", storagePath, err)
	}
}

func parseDriverDocumentID(value string) (uint, error) {
	id, err := strconv.ParseUint(value, 10, 64)
	if err != nil || id == 0 {
		return 0, fiber.NewError(fiber.StatusBadRequest, "Invalid driver id")
	}
	return uint(id), nil
}

func parseDocumentID(value string) (uint, error) {
	id, err := strconv.ParseUint(value, 10, 64)
	if err != nil || id == 0 {
		return 0, fiber.NewError(fiber.StatusBadRequest, "Invalid document id")
	}
	return uint(id), nil
}

func loadDriverForDocuments(db *gorm.DB, companyID *uint, driverID uint) (models.Driver, error) {
	query := db
	if companyID != nil {
		query = query.Where("company_id = ?", *companyID)
	}
	var driver models.Driver
	if err := query.First(&driver, driverID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return driver, fiber.NewError(fiber.StatusNotFound, "Driver not found")
		}
		return driver, fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch driver")
	}
	return driver, nil
}

func GetDriverDocuments(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}
	driverID, err := parseDriverDocumentID(c.Params("id"))
	if err != nil {
		return err
	}
	if _, err := loadDriverForDocuments(db, authUser.CompanyID, driverID); err != nil {
		return err
	}

	var documents []models.DriverDocument
	if err := db.Where("driver_id = ?", driverID).Order("id DESC").Find(&documents).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch driver documents")
	}
	return c.JSON(fiber.Map{"status": "success", "data": documents})
}

func UploadDriverDocument(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}
	driverID, err := parseDriverDocumentID(c.Params("id"))
	if err != nil {
		return err
	}
	driver, err := loadDriverForDocuments(db, authUser.CompanyID, driverID)
	if err != nil {
		return err
	}

	documentType := strings.TrimSpace(c.FormValue("document_type"))
	if _, valid := driverDocumentTypes[documentType]; !valid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "fail",
			"errors": fiber.Map{"document_type": "Select a valid document type"},
		})
	}

	var expiryDate *time.Time
	if value := strings.TrimSpace(c.FormValue("expiry_date")); value != "" {
		parsed, err := time.Parse("2006-01-02", value)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status": "fail",
				"errors": fiber.Map{"expiry_date": "Enter a valid expiry date"},
			})
		}
		expiryDate = &parsed
	}

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "A document file is required"})
	}
	if file.Size <= 0 || file.Size > maxDriverDocumentSize {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Document must be between 1 byte and 5 MB"})
	}

	originalName := strings.TrimSpace(filepath.Base(strings.ReplaceAll(file.Filename, `\`, "/")))
	extension := strings.ToLower(filepath.Ext(originalName))
	if originalName == "" || originalName == "." || len(originalName) > 255 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid document filename"})
	}
	if _, valid := driverDocumentExtensions[extension]; !valid {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Upload a PDF, SVG, PNG, JPG, or WEBP document"})
	}

	now := time.Now()
	document := models.DriverDocument{
		CompanyID:    authUser.CompanyID,
		DriverID:     driverID,
		DriverName:   driver.DriverName,
		ExpiryDate:   expiryDate,
		DocumentType: documentType,
		DocumentName: originalName,
		CreatedBy:    int64(authUser.ID),
		CreatedAt:    &now,
		UpdatedAt:    &now,
	}
	if err := db.Create(&document).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to save document details")
	}

	if err := os.MkdirAll(driverDocumentsDirectory(), 0750); err != nil {
		if rollbackErr := db.Delete(&document).Error; rollbackErr != nil {
			log.Printf("Failed to remove driver document record %d after storage setup failure: %v", document.ID, rollbackErr)
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to prepare document storage")
	}
	filename := safeDriverDocumentFilename(document.ID, originalName)
	storagePath := filepath.Join(driverDocumentsDirectory(), filename)
	if err := saveDriverDocument(file, storagePath); err != nil {
		if rollbackErr := db.Delete(&document).Error; rollbackErr != nil {
			log.Printf("Failed to remove driver document record %d after upload failure: %v", document.ID, rollbackErr)
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to store document")
	}
	document.FilePath = "/" + driverDocumentRelativePath + filename
	if err := db.Model(&document).Update("file_path", document.FilePath).Error; err != nil {
		removePartialDriverDocument(storagePath)
		if rollbackErr := db.Delete(&document).Error; rollbackErr != nil {
			log.Printf("Failed to remove driver document record %d after URL save failure: %v", document.ID, rollbackErr)
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to save document path")
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": document})
}

// DeleteDriverDocument removes a driver document record and its stored file
// DELETE /drivers/:id/documents/:documentId/delete-document
func DeleteDriverDocument(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}
	driverID, err := parseDriverDocumentID(c.Params("id"))
	if err != nil {
		return err
	}
	if _, err := loadDriverForDocuments(db, authUser.CompanyID, driverID); err != nil {
		return err
	}
	documentID, err := parseDocumentID(c.Params("documentId"))
	if err != nil {
		return err
	}

	var document models.DriverDocument
	if err := db.Where("id = ? AND driver_id = ?", documentID, driverID).First(&document).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "Driver document not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch driver document")
	}

	// Unscoped() bypasses the gorm.DeletedAt soft delete and removes the row
	if err := db.Unscoped().Delete(&document).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to delete driver document")
	}

	storagePath, _, _, err := driverDocumentStorageInfo(document)
	if err == nil && storagePath != "" {
		var rmErr error
		for attempt := 0; attempt < 5; attempt++ {
			rmErr = os.Remove(storagePath)
			if rmErr == nil || errors.Is(rmErr, os.ErrNotExist) {
				break
			}
			time.Sleep(150 * time.Millisecond)
		}
		if rmErr != nil && !errors.Is(rmErr, os.ErrNotExist) {
			log.Printf("Failed to remove driver document file %q: %v", storagePath, rmErr)
		}
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Driver document deleted successfully"})
}
