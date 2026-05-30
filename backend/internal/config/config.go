package config

import (
	"fmt"
	"os"
)

// Config centraliza todas as variáveis de ambiente da aplicação.
type Config struct {
	DatabaseURL    string
	JWTSecret      string
	AllowedOrigin  string
	Port           string
}

// Load lê as variáveis de ambiente e retorna a configuração.
// Retorna erro se alguma variável obrigatória estiver ausente.
func Load() (*Config, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Montar a URL a partir das partes individuais (conveniente para desenvolvimento)
		host := getEnvOrDefault("DB_HOST", "localhost")
		port := getEnvOrDefault("DB_PORT", "5432")
		user := getEnvOrDefault("DB_USER", "noivos_admin")
		pass := getEnvOrDefault("DB_PASSWORD", "SuaSenhaSuperSeguraAqui")
		name := getEnvOrDefault("DB_NAME", "casamento_db")
		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, pass, host, port, name)
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET não definida — defina uma chave secreta forte no .env")
	}

	return &Config{
		DatabaseURL:   dbURL,
		JWTSecret:     jwtSecret,
		AllowedOrigin: getEnvOrDefault("ALLOWED_ORIGIN", "http://localhost:4321"),
		Port:          getEnvOrDefault("PORT", "8080"),
	}, nil
}

func getEnvOrDefault(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
