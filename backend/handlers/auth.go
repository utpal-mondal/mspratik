// backend/handlers/auth.go
package handlers

import (
	"log"
	"strings"
	"time"

	"wms-backend/dto"
	"wms-backend/models"
	"wms-backend/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required,min=6"`
}

type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=30"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type AuthResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	User      struct {
		ID          uint     `json:"id"`
		CompanyID   *uint    `json:"company_id"`
		CompanyName string   `json:"company_name"`
		FirstName   string   `json:"firstName"`
		LastName    string   `json:"lastName"`
		Username    string   `json:"username"`
		Email       string   `json:"email"`
		Role        string   `json:"role"`
		IsCadmin    string   `json:"is_cadmin"`
		Permissions []string `json:"permissions"`
	} `json:"user"`
}

type RegisterUserResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	User      struct {
		ID          uint     `json:"id"`
		CompanyID   *uint    `json:"company_id"`
		FirstName   string   `json:"firstName"`
		LastName    string   `json:"lastName"`
		Username    string   `json:"username"`
		Email       string   `json:"email"`
		Role        string   `json:"role"`
		Permissions []string `json:"permissions"`
	} `json:"user"`
}

func getUserPermissions(db *gorm.DB, userID uint) ([]string, error) {
	var modelHasRoles []models.ModelHasRole
	if err := db.Where("model_id = ? AND model_type = ?", userID, "App\\Models\\User").Find(&modelHasRoles).Error; err != nil {
		return nil, err
	}
	if len(modelHasRoles) == 0 {
		return []string{}, nil
	}

	roleIDs := make([]uint, 0, len(modelHasRoles))
	for _, mhr := range modelHasRoles {
		roleIDs = append(roleIDs, mhr.RoleID)
	}

	var roleHasPermissions []models.RoleHasPermission
	if err := db.Where("role_id IN ?", roleIDs).Find(&roleHasPermissions).Error; err != nil {
		return nil, err
	}
	if len(roleHasPermissions) == 0 {
		return []string{}, nil
	}

	permissionIDs := make([]uint, 0, len(roleHasPermissions))
	for _, rp := range roleHasPermissions {
		permissionIDs = append(permissionIDs, rp.PermissionID)
	}

	var permissions []models.Permission
	if err := db.Where("id IN ?", permissionIDs).Find(&permissions).Error; err != nil {
		return nil, err
	}

	seen := make(map[string]bool)
	permissionNames := make([]string, 0, len(permissions))
	for _, p := range permissions {
		if !seen[p.Name] {
			seen[p.Name] = true
			permissionNames = append(permissionNames, p.Name)
		}
	}
	return permissionNames, nil
}

// Login handles user login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		log.Printf("DEBUG login: failed to parse body: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	req.Username = strings.TrimSpace(req.Username)

	log.Printf("DEBUG login: attempting login with identifier=%q passwordLen=%d", req.Username, len(req.Password))

	// Find user by username or email
	var user models.User
	if err := h.DB.Where("username = ? OR email = ?", req.Username, req.Username).First(&user).Error; err != nil {
		log.Printf("DEBUG login: no user found for identifier=%q (err=%v)", req.Username, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid username or password",
		})
	}

	log.Printf("DEBUG login: found user id=%d username=%q email=%q", user.ID, user.Username, user.Email)

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Printf("DEBUG login: password mismatch for user id=%d (err=%v)", user.ID, err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid username or password",
		})
	}

	log.Printf("DEBUG login: password matched for user id=%d", user.ID)

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, user.UserType)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// Update last login
	now := time.Now()
	user.LastLogin = &now
	h.DB.Save(&user)

	permissions, _ := getUserPermissions(h.DB, user.ID)

	// Fetch company name
	companyName := ""
	if user.CompanyID != nil && *user.CompanyID > 0 {
		var company models.Company
		if err := h.DB.First(&company, *user.CompanyID).Error; err == nil {
			companyName = company.Name
		}
	}

	roleName := "Has no role"
	var modelHasRole models.ModelHasRole

	if err := h.DB.Where("model_id = ?", user.ID).First(&modelHasRole).Error; err == nil {
		var role models.Role
		if err := h.DB.First(&role, modelHasRole.RoleID).Error; err == nil {
			roleName = role.Name
		}
	}

	// Prepare response
	// Tokens no longer expire on their own; they stay valid until revoked on logout
	expiresAt := time.Now().AddDate(100, 0, 0)
	response := AuthResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User: struct {
			ID          uint     `json:"id"`
			CompanyID   *uint    `json:"company_id"`
			CompanyName string   `json:"company_name"`
			FirstName   string   `json:"firstName"`
			LastName    string   `json:"lastName"`
			Username    string   `json:"username"`
			Email       string   `json:"email"`
			Role        string   `json:"role"`
			IsCadmin    string   `json:"is_cadmin"`
			Permissions []string `json:"permissions"`
		}{
			ID:          user.ID,
			CompanyID:   user.CompanyID,
			CompanyName: companyName,
			FirstName:   user.Fname,
			LastName:    user.Lname,
			Username:    user.Username,
			Email:       user.Email,
			Role:        roleName,
			IsCadmin:    user.IsCadmin,
			Permissions: permissions,
		},
	}

	return c.JSON(response)
}

// Register handles user registration
// In handlers/auth.go, update the Register function
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req dto.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check if a company already exists with the same email or name
	var existingCompany models.Company
	if err := h.DB.Where("email = ? OR name = ?", req.Email, req.Company).First(&existingCompany).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Company with this email or name already exists",
		})
	}

	// Check if a user already exists with the same email or username
	var existingUser models.User
	if err := h.DB.Where("email = ? OR username = ?", req.Email, req.Username).First(&existingUser).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Email or username already in use",
		})
	}

	now := time.Now()

	// Prepare company data and create the company first
	company := models.Company{
		Name:               req.Company,
		Email:              req.Email,
		RoleName:           "Company",
		Address:            req.Address1,
		Address2:           req.Address2,
		PostCode:           req.PostCode,
		Region:             req.Region,
		City:               req.City,
		Country:            req.Country,
		PhoneNumber:        req.PhoneNumber,
		Language:           req.Language,
		Remark:             req.Remarks,
		Status:             true,
		IsVerified:         false,
		IsBlock:            false,
		Active:             true,
		SubscriptionExpiry: "no",
		Expiry:             "no",
		CreatedAt:          &now,
		UpdatedAt:          &now,
	}
	if err := h.DB.Create(&company).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create company",
		})
	}

	// Create new user using the generated company ID
	user := models.User{
		Fname:          req.FirstName,
		Lname:          req.LastName,
		Username:       req.Username,
		Email:          req.Email,
		Password:       req.Password, // Will be hashed by BeforeCreate hook
		PhoneNumber:    req.PhoneNumber,
		CompanyID:      &company.ID,
		UserType:       "company", // Default role
		Type:           "company",
		IsCadmin:       "1",
		IsActive:       true,
		Language:       req.Language,
		ReceiveNotify:  req.PortalNotifications,
		LoginAllowedIP: req.AllowedIPs,
		CreatedAt:      &now,
		UpdatedAt:      &now,
	}

	// Create user in database
	if err := h.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	// Create a company-specific admin role
	roleName := req.Company + "_admin"
	role := models.Role{
		Name:      roleName,
		GuardName: "web",
		CompanyID: &company.ID,
		IsDefault: true,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := h.DB.Create(&role).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create company role",
		})
	}

	// Fetch all permissions and assign them to the role
	var allPermissions []models.Permission
	if err := h.DB.Find(&allPermissions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch permissions",
		})
	}

	if len(allPermissions) > 0 {
		rolePermissions := make([]models.RoleHasPermission, 0, len(allPermissions))
		for _, p := range allPermissions {
			rolePermissions = append(rolePermissions, models.RoleHasPermission{
				RoleID:       role.ID,
				PermissionID: p.ID,
			})
		}
		if err := h.DB.Create(&rolePermissions).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to assign permissions to role",
			})
		}
	}

	// Assign the role to the new user
	modelHasRole := models.ModelHasRole{
		RoleID:    role.ID,
		ModelType: "App\\Models\\User",
		ModelID:   user.ID,
	}
	if err := h.DB.Create(&modelHasRole).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to assign role to user",
		})
	}

	permissions, _ := getUserPermissions(h.DB, user.ID)

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, user.UserType)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// Prepare response
	// Tokens no longer expire on their own; they stay valid until revoked on logout
	expiresAt := time.Now().AddDate(100, 0, 0)
	response := RegisterUserResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User: struct {
			ID          uint     `json:"id"`
			CompanyID   *uint    `json:"company_id"`
			FirstName   string   `json:"firstName"`
			LastName    string   `json:"lastName"`
			Username    string   `json:"username"`
			Email       string   `json:"email"`
			Role        string   `json:"role"`
			Permissions []string `json:"permissions"`
		}{
			ID:          user.ID,
			CompanyID:   user.CompanyID,
			FirstName:   user.Fname,
			LastName:    user.Lname,
			Username:    user.Username,
			Email:       user.Email,
			Role:        user.UserType,
			Permissions: permissions,
		},
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// GetCurrentUser returns the current authenticated user
func (h *AuthHandler) GetCurrentUser(c *fiber.Ctx) error {
	userID := c.Locals("userID")

	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "userid is missing",
		})
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	permissions, _ := getUserPermissions(h.DB, user.ID)

	// Fetch company name
	companyName := ""
	if user.CompanyID != nil && *user.CompanyID > 0 {
		var company models.Company
		if err := h.DB.First(&company, *user.CompanyID).Error; err == nil {
			companyName = company.Name
		}
	}

	roleName := "Has no role"
	var modelHasRole models.ModelHasRole

	if err := h.DB.Where("model_id = ?", user.ID).First(&modelHasRole).Error; err == nil {
		var role models.Role
		if err := h.DB.First(&role, modelHasRole.RoleID).Error; err == nil {
			roleName = role.Name
		}
	}

	return c.JSON(fiber.Map{
		"user_id":      user.ID,
		"company_id":   user.CompanyID,
		"company_name": companyName,
		"username":     user.Username,
		"email":        user.Email,
		"firstName":    user.Fname,
		"lastName":     user.Lname,
		"role":         roleName,
		"is_cadmin":    user.IsCadmin,
		"permissions":  permissions,
	})
}

type ChangeOwnPasswordRequest struct {
	NewPassword     string `json:"new_password"`
	ConfirmPassword string `json:"confirm_password"`
}

// ChangePassword lets the authenticated user change their own password
func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	userID := c.Locals("userID")
	if userID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var req ChangeOwnPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.NewPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "New password is required",
		})
	}
	if len(req.NewPassword) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "New password must be at least 6 characters",
		})
	}
	if req.NewPassword != req.ConfirmPassword {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "New passwords do not match",
		})
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	if err := h.DB.Model(&user).Update("password", string(hashedPassword)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update password",
		})
	}

	// Invalidate all existing sessions so the user must sign in again
	if err := utils.RevokeAllUserTokens(h.DB, user.ID); err != nil {
		log.Printf("DEBUG change-password: failed to revoke tokens for user id=%d: %v", user.ID, err)
	}

	return c.JSON(fiber.Map{
		"message": "Password changed successfully",
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	// Revoke the bearer token so it can no longer be used
	authHeader := c.Get("Authorization")
	tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	if tokenString != "" && tokenString != authHeader {
		if err := utils.RevokeToken(h.DB, tokenString); err != nil {
			log.Printf("DEBUG logout: failed to revoke token: %v", err)
		}
	}

	return c.JSON(fiber.Map{
		"message": "Logout successful",
	})
}

type UserType struct {
	ID       uint   `json:"id"`
	Fname    string `json:"fname"`
	Lname    string `json:"lname"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

func (h *AuthHandler) GetAllUser(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(models.User)
	if !ok || user.CompanyID == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "fail",
			"message": "User not associated with a company",
		})
	}

	search := strings.ToLower(c.Query("q"))

	query := h.DB.
		Model(&models.User{}).
		Select("id, fname, lname, username, email").
		Where("company_id = ?", *user.CompanyID).
		Where("is_cadmin != ?", "1")

	if search != "" {
		term := "%" + search + "%"
		query = query.Where(
			"LOWER(fname) LIKE ? OR LOWER(lname) LIKE ? OR LOWER(username) LIKE ? OR LOWER(email) LIKE ?",
			term, term, term, term,
		)
	}

	var userData []UserType
	if err := query.Find(&userData).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Got error while fetching users associated with this company",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Successfully fetched users associated with this company",
		"data":    userData,
	})
}
