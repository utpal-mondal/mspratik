// backend/handlers/settings.go
package handlers

import (
	"strconv"
	"strings"
	"time"

	"wms-backend/middleware"
	"wms-backend/models"
	"wms-backend/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func getCadminUser(c *fiber.Ctx) (middleware.AuthUser, error) {
	authUser, ok := c.Locals("user").(middleware.AuthUser)
	if !ok {
		return authUser, fiber.NewError(fiber.StatusForbidden, "Access denied")
	}
	return authUser, nil
}

func replaceRolePermissions(tx *gorm.DB, roleID uint, permissionIDs []uint) error {
	if err := tx.Where("role_id = ?", roleID).Delete(&models.RoleHasPermission{}).Error; err != nil {
		return err
	}
	if len(permissionIDs) == 0 {
		return nil
	}
	rows := make([]models.RoleHasPermission, 0, len(permissionIDs))
	for _, pid := range permissionIDs {
		rows = append(rows, models.RoleHasPermission{RoleID: roleID, PermissionID: pid})
	}
	return tx.Create(&rows).Error
}

// GetRoles lists the roles of the current company with their permissions
// GET /settings/get-roles
func GetRoles(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	var roles []models.Role
	query := db.Preload("Permissions").Order("id")
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.Find(&roles).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "fail",
			"message": "Failed to fetch roles",
		})
	}

	return c.JSON(fiber.Map{"status": "success", "data": roles})
}

type roleRequest struct {
	Name        string `json:"name"`
	Permissions []uint `json:"permissions"`
}

// CreateRole creates a role for the current company
// POST /settings/create-role
func CreateRole(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	var req roleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}
	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Role name is required"})
	}

	role := models.Role{
		Name:      req.Name,
		GuardName: "web",
		CompanyID: authUser.CompanyID,
		IsDefault: false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&role).Error; err != nil {
			return err
		}
		return replaceRolePermissions(tx, role.ID, req.Permissions)
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create role"})
	}

	db.Preload("Permissions").First(&role, role.ID)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": role})
}

// UpdateRole updates a role's name and permission set
// PUT /settings/update-role/:id
func UpdateRole(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	roleID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid role id"})
	}

	var role models.Role
	if err := db.First(&role, roleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Role not found"})
	}
	if authUser.CompanyID != nil && role.CompanyID != nil && *role.CompanyID != *authUser.CompanyID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"status": "fail", "message": "Access denied"})
	}

	var req roleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{"updated_at": time.Now()}
		if name := strings.TrimSpace(req.Name); name != "" {
			updates["name"] = name
		}
		if err := tx.Model(&role).Updates(updates).Error; err != nil {
			return err
		}
		return replaceRolePermissions(tx, role.ID, req.Permissions)
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update role"})
	}

	db.Preload("Permissions").First(&role, role.ID)
	return c.JSON(fiber.Map{"status": "success", "data": role})
}

// DeleteRole removes a role and its assignments
// DELETE /settings/delete-role/:id
func DeleteRole(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	roleID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid role id"})
	}

	var role models.Role
	if err := db.First(&role, roleID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "Role not found"})
	}
	if authUser.CompanyID != nil && role.CompanyID != nil && *role.CompanyID != *authUser.CompanyID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"status": "fail", "message": "Access denied"})
	}
	if role.IsDefault {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Default roles cannot be deleted"})
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("role_id = ?", role.ID).Delete(&models.RoleHasPermission{}).Error; err != nil {
			return err
		}
		if err := tx.Where("role_id = ?", role.ID).Delete(&models.ModelHasRole{}).Error; err != nil {
			return err
		}
		return tx.Delete(&role).Error
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete role"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Role deleted successfully"})
}

