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
	guestH    := handlers.NewGuestHandler(pool)
	rsvpH     := handlers.NewRSVPHandler(pool)
	adminH    := handlers.NewAdminHandler(pool, cfg.JWTSecret)
	exportH   := handlers.NewExportHandler(pool)
	presenteH := handlers.NewPresenteHandler(pool)

	// ── Middlewares ───────────────────────────────────────── //
	corsMiddleware := middleware.CORS(cfg.AllowedOrigin)
	authMiddleware := middleware.Auth(cfg.JWTSecret)

	// Wrappers para encadear middlewares
	protected := func(h http.Handler) http.Handler {
		return corsMiddleware(authMiddleware(h))
	}
	public := func(h http.Handler) http.Handler {
		return corsMiddleware(h)
	}

	// ── Rotas ─────────────────────────────────────────────── //
	mux := http.NewServeMux()

	// Rotas públicas (prefixo /api)
	mux.Handle("GET /api/guests/search",  public(http.HandlerFunc(guestH.SearchGuests)))
	mux.Handle("POST /api/rsvp",          public(http.HandlerFunc(rsvpH.SubmitRSVP)))
	mux.Handle("POST /api/admin/login",   public(http.HandlerFunc(adminH.Login)))

	// Lista de presentes — pública
	mux.Handle("GET /api/presentes",                   public(http.HandlerFunc(presenteH.ListPresentes)))
	mux.Handle("POST /api/presentes/{id}/reservar",    public(http.HandlerFunc(presenteH.ReservarPresente)))

	// Rotas admin — protegidas por JWT (prefixo /api)
	mux.Handle("POST /api/admin/logout",                    protected(http.HandlerFunc(adminH.Logout)))
	mux.Handle("GET /api/admin/guests",                     protected(http.HandlerFunc(guestH.ListGuests)))
	mux.Handle("POST /api/admin/guests",                    protected(http.HandlerFunc(guestH.AddGuest)))
	mux.Handle("PUT /api/admin/guests/{id}",                protected(http.HandlerFunc(guestH.UpdateGuest)))
	mux.Handle("DELETE /api/admin/guests/{id}",             protected(http.HandlerFunc(guestH.DeleteGuest)))
	mux.Handle("GET /api/admin/groups",                     protected(http.HandlerFunc(adminH.GetGroups)))
	mux.Handle("GET /api/admin/messages",                   protected(http.HandlerFunc(adminH.GetMessages)))
	mux.Handle("GET /api/admin/export/csv",                 protected(http.HandlerFunc(exportH.ExportCSV)))

	// Presentes — admin
	mux.Handle("GET /api/admin/presentes",                  protected(http.HandlerFunc(presenteH.AdminListPresentes)))
	mux.Handle("POST /api/admin/presentes",                 protected(http.HandlerFunc(presenteH.AdminAddPresente)))
	mux.Handle("PUT /api/admin/presentes/{id}",             protected(http.HandlerFunc(presenteH.AdminUpdatePresente)))
	mux.Handle("DELETE /api/admin/presentes/{id}",          protected(http.HandlerFunc(presenteH.AdminDeletePresente)))
	mux.Handle("POST /api/admin/presentes/{id}/liberar",    protected(http.HandlerFunc(presenteH.AdminLiberarReserva)))

	// ── Servidor com CORS global (intercepta OPTIONS preflight) //
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 API rodando em http://localhost%s/api/\n", addr)
	log.Printf("   CORS: %s\n", cfg.AllowedOrigin)

	srv := &http.Server{
		Addr: addr,
		// Aplica CORS em todas as requisições, inclusive OPTIONS preflight
		Handler: corsMiddleware(mux),
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("❌ Servidor: %v\n", err)
		os.Exit(1)
	}
}
