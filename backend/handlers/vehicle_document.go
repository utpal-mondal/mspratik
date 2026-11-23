// backend/handlers/vehicle_document.go
package handlers

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

const vehicleDocsUploadDir = "uploads/vehicle-documents"
const vehicleDocMaxSize = 5 << 20 // 5 MB

var vehicleDocAllowedExt = map[string]bool{
	".pdf": true, ".jpg": true, ".jpeg": true, ".png": true, ".webp": true,
}

// UploadVehicleDocument stores one or more documents for a vehicle
// POST /vehicles/:id/upload-document (multipart/form-data)
// fields: document_type (required), expiry_date (optional, YYYY-MM-DD), documents (file(s))
func UploadVehicleDocument(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	vehicleID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid vehicle id"})
	}

	var vehicle models.Vehicle
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&vehicle, vehicleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Vehicle not found"})
	}

	documentType := strings.TrimSpace(c.FormValue("document_type"))
	if documentType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "field": "document_type", "message": "Document type is required"})
	}

	var expiryDate *time.Time
	if v := strings.TrimSpace(c.FormValue("expiry_date")); v != "" {
		d, err := time.Parse("2006-01-02", v)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "field": "expiry_date", "message": "Enter a valid date (YYYY-MM-DD)"})
		}
		expiryDate = &d
	}

	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid multipart form"})
	}
	files := form.File["documents"]
	if len(files) == 0 {
		files = form.File["documents[]"]
	}
	if len(files) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "field": "documents", "message": "At least one document file is required"})
	}

	for _, fh := range files {
		if !vehicleDocAllowedExt[strings.ToLower(filepath.Ext(fh.Filename))] {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": fmt.Sprintf("Unsupported file type: %s", fh.Filename)})
		}
		if fh.Size > vehicleDocMaxSize {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": fmt.Sprintf("File exceeds 5 MB: %s", fh.Filename)})
		}
	}

	if err := os.MkdirAll(vehicleDocsUploadDir, 0o755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to prepare upload directory"})
	}

	now := time.Now()
	saved := make([]models.VehicleDocument, 0, len(files))
	for i, fh := range files {
		ext := strings.ToLower(filepath.Ext(fh.Filename))
		storedName := fmt.Sprintf("v%d_%d_%d%s", vehicle.ID, time.Now().UnixNano(), i, ext)
		fullPath := filepath.Join(vehicleDocsUploadDir, storedName)
		if err := c.SaveFile(fh, fullPath); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to save file"})
		}

		doc := models.VehicleDocument{
			CompanyID:     authUser.CompanyID,
			VehicleID:     vehicle.ID,
			VehicleNumber: vehicle.VehicleNumber,
			DocumentType:  documentType,
			ExpiryDate:    expiryDate,
			DocumentName:  fh.Filename,
			FilePath:      "/" + filepath.ToSlash(fullPath),
			CreatedBy:     int64(authUser.ID),
			CreatedAt:     &now,
			UpdatedAt:     &now,
		}
		if err := db.Create(&doc).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to save document record"})
		}
		saved = append(saved, doc)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": saved})
}

// GetVehicleDocuments lists documents of a vehicle
// GET /vehicles/:id/documents
func GetVehicleDocuments(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	vehicleID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid vehicle id"})
	}

	query := db.Where("vehicle_id = ?", vehicleID)
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}

	var docs []models.VehicleDocument
	if err := query.Order("id DESC").Find(&docs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch documents"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": docs})
}

// DeleteVehicleDocument removes a document record and its stored file
// DELETE /vehicles/:id/documents/:docId/delete-document
func DeleteVehicleDocument(c *fiber.Ctx, db *gorm.DB) error {
	authUser, ok := getAuthUser(c)
	if !ok {
		return fiber.NewError(fiber.StatusForbidden, "Access denied")
	}

	docID, err := strconv.ParseUint(c.Params("docId"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid document id"})
	}

	var doc models.VehicleDocument
	query := db.Where("vehicle_id = ?", c.Params("id"))
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&doc, docID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Document not found"})
	}

	// Unscoped() bypasses the gorm.DeletedAt soft delete and removes the row
	if err := db.Unscoped().Delete(&doc).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete document"})
	}

	// Best-effort cleanup of the stored file, resolved inside the upload dir
	if doc.FilePath != "" {
		rel := filepath.Clean(filepath.FromSlash(strings.TrimPrefix(doc.FilePath, "/")))
		uploadAbs, _ := filepath.Abs(vehicleDocsUploadDir)
		fileAbs, err := filepath.Abs(rel)
		if err != nil || !strings.HasPrefix(fileAbs, uploadAbs+string(os.PathSeparator)) {
			log.Printf("Skipped document file cleanup: file_path %q resolved to %q", doc.FilePath, fileAbs)
		} else {
			// Retry briefly: a concurrent file serve may still hold the handle
			var rmErr error
			for attempt := 0; attempt < 5; attempt++ {
				rmErr = os.Remove(fileAbs)
				if rmErr == nil || os.IsNotExist(rmErr) {
					break
				}
				time.Sleep(150 * time.Millisecond)
			}
			if rmErr != nil && !os.IsNotExist(rmErr) {
				log.Printf("Failed to remove vehicle document file %q: %v", fileAbs, rmErr)
			} else {
				log.Printf("Removed vehicle document file %q", fileAbs)
			}
		}
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Document deleted successfully"})
}
