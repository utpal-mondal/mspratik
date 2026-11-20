package handlers

import (
	"path/filepath"
	"testing"

	"wms-backend/models"
)

func TestDriverDocumentStorageInfoUsesStoredRelativePath(t *testing.T) {
	storageDir := filepath.Join("test-data", "driver-documents")
	t.Setenv("DRIVER_DOCUMENTS_DIR", storageDir)

	storagePath, filename, extension, err := driverDocumentStorageInfo(models.DriverDocument{
		ID:           12,
		DocumentName: "uploads/driver-documents/12-license.png",
	})
	if err != nil {
		t.Fatalf("resolve document storage path: %v", err)
	}
	if want := filepath.Join(storageDir, "12-license.png"); storagePath != want {
		t.Fatalf("storage path = %q, want %q", storagePath, want)
	}
	if filename != "12-license.png" || extension != ".png" {
		t.Fatalf("filename/extension = %q/%q, want %q/%q", filename, extension, "12-license.png", ".png")
	}
}

func TestDriverDocumentStorageInfoRejectsPathTraversal(t *testing.T) {
	_, _, _, err := driverDocumentStorageInfo(models.DriverDocument{
		ID:           12,
		DocumentName: "uploads/driver-documents/../secret.png",
	})
	if err == nil {
		t.Fatal("expected invalid stored document path to be rejected")
	}
}