type settingsUserOut struct {
	ID        uint       `json:"id"`
	Fname     string     `json:"fname"`
	Lname     string     `json:"lname"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Role      string     `json:"role"`
	RoleID    uint       `json:"role_id"`
	IsActive  bool       `json:"is_active"`
	IsCadmin  string     `json:"is_cadmin"`
	LastLogin *time.Time `json:"last_login"`
}

func mapUsersWithRoles(db *gorm.DB, users []models.User) ([]settingsUserOut, error) {
	userIDs := make([]uint, 0, len(users))
	for _, u := range users {
		userIDs = append(userIDs, u.ID)
	}

	var links []models.ModelHasRole
	if len(userIDs) > 0 {
		if err := db.Where("model_type = ? AND model_id IN ?", "App\\Models\\User", userIDs).Find(&links).Error; err != nil {
			return nil, err
		}
	}

	roleIDs := make([]uint, 0, len(links))
	for _, l := range links {
		roleIDs = append(roleIDs, l.RoleID)
	}
	roleNames := make(map[uint]string, len(roleIDs))
	if len(roleIDs) > 0 {
		var roles []models.Role
		if err := db.Where("id IN ?", roleIDs).Find(&roles).Error; err != nil {
			return nil, err
		}
		for _, r := range roles {
			roleNames[r.ID] = r.Name
		}
	}

	roleByUser := make(map[uint]models.ModelHasRole, len(links))
	for _, l := range links {
		roleByUser[l.ModelID] = l
	}

	out := make([]settingsUserOut, 0, len(users))
	for _, u := range users {
		item := settingsUserOut{
			ID:        u.ID,
			Fname:     u.Fname,
			Lname:     u.Lname,
			Username:  u.Username,
			Email:     u.Email,
			IsActive:  u.IsActive,
			IsCadmin:  u.IsCadmin,
			LastLogin: u.LastLogin,
		}
		if link, ok := roleByUser[u.ID]; ok {
			item.RoleID = link.RoleID
			item.Role = roleNames[link.RoleID]
		}
		out = append(out, item)
	}
	return out, nil
}

// GetSettingsUsers lists users of the current company, paginated
// GET /settings/get-users?page=1&limit=10
func GetSettingsUsers(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	query := db.Model(&models.User{})
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to count users"})
	}

	var users []models.User
	if err := query.Order("id").Offset((page - 1) * limit).Limit(limit).Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch users"})
	}

	out, err := mapUsersWithRoles(db, users)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to fetch user roles"})
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   out,
		"meta": fiber.Map{
			"total":      total,
			"totalPages": totalPages,
			"page":       page,
			"limit":      limit,
		},
	})
}

// GetSettingsUser returns a single user of the current company
// GET /settings/get-user/:id
func GetSettingsUser(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	userID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid user id"})
	}

	var user models.User
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "User not found"})
	}

	var link models.ModelHasRole
	roleID := uint(0)
	roleName := ""
	if err := db.Where("model_type = ? AND model_id = ?", "App\\Models\\User", user.ID).First(&link).Error; err == nil {
		roleID = link.RoleID
		var role models.Role
		if err := db.First(&role, link.RoleID).Error; err == nil {
			roleName = role.Name
		}
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"id":               user.ID,
			"fname":            user.Fname,
			"lname":            user.Lname,
			"username":         user.Username,
			"email":            user.Email,
			"phone_number":     user.PhoneNumber,
			"language":         user.Language,
			"receive_notify":   user.ReceiveNotify,
			"login_allowed_ip": user.LoginAllowedIP,
			"company_id":       user.CompanyID,
			"is_cadmin":        user.IsCadmin,
			"is_active":        user.IsActive,
			"role_id":          roleID,
			"role_name":        roleName,
			"warehouse_ids":    []uint{},
		},
	})
}

type settingsUserRequest struct {
	Fname          string `json:"fname"`
	Lname          string `json:"lname"`
	Username       string `json:"username"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	PhoneNumber    string `json:"phone_number"`
	Language       string `json:"language"`
	ReceiveNotify  bool   `json:"receive_notify"`
	LoginAllowedIP bool   `json:"login_allowed_ip"`
	RoleID         uint   `json:"role_id"`
}

func assignRoleToUser(db *gorm.DB, userID, roleID uint) error {
	if err := db.Where("model_type = ? AND model_id = ?", "App\\Models\\User", userID).Delete(&models.ModelHasRole{}).Error; err != nil {
		return err
	}
	if roleID == 0 {
		return nil
	}
	return db.Create(&models.ModelHasRole{
		RoleID:    roleID,
		ModelType: "App\\Models\\User",
		ModelID:   userID,
	}).Error
}

