package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"casamento/backend/internal/config"
	"casamento/backend/internal/db"
	"casamento/backend/internal/handlers"
	"casamento/backend/internal/middleware"

	// Carrega .env automaticamente em desenvolvimento
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	// ── Configuração ──────────────────────────────────────── //
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Configuração inválida: %v\n", err)
	}

	// ── Banco de Dados ────────────────────────────────────── //
	ctx := context.Background()
	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("❌ Banco de dados: %v\n", err)
	}
	defer pool.Close()
	log.Println("✅ Banco de dados conectado")

	// ── Handlers ──────────────────────────────────────────── //
	guestH  := handlers.NewGuestHandler(pool)
	rsvpH   := handlers.NewRSVPHandler(pool)
	adminH  := handlers.NewAdminHandler(pool, cfg.JWTSecret)
	exportH := handlers.NewExportHandler(pool)

	// ── Middlewares ───────────────────────────────────────── //
	corsMiddleware := middleware.CORS(cfg.AllowedOrigin)
	authMiddleware := middleware.Auth(cfg.JWTSecret)

	// Wrapper para encadear middlewares auth + handler
	protected := func(h http.Handler) http.Handler {
		return corsMiddleware(authMiddleware(h))
	}
	public := func(h http.Handler) http.Handler {
		return corsMiddleware(h)
	}

	// ── Rotas ─────────────────────────────────────────────── //
	mux := http.NewServeMux()

	// Públicas
	mux.Handle("GET /guests/search",       public(http.HandlerFunc(guestH.SearchGuests)))
	mux.Handle("POST /rsvp",               public(http.HandlerFunc(rsvpH.SubmitRSVP)))
	mux.Handle("POST /admin/login",        public(http.HandlerFunc(adminH.Login)))

	// Admin (protegidas por JWT)
	mux.Handle("POST /admin/logout",              protected(http.HandlerFunc(adminH.Logout)))
	mux.Handle("GET /admin/guests",               protected(http.HandlerFunc(guestH.ListGuests)))
	mux.Handle("POST /admin/guests",              protected(http.HandlerFunc(guestH.AddGuest)))
	mux.Handle("PUT /admin/guests/{id}",          protected(http.HandlerFunc(guestH.UpdateGuest)))
	mux.Handle("DELETE /admin/guests/{id}",       protected(http.HandlerFunc(guestH.DeleteGuest)))
	mux.Handle("GET /admin/groups",               protected(http.HandlerFunc(adminH.GetGroups)))
	mux.Handle("GET /admin/messages",             protected(http.HandlerFunc(adminH.GetMessages)))
	mux.Handle("GET /admin/export/csv",           protected(http.HandlerFunc(exportH.ExportCSV)))

	// Preflight OPTIONS para todas as rotas admin
	mux.Handle("OPTIONS /", corsMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})))

	// ── Servidor ──────────────────────────────────────────── //
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 API rodando em http://localhost%s\n", addr)
	log.Printf("   CORS: %s\n", cfg.AllowedOrigin)

	srv := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("❌ Servidor: %v\n", err)
		os.Exit(1)
	}
}
