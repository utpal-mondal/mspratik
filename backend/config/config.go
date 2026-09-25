// backend/config/config.go
package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Environment string `mapstructure:"ENVIRONMENT"`
	Database    struct {
		Host     string `mapstructure:"DB_HOST"`
		Port     string `mapstructure:"DB_PORT"`
		User     string `mapstructure:"DB_USER"`
		Password string `mapstructure:"DB_PASSWORD"`
		Name     string `mapstructure:"DB_NAME"`
		SSLMode  string `mapstructure:"DB_SSLMODE"`
	} `mapstructure:",squash"`
	Server struct {
		Port      string `mapstructure:"PORT"`
		JWTSecret string `mapstructure:"JWT_SECRET"`
	} `mapstructure:",squash"`
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(*os.PathError); ok {
			// .env file not found, use environment variables
			viper.SetDefault("ENVIRONMENT", "development")
			viper.SetDefault("DB_HOST", "localhost")
			viper.SetDefault("DB_PORT", "3306")
			viper.SetDefault("DB_USER", "root")
			viper.SetDefault("DB_PASSWORD", "")
			viper.SetDefault("DB_NAME", "wms")
			viper.SetDefault("DB_SSLMODE", "disable")
			viper.SetDefault("PORT", "3000")
			viper.SetDefault("JWT_SECRET", "your-very-secure-jwt-secret-key-here")
		} else {
			return nil, fmt.Errorf("failed to read config: %w", err)
		}
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &config, nil
}

// GetDSN returns the database connection string
func (c *Config) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.Database.User,
		c.Database.Password,
		c.Database.Host,
		c.Database.Port,
		c.Database.Name,
	)
}

// IsDevelopment checks if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction checks if the environment is production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}
