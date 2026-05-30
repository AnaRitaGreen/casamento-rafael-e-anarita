package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"casamento/backend/internal/models"
)

// AdminHandler gerencia login, logout, grupos e mensagens.
type AdminHandler struct {
	db        *pgxpool.Pool
	jwtSecret string
}

func NewAdminHandler(db *pgxpool.Pool, jwtSecret string) *AdminHandler {
	return &AdminHandler{db: db, jwtSecret: jwtSecret}
}

// Login — POST /admin/login
func (h *AdminHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "corpo inválido", http.StatusBadRequest)
		return
	}

	// Busca o hash da senha do usuário
	var id int
	var hash string
	err := h.db.QueryRow(r.Context(),
		`SELECT id, password_hash FROM administradores WHERE username = $1`,
		req.Username,
	).Scan(&id, &hash)
	if err != nil {
		// Resposta genérica para não vazar informação sobre usernames válidos
		writeError(w, "credenciais inválidas", http.StatusUnauthorized)
		return
	}

	// Valida a senha com bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		writeError(w, "credenciais inválidas", http.StatusUnauthorized)
		return
	}

	// Gera o JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": id,
		"usr": req.Username,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenStr, err := token.SignedString([]byte(h.jwtSecret))
	if err != nil {
		writeError(w, "erro ao gerar token", http.StatusInternalServerError)
		return
	}

	// Define o cookie HttpOnly (seguro em produção)
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    tokenStr,
		Path:     "/",
		HttpOnly: true,
		// Secure: true, // Descomentar em produção (HTTPS)
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400, // 24h em segundos
	})

	writeJSON(w, map[string]string{"status": "ok"}, http.StatusOK)
}

// Logout — POST /admin/logout
func (h *AdminHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Limpa o cookie definindo MaxAge=-1
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})
	writeJSON(w, map[string]string{"status": "ok"}, http.StatusOK)
}

// GetGroups — GET /admin/groups
// Retorna todos os grupos para popular o select no modal de convidados.
func (h *AdminHandler) GetGroups(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(r.Context(), `SELECT id, nome_grupo FROM grupos ORDER BY nome_grupo`)
	if err != nil {
		writeError(w, "erro ao listar grupos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var groups []models.Group
	for rows.Next() {
		var g models.Group
		if err := rows.Scan(&g.ID, &g.NomeGrupo); err != nil {
			continue
		}
		groups = append(groups, g)
	}
	if groups == nil {
		groups = []models.Group{}
	}

	writeJSON(w, models.GroupListResponse{Groups: groups}, http.StatusOK)
}

// GetMessages — GET /admin/messages
// Retorna as mensagens deixadas pelos convidados no RSVP.
func (h *AdminHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(r.Context(), `
		SELECT id, grupo_id, nome, mensagem, data
		FROM mensagens
		ORDER BY data DESC
	`)
	if err != nil {
		writeError(w, "erro ao listar mensagens", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var msgs []models.Message
	for rows.Next() {
		var m models.Message
		if err := rows.Scan(&m.ID, &m.GrupoID, &m.Nome, &m.Mensagem, &m.Data); err != nil {
			continue
		}
		msgs = append(msgs, m)
	}
	if msgs == nil {
		msgs = []models.Message{}
	}

	writeJSON(w, models.MessageListResponse{Messages: msgs}, http.StatusOK)
}
