package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Connect cria e valida um pool de conexões com o PostgreSQL.
func Connect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("erro ao parsear DATABASE_URL: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar pool de conexões: %w", err)
	}

	// Valida que a conexão está funcionando
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("banco de dados inacessível: %w", err)
	}

	return pool, nil
}
