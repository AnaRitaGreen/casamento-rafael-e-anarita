package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"casamento/backend/internal/models"
)

// GuestHandler agrupa os handlers relacionados a convidados.
type GuestHandler struct {
	db *pgxpool.Pool
}

func NewGuestHandler(db *pgxpool.Pool) *GuestHandler {
	return &GuestHandler{db: db}
}

// SearchGuests — GET /guests/search?name=...
// Rota pública: busca convidados pelo nome e retorna o grupo familiar.
func (h *GuestHandler) SearchGuests(w http.ResponseWriter, r *http.Request) {
	name := strings.TrimSpace(r.URL.Query().Get("name"))
	if name == "" {
		writeError(w, "parâmetro 'name' é obrigatório", http.StatusBadRequest)
		return
	}

	// Busca convidado por nome (case-insensitive, parcial)
	row := h.db.QueryRow(r.Context(), `
		SELECT c.grupo_id, g.nome_grupo
		FROM convidados c
		JOIN grupos g ON g.id = c.grupo_id
		WHERE unaccent(lower(c.nome_completo)) ILIKE unaccent(lower($1))
		LIMIT 1
	`, "%"+name+"%")

	var grupoID int
	var nomeGrupo string
	if err := row.Scan(&grupoID, &nomeGrupo); err != nil {
		writeError(w, "convidado não encontrado", http.StatusNotFound)
		return
	}

	// Busca todos os membros do grupo
	rows, err := h.db.Query(r.Context(), `
		SELECT id, nome_completo, eh_crianca
		FROM convidados
		WHERE grupo_id = $1
		ORDER BY id
	`, grupoID)
	if err != nil {
		writeError(w, "erro interno", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var members []models.GuestMember
	for rows.Next() {
		var m models.GuestMember
		if err := rows.Scan(&m.ID, &m.NomeCompleto, &m.EhCrianca); err != nil {
			continue
		}
		members = append(members, m)
	}

	writeJSON(w, models.GuestSearchResult{
		GrupoID:   grupoID,
		NomeGrupo: nomeGrupo,
		Members:   members,
	}, http.StatusOK)
}

// ListGuests — GET /admin/guests?page=1&per_page=15&name=...&status=
// Rota protegida: lista todos os convidados com paginação e filtros.
func (h *GuestHandler) ListGuests(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	page, _ := strconv.Atoi(q.Get("page"))
	if page < 1 {
		page = 1
	}
	perPage, _ := strconv.Atoi(q.Get("per_page"))
	if perPage < 1 || perPage > 1000 {
		perPage = 15
	}
	offset := (page - 1) * perPage

	// Query principal com JOIN para trazer o nome do grupo
	rows, err := h.db.Query(r.Context(), `
		SELECT
			c.id, c.grupo_id, g.nome_grupo,
			c.nome_completo, c.confirmado,
			c.data_confirmacao, c.restricao_alimentar, c.eh_crianca
		FROM convidados c
		LEFT JOIN grupos g ON g.id = c.grupo_id
		ORDER BY g.nome_grupo, c.nome_completo
		LIMIT $1 OFFSET $2
	`, perPage, offset)
	if err != nil {
		writeError(w, "erro ao listar convidados", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var guests []models.Guest
	for rows.Next() {
		var g models.Guest
		if err := rows.Scan(
			&g.ID, &g.GrupoID, &g.NomeGrupo,
			&g.NomeCompleto, &g.Confirmado,
			&g.DataConfirmacao, &g.RestricaoAlimentar, &g.EhCrianca,
		); err != nil {
			continue
		}
		guests = append(guests, g)
	}
	if guests == nil {
		guests = []models.Guest{}
	}

	var total int
	_ = h.db.QueryRow(r.Context(), `SELECT COUNT(*) FROM convidados`).Scan(&total)

	writeJSON(w, models.GuestListResponse{
		Guests:  guests,
		Total:   total,
		Page:    page,
		PerPage: perPage,
	}, http.StatusOK)
}

// AddGuest — POST /admin/guests
// Cria um novo convidado, opcionalmente em um grupo novo.
func (h *GuestHandler) AddGuest(w http.ResponseWriter, r *http.Request) {
	var req models.AddGuestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.NomeCompleto == "" {
		writeError(w, "nome_completo é obrigatório", http.StatusBadRequest)
		return
	}

	grupoID := req.GrupoID

	// Se informou nome de novo grupo, cria antes
	if req.NomeGrupoNovo != "" {
		var newID int
		err := h.db.QueryRow(r.Context(),
			`INSERT INTO grupos (nome_grupo) VALUES ($1) RETURNING id`,
			req.NomeGrupoNovo,
		).Scan(&newID)
		if err != nil {
			writeError(w, "erro ao criar grupo", http.StatusInternalServerError)
			return
		}
		grupoID = &newID
	}

	var id int
	err := h.db.QueryRow(r.Context(), `
		INSERT INTO convidados (grupo_id, nome_completo, restricao_alimentar, eh_crianca)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, grupoID, req.NomeCompleto, req.RestricaoAlimentar, req.EhCrianca).Scan(&id)
	if err != nil {
		writeError(w, "erro ao adicionar convidado", http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]int{"id": id}, http.StatusCreated)
}

// UpdateGuest — PUT /admin/guests/{id}
func (h *GuestHandler) UpdateGuest(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r, "id")
	if err != nil {
		writeError(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req models.AddGuestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.NomeCompleto == "" {
		writeError(w, "nome_completo é obrigatório", http.StatusBadRequest)
		return
	}

	grupoID := req.GrupoID
	if req.NomeGrupoNovo != "" {
		var newID int
		err := h.db.QueryRow(r.Context(),
			`INSERT INTO grupos (nome_grupo) VALUES ($1) RETURNING id`,
			req.NomeGrupoNovo,
		).Scan(&newID)
		if err != nil {
			writeError(w, "erro ao criar grupo", http.StatusInternalServerError)
			return
		}
		grupoID = &newID
	}

	_, err = h.db.Exec(r.Context(), `
		UPDATE convidados
		SET grupo_id = $1, nome_completo = $2, restricao_alimentar = $3, eh_crianca = $4
		WHERE id = $5
	`, grupoID, req.NomeCompleto, req.RestricaoAlimentar, req.EhCrianca, id)
	if err != nil {
		writeError(w, "erro ao atualizar convidado", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteGuest — DELETE /admin/guests/{id}
func (h *GuestHandler) DeleteGuest(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r, "id")
	if err != nil {
		writeError(w, "ID inválido", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(r.Context(), `DELETE FROM convidados WHERE id = $1`, id)
	if err != nil {
		writeError(w, "erro ao remover convidado", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// --- helpers internos ---

func extractID(r *http.Request, param string) (int, error) {
	return strconv.Atoi(r.PathValue(param))
}

func writeJSON(w http.ResponseWriter, v any, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(models.ErrorResponse{Error: msg})
}
