// backend/handlers/permission.go
package handlers

import (
	"wms-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// PermissionGroup represents a group of permissions by category
type PermissionGroup struct {
	Category    string             `json:"category"`
	Permissions []PermissionWithID `json:"permissions"`
}

// PermissionWithID represents a permission with its ID and name
type PermissionWithID struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// GetAllPermissions returns all permissions grouped by category
func GetAllPermissions(c *fiber.Ctx, db *gorm.DB) error {
	var permissions []models.Permission

	if err := db.Find(&permissions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "fail",
			"message": "Failed to fetch permissions",
		})
	}

	// Group permissions by category
	groupedPermissions := groupPermissionsByCategory(permissions)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   groupedPermissions,
	})
}

// groupPermissionsByCategory groups permissions based on their names
func groupPermissionsByCategory(permissions []models.Permission) []PermissionGroup {
	// Define category keywords for grouping with dummy permission name (real one will add later)
	categories := map[string][]string{
		"Orders": {
			"Process orders", "View orders", "Create / Edit orders", "Cancel orders", "Delete order",
			"View order profit price", "Add tracking number", "Create order payment",
		},
		"Purchase": {
			"View purchase orders", "View all purchase orders", "View own purchase orders", "Edit purchase orders", "Create / Edit purchase orders", "Create purchase payment", "Update purchase status", "Mark purchase order as purchased", "Purchase in USD", "Delete purchase product",
		},
		"Returns": {
			"View returns", "Create returns", "Edit returns", "Cancel returns",
		},
		"Products": {
			"View products", "Create / Edit products", "Delete products", "Search products", "View purchase price",
			"Update product status", "View Product Selling Price", "View Product Purchase Price", "View Product Margin",
		},
		"Customers": {
			"View customers", "View customer list", "Create / Edit customers", "Delete customers",
			"Pay customers", "Deactivate customers", "View customer ledger",
			"View customer sales", "View customer documents", "Search customers",
		},
		"Picklists": {
			"View picklists", "Create picklists", "Cancel picklists", "Close picklists",
			"Add serial number",
		},
		"Shipment": {
			"Create shipment", "View Shipment",
		},
		"Warehouses": {
			"View warehouses", "Create / Edit warehouses", "Delete warehouses", "Search warehouses",
		},
		"Backorders": {
			"View backorders", "Process backorders",
		},
		"Locations": {
			"View locations", "Create / Edit locations", "Delete locations", "Link locations to products",
		},
		"Suppliers": {
			"View suppliers", "Create / Edit suppliers", "Delete suppliers", "Search suppliers",
		},
		"Others": {
			"View reports", "View stock value", "View invoice",
			"Allow adding products not on purchase order to receipts",
			"Allow exporting/importing", "Change stock manually",
			"Show fixed stock price", "Create batch",
		},
		"Parcel": {
			"Create percel", "Delete percel",
		},
		"Request Invoice": {
			"Create / Edit request invoice", "Delete request invoice",
		},
		"Brands": {
			"View brands", "Create / Edit brands", "Delete brands",
		},
		"Payments": {
			"View payments", "Incoming payments", "Outgoing payments",
		},
		"Categories": {
			"View categories", "Create / Edit categories", "Delete categories",
		},
		"Banks": {
			"View banks", "Create / Edit banks", "Delete banks", "Search banks",
		},
		"Repairs": {
			"View repairs", "Create / Edit repairs", "Update repair status",
		},
		"Stock transfers": {
			"View all stock transfers", "View own stock transfers", "Create / Edit stock transfers", "Update stock transfer status", "Delete stock transfers", "Show stock transfer purchase price",
		},
		"Tracking Control": {
			"View tracking controls", "Create tracking controls", "Delete tracking controls",
		},
		"Bank reminders": {
			"View bank reminders", "Create / Edit bank reminders", "Delete bank reminders", "Update bank reminder status", "Create bank reminder payment", "View bank reminder documents", "Download bank reminder documents",
		},
		"Dashboard": {
			"View Warehouse Sale Report", "View Warehouse Profit", "View Amir Shop Sale Report", "View Amir Shop Stock Report", "View AFZ ONLINE Shop Sale Report", "View Amir Shop Sale Report (Total Profit at the end)", "View AFZ ONLINE Shop Sale Report (Total Profit at the end)", "View Detail POS/Repair Report", "View Detail POS/Repair Profit", "View Warehouse Stock Report", "View AFZ ONLINE (AKMAL SHOP) Stock Transfer Report",
			"View Customer Stock Report", "View Top Trending Products", "View Warehouses Stock Report", "View Top 10 Suppliers", "View Top 10 Customers", "View IMEI Trading Report",
		},
	}

	// Create a map of permission names to their IDs for quick lookup
	permissionMap := make(map[string]uint)
	for _, perm := range permissions {
		permissionMap[perm.Name] = perm.ID
	}

	// Build grouped permissions
	var result []PermissionGroup
	for category, permissionNames := range categories {
		var categoryPermissions []PermissionWithID
		for _, permName := range permissionNames {
			if permID, exists := permissionMap[permName]; exists {
				categoryPermissions = append(categoryPermissions, PermissionWithID{
					ID:   permID,
					Name: permName,
				})
			}
		}
		if len(categoryPermissions) > 0 {
			result = append(result, PermissionGroup{
				Category:    category,
				Permissions: categoryPermissions,
			})
		}
	}

	return result
}
