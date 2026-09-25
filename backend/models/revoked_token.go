// backend/models/revoked_token.go
package models

import "time"

// RevokedToken stores hashes of JWTs that have been invalidated via logout
type RevokedToken struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TokenHash string    `gorm:"uniqueIndex;size:64;not null" json:"token_hash"`
	UserID    uint      `gorm:"index" json:"user_id"`
	RevokedAt time.Time `json:"revoked_at"`
}
