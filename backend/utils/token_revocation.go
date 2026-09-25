// backend/utils/token_revocation.go
package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"wms-backend/models"

	"gorm.io/gorm"
)

// HashToken returns the SHA-256 hex digest of a token string
func HashToken(tokenString string) string {
	sum := sha256.Sum256([]byte(tokenString))
	return hex.EncodeToString(sum[:])
}

// revokeAllMarkerHash returns the sentinel token_hash used to record a
// "revoke all sessions" cutoff timestamp for a user
func revokeAllMarkerHash(userID uint) string {
	return fmt.Sprintf("revoke-all:%d", userID)
}

// IsTokenRevoked reports whether the given token has been revoked
func IsTokenRevoked(db *gorm.DB, tokenString string) (bool, error) {
	var count int64
	err := db.Model(&models.RevokedToken{}).
		Where("token_hash = ?", HashToken(tokenString)).
		Count(&count).Error
	if err != nil || count > 0 {
		return count > 0, err
	}

	// Check whether the user's sessions were revoked en masse after this
	// token was issued (e.g. an admin changed their password)
	claims, err := ParseToken(tokenString)
	if err != nil || claims == nil {
		return false, nil
	}

	var marker models.RevokedToken
	if err := db.Where("token_hash = ?", revokeAllMarkerHash(claims.UserID)).First(&marker).Error; err != nil {
		return false, nil
	}

	if claims.IssuedAt == nil || claims.IssuedAt.Time.Before(marker.RevokedAt) {
		return true, nil
	}
	return false, nil
}

// RevokeToken records the token as revoked so it can no longer be used
func RevokeToken(db *gorm.DB, tokenString string) error {
	var userID uint
	if claims, err := ParseToken(tokenString); err == nil {
		userID = claims.UserID
	}

	record := models.RevokedToken{
		TokenHash: HashToken(tokenString),
		UserID:    userID,
		RevokedAt: time.Now(),
	}
	return db.Where(models.RevokedToken{TokenHash: record.TokenHash}).
		FirstOrCreate(&record).Error
}

// RevokeAllUserTokens invalidates every token issued for the user so far by
// recording a revocation cutoff timestamp. Tokens issued afterwards (new
// logins) remain valid.
func RevokeAllUserTokens(db *gorm.DB, userID uint) error {
	markerHash := revokeAllMarkerHash(userID)

	var record models.RevokedToken
	err := db.Where("token_hash = ?", markerHash).First(&record).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return db.Create(&models.RevokedToken{
				TokenHash: markerHash,
				UserID:    userID,
				RevokedAt: time.Now(),
			}).Error
		}
		return err
	}

	return db.Model(&record).Update("revoked_at", time.Now()).Error
}
