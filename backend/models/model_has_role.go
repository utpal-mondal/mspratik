package models

// ModelHasRole defines the pivot table for assigning roles to models.
type ModelHasRole struct {
	RoleID    uint   `gorm:"primaryKey;autoIncrement:false" json:"role_id"`
	ModelType string `gorm:"primaryKey;type:varchar(255);autoIncrement:false" json:"model_type"`
	ModelID   uint   `gorm:"primaryKey;autoIncrement:false" json:"model_id"`
}

// TableName specifies the table name
func (ModelHasRole) TableName() string {
	return "model_has_roles"
}
