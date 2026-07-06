// Ferramenta CLI para criar o primeiro usuário administrador.
//
// Uso:
//   go run ./cmd/create-admin/main.go -username rafael -password MinhaSenh@123
//
// Ou via variáveis de ambiente do .env (lidas automaticamente):
//   ADMIN_USER=rafael ADMIN_PASS=MinhaSenh@123 go run ./cmd/create-admin/main.go
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv/autoload"
	"golang.org/x/crypto/bcrypt"

	"casamento/backend/internal/config"
	"casamento/backend/internal/db"
)

func main() {
	username := flag.String("username", "", "Username do administrador")
	password := flag.String("password", "", "Senha do administrador")
	flag.Parse()

	// Aceita também via env vars
	if *username == "" {
		*username = os.Getenv("ADMIN_USER")
	}
	if *password == "" {
		*password = os.Getenv("ADMIN_PASS")
	}

	if *username == "" || *password == "" {
		fmt.Fprintln(os.Stderr, "❌ Uso: go run ./cmd/create-admin/main.go -username SEU_USUARIO -password SUA_SENHA")
		os.Exit(1)
	}

	if len(*password) < 8 {
		fmt.Fprintln(os.Stderr, "❌ A senha deve ter pelo menos 8 caracteres.")
		os.Exit(1)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Configuração: %v", err)
	}

	ctx := context.Background()
	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Banco de dados: %v", err)
	}
	defer pool.Close()

	if err := createAdmin(ctx, pool, *username, *password); err != nil {
		log.Fatalf("❌ %v", err)
	}

	fmt.Printf("✅ Administrador '%s' criado com sucesso!\n", *username)
	fmt.Println("   Acesse /admin/login para entrar no painel.")
}

func createAdmin(ctx context.Context, pool *pgxpool.Pool, username, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return fmt.Errorf("erro ao gerar hash da senha: %w", err)
	}

	_, err = pool.Exec(ctx, `
		INSERT INTO administradores (username, password_hash)
		VALUES ($1, $2)
		ON CONFLICT (username) DO UPDATE SET password_hash = $2
	`, username, string(hash))
	if err != nil {
		return fmt.Errorf("erro ao inserir no banco: %w", err)
	}

	return nil
}
