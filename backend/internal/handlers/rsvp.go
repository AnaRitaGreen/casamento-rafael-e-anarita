package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"casamento/backend/internal/models"
)

// RSVPHandler gerencia a confirmação de presença.
type RSVPHandler struct {
	db *pgxpool.Pool
}

func NewRSVPHandler(db *pgxpool.Pool) *RSVPHandler {
	return &RSVPHandler{db: db}
}

// SubmitRSVP — POST /rsvp
// Rota pública: recebe a confirmação de presença do convidado.
func (h *RSVPHandler) SubmitRSVP(w http.ResponseWriter, r *http.Request) {
	var req models.RSVPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	if req.GrupoID == 0 {
		writeError(w, "grupo_id é obrigatório", http.StatusBadRequest)
		return
	}

	now := time.Now()

	// Busca o grupo para registrar o nome na mensagem
	var nomeGrupo string
	_ = h.db.QueryRow(r.Context(),
		`SELECT nome_grupo FROM grupos WHERE id = $1`, req.GrupoID,
	).Scan(&nomeGrupo)

	// ── Atualiza status dos membros ────────────────────────────── //
	if req.Recusado {
		// Grupo inteiro recusou — marca todos como FALSE
		_, err := h.db.Exec(r.Context(), `
			UPDATE convidados
			SET confirmado = false, data_confirmacao = $1
			WHERE grupo_id = $2
		`, now, req.GrupoID)
		if err != nil {
			writeError(w, "erro ao registrar recusa", http.StatusInternalServerError)
			return
		}
	} else {
		// Primeiro, marca todos do grupo como recusado (quem não marcou o checkbox)
		_, err := h.db.Exec(r.Context(), `
			UPDATE convidados
			SET confirmado = false, data_confirmacao = $1
			WHERE grupo_id = $2
		`, now, req.GrupoID)
		if err != nil {
			writeError(w, "erro ao processar confirmação", http.StatusInternalServerError)
			return
		}

		// Depois, marca como confirmado apenas quem foi selecionado
		if len(req.Confirmados) > 0 {
			for _, memberID := range req.Confirmados {
				// Atualiza a restrição alimentar apenas nos confirmados
				_, err = h.db.Exec(r.Context(), `
					UPDATE convidados
					SET confirmado = true, data_confirmacao = $1, restricao_alimentar = $2
					WHERE id = $3 AND grupo_id = $4
				`, now, req.RestricaoAlimentar, memberID, req.GrupoID)
				if err != nil {
					writeError(w, "erro ao confirmar presença", http.StatusInternalServerError)
					return
				}
			}
		}
	}

	// ── Salva mensagem (se houver) ─────────────────────────────── //
	if req.Mensagem != "" && nomeGrupo != "" {
		_, _ = h.db.Exec(r.Context(), `
			INSERT INTO mensagens (grupo_id, nome, mensagem)
			VALUES ($1, $2, $3)
		`, req.GrupoID, nomeGrupo, req.Mensagem)
	}

	writeJSON(w, map[string]string{"status": "ok"}, http.StatusOK)
}