// CreateSettingsUser creates a user inside the current company
// POST /settings/create-user
func CreateSettingsUser(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	var req settingsUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.TrimSpace(req.Email)

	if req.Username == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "field": "username", "message": "Username is required"})
	}
	if req.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "field": "email", "message": "Email is required"})
	}
	if req.Password == "" || len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "field": "password", "message": "Password must be at least 6 characters"})
	}

	var existing models.User
	if err := db.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "field": "username", "message": "Username already in use"})
	}
	if err := db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "field": "email", "message": "Email already in use"})
	}

	now := time.Now()
	user := models.User{
		Fname:          req.Fname,
		Lname:          req.Lname,
		Username:       req.Username,
		Email:          req.Email,
		Password:       req.Password, // hashed by BeforeCreate hook
		PhoneNumber:    req.PhoneNumber,
		Language:       req.Language,
		CompanyID:      authUser.CompanyID,
		UserType:       "user",
		Type:           "user",
		Usertype:       2,
		IsCadmin:       "0",
		IsActive:       true,
		ReceiveNotify:  req.ReceiveNotify,
		LoginAllowedIP: req.LoginAllowedIP,
		CreatedBy:      int64(authUser.ID),
		CreatedAt:      &now,
		UpdatedAt:      &now,
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}
		return assignRoleToUser(tx, user.ID, req.RoleID)
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to create user"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": fiber.Map{"id": user.ID}})
}

// UpdateSettingsUser updates a user inside the current company
// PUT /settings/update-user/:id
func UpdateSettingsUser(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	userID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid user id"})
	}

	var user models.User
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "User not found"})
	}

	var req settingsUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid request body"})
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.TrimSpace(req.Email)

	var existing models.User
	if req.Username != "" && req.Username != user.Username {
		if err := db.Where("username = ? AND id != ?", req.Username, user.ID).First(&existing).Error; err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "field": "username", "message": "Username already in use"})
		}
	}
	if req.Email != "" && req.Email != user.Email {
		if err := db.Where("email = ? AND id != ?", req.Email, user.ID).First(&existing).Error; err == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"status": "fail", "field": "email", "message": "Email already in use"})
		}
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"fname":            req.Fname,
			"lname":            req.Lname,
			"phone_number":     req.PhoneNumber,
			"receive_notify":   req.ReceiveNotify,
			"login_allowed_ip": req.LoginAllowedIP,
			"updated_at":       time.Now(),
		}
		if req.Username != "" {
			updates["username"] = req.Username
		}
		if req.Email != "" {
			updates["email"] = req.Email
		}
		if req.Language != "" {
			updates["language"] = req.Language
		}
		if err := tx.Model(&user).Updates(updates).Error; err != nil {
			return err
		}
		return assignRoleToUser(tx, user.ID, req.RoleID)
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update user"})
	}

	return c.JSON(fiber.Map{"status": "success", "data": fiber.Map{"id": user.ID}})
}

// ChangeSettingsUserPassword lets a company admin set another user's password
// PUT /settings/change-password/:id
func ChangeSettingsUserPassword(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	userID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid user id"})
	}

	var req struct {
		Password string `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil || len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Password must be at least 6 characters"})
	}

	var user models.User
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "User not found"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to hash password"})
	}

	if err := db.Model(&user).Update("password", string(hashedPassword)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to update password"})
	}

	if err := utils.RevokeAllUserTokens(db, user.ID); err != nil {
		// Non-fatal: password was updated, tokens may still be valid until expiry
		_ = err
	}

	return c.JSON(fiber.Map{"status": "success", "message": "Password updated successfully"})
}

// DeleteSettingsUser removes a user from the current company
// DELETE /settings/delete-user/:id
func DeleteSettingsUser(c *fiber.Ctx, db *gorm.DB) error {
	authUser, err := getCadminUser(c)
	if err != nil {
		return err
	}

	userID, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Invalid user id"})
	}
	if uint(userID) == authUser.ID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "You cannot delete your own account"})
	}

	var user models.User
	query := db
	if authUser.CompanyID != nil {
		query = query.Where("company_id = ?", *authUser.CompanyID)
	}
	if err := query.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "fail", "message": "User not found"})
	}
	if user.IsCadmin == "1" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "fail", "message": "Company admin accounts cannot be deleted"})
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("model_type = ? AND model_id = ?", "App\\Models\\User", user.ID).Delete(&models.ModelHasRole{}).Error; err != nil {
			return err
		}
		return tx.Delete(&user).Error
	}); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "fail", "message": "Failed to delete user"})
	}

	return c.JSON(fiber.Map{"status": "success", "message": "User deleted successfully"})
}
