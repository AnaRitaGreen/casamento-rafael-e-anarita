package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"casamento/backend/internal/models"
)

// PresenteHandler gerencia os endpoints da lista de presentes.
type PresenteHandler struct {
	db *pgxpool.Pool
}

// NewPresenteHandler cria um novo handler de presentes.
func NewPresenteHandler(db *pgxpool.Pool) *PresenteHandler {
	return &PresenteHandler{db: db}
}

// ── Públicos ───────────────────────────────────────────────────── //

// ListPresentes — GET /api/presentes
// Lista todos os presentes (sem expor quem reservou, para privacidade).
func (h *PresenteHandler) ListPresentes(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(r.Context(), `
		SELECT id, nome, descricao, preco, imagem_url, categoria, reservado
		FROM presentes
		ORDER BY categoria, nome
	`)
	if err != nil {
		writeError(w, "erro ao listar presentes", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	presentes := []models.Presente{}
	for rows.Next() {
		var p models.Presente
		if err := rows.Scan(&p.ID, &p.Nome, &p.Descricao, &p.Preco, &p.ImagemURL, &p.Categoria, &p.Reservado); err != nil {
			continue
		}
		presentes = append(presentes, p)
	}

	writeJSON(w, models.PresenteListResponse{Presentes: presentes}, http.StatusOK)
}

// ReservarPresente — POST /api/presentes/{id}/reservar
// Reserva um presente em nome do convidado. Idempotente: retorna 409 se já reservado.
func (h *PresenteHandler) ReservarPresente(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r, "id")
	if err != nil {
		writeError(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req models.ReservarPresenteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Nome == "" {
		writeError(w, "campo 'nome' é obrigatório", http.StatusBadRequest)
		return
	}

	now := time.Now()
	result, err := h.db.Exec(r.Context(), `
		UPDATE presentes
		SET reservado = true, reservado_por = $1, data_reserva = $2
		WHERE id = $3 AND reservado = false
	`, req.Nome, now, id)
	if err != nil {
		writeError(w, "erro ao reservar presente", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		writeError(w, "este presente já foi reservado por outra pessoa", http.StatusConflict)
		return
	}

	writeJSON(w, map[string]string{"status": "ok"}, http.StatusOK)
}

// ── Admin ──────────────────────────────────────────────────────── //

// AdminListPresentes — GET /api/admin/presentes
// Lista todos os presentes com detalhes de quem reservou (admin only).
func (h *PresenteHandler) AdminListPresentes(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(r.Context(), `
		SELECT id, nome, descricao, preco, imagem_url, categoria,
		       reservado, reservado_por, data_reserva
		FROM presentes
		ORDER BY categoria, nome
	`)
	if err != nil {
		writeError(w, "erro ao listar presentes", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	presentes := []models.Presente{}
	for rows.Next() {
		var p models.Presente
		if err := rows.Scan(
			&p.ID, &p.Nome, &p.Descricao, &p.Preco, &p.ImagemURL,
			&p.Categoria, &p.Reservado, &p.ReservadoPor, &p.DataReserva,
		); err != nil {
			continue
		}
		presentes = append(presentes, p)
	}

	writeJSON(w, models.PresenteListResponse{Presentes: presentes}, http.StatusOK)
}

// AdminAddPresente — POST /api/admin/presentes
func (h *PresenteHandler) AdminAddPresente(w http.ResponseWriter, r *http.Request) {
	var req models.AddPresenteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Nome == "" {
		writeError(w, "nome é obrigatório", http.StatusBadRequest)
		return
	}

	if req.Categoria == "" {
		req.Categoria = "Outros"
	}

	var id int
	err := h.db.QueryRow(r.Context(), `
		INSERT INTO presentes (nome, descricao, preco, imagem_url, categoria)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, req.Nome, req.Descricao, req.Preco, req.ImagemURL, req.Categoria).Scan(&id)
	if err != nil {
		writeError(w, "erro ao adicionar presente", http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]int{"id": id}, http.StatusCreated)
}

// AdminUpdatePresente — PUT /api/admin/presentes/{id}
func (h *PresenteHandler) AdminUpdatePresente(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r, "id")
	if err != nil {
		writeError(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var req models.AddPresenteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Nome == "" {
		writeError(w, "nome é obrigatório", http.StatusBadRequest)
		return
	}

	if req.Categoria == "" {
		req.Categoria = "Outros"
	}

	_, err = h.db.Exec(r.Context(), `
		UPDATE presentes
		SET nome = $1, descricao = $2, preco = $3, imagem_url = $4, categoria = $5
		WHERE id = $6
	`, req.Nome, req.Descricao, req.Preco, req.ImagemURL, req.Categoria, id)
	if err != nil {
		writeError(w, "erro ao atualizar presente", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// AdminDeletePresente — DELETE /api/admin/presentes/{id}
func (h *PresenteHandler) AdminDeletePresente(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r, "id")
	if err != nil {
		writeError(w, "ID inválido", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(r.Context(), `DELETE FROM presentes WHERE id = $1`, id)
	if err != nil {
		writeError(w, "erro ao remover presente", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// AdminLiberarReserva — POST /api/admin/presentes/{id}/liberar
// Remove a reserva de um presente (útil em caso de cancelamento).
func (h *PresenteHandler) AdminLiberarReserva(w http.ResponseWriter, r *http.Request) {
	id, err := extractID(r, "id")
	if err != nil {
		writeError(w, "ID inválido", http.StatusBadRequest)
		return
	}

	_, err = h.db.Exec(r.Context(), `
		UPDATE presentes
		SET reservado = false, reservado_por = NULL, data_reserva = NULL
		WHERE id = $1
	`, id)
	if err != nil {
		writeError(w, "erro ao liberar reserva", http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]string{"status": "ok"}, http.StatusOK)
}
