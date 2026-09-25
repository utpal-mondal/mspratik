// backend/routes/auth.go
package routes

import (
	"wms-backend/handlers"
	"wms-backend/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func SetupAuthRoutes(router fiber.Router, db *gorm.DB) {
	authHandler := &handlers.AuthHandler{DB: db}

	authGroup := router.Group("/auth")
	{
		authGroup.Get("/get-all-users", middleware.AuthMiddleware(db), middleware.DeserializeUser(db), authHandler.GetAllUser)
		authGroup.Post("/login", authHandler.Login)
		authGroup.Post("/register", authHandler.Register)
		authGroup.Post("/logout", authHandler.Logout)

		// Protected routes
		authGroup.Get("/me", middleware.AuthMiddleware(db), authHandler.GetCurrentUser)
		authGroup.Post("/change-password", middleware.AuthMiddleware(db), authHandler.ChangePassword)
	}
}
