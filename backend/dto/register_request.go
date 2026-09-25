package dto

type RegisterRequest struct {
	FirstName           string   `json:"firstName" validate:"required,min=2,max=30"`
	LastName            string   `json:"lastName" validate:"required,min=2,max=30"`
	Username            string   `json:"username" validate:"required,alphanum,min=3,max=30"`
	Email               string   `json:"email" validate:"required,email"`
	Password            string   `json:"password" validate:"required,min=6"`
	PhoneNumber         string   `json:"phoneNumber" validate:"required"`
	Company             string   `json:"company" validate:"required"`
	Country             string   `json:"country" validate:"required"`
	Region              string   `json:"region,omitempty"`
	City                string   `json:"city" validate:"required"`
	Address1            string   `json:"address1" validate:"required"`
	Address2            string   `json:"address2,omitempty"`
	PostCode            string   `json:"postCode" validate:"required"`
	Language            string   `json:"language" validate:"oneof=en nl"`
	PortalNotifications bool     `json:"portalNotifications"`
	AllowedIPs          bool     `json:"allowedIPs"`
	MinOrder            *float64 `json:"minOrder,omitempty"`
	Remarks             string   `json:"remarks,omitempty"`
}
