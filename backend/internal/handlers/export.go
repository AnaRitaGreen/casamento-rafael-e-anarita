package handlers

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ExportHandler gerencia a exportação de dados.
type ExportHandler struct {
	db *pgxpool.Pool
}

func NewExportHandler(db *pgxpool.Pool) *ExportHandler {
	return &ExportHandler{db: db}
}

// ExportCSV — GET /admin/export/csv?status=confirmed|all
// Exporta a lista de convidados em formato CSV.
func (h *ExportHandler) ExportCSV(w http.ResponseWriter, r *http.Request) {
	statusFilter := r.URL.Query().Get("status")

	var query string
	var args []any

	if statusFilter == "confirmed" {
		query = `
			SELECT c.nome_completo, g.nome_grupo,
				CASE WHEN c.confirmado IS TRUE THEN 'Confirmado'
				     WHEN c.confirmado IS FALSE THEN 'Não vai'
				     ELSE 'Pendente' END,
				COALESCE(c.restricao_alimentar, ''),
				CASE WHEN c.eh_crianca THEN 'Sim' ELSE 'Não' END,
				COALESCE(to_char(c.data_confirmacao, 'DD/MM/YYYY HH24:MI'), '')
			FROM convidados c
			LEFT JOIN grupos g ON g.id = c.grupo_id
			WHERE c.confirmado = true
			ORDER BY g.nome_grupo, c.nome_completo
		`
	} else {
		query = `
			SELECT c.nome_completo, g.nome_grupo,
				CASE WHEN c.confirmado IS TRUE THEN 'Confirmado'
				     WHEN c.confirmado IS FALSE THEN 'Não vai'
				     ELSE 'Pendente' END,
				COALESCE(c.restricao_alimentar, ''),
				CASE WHEN c.eh_crianca THEN 'Sim' ELSE 'Não' END,
				COALESCE(to_char(c.data_confirmacao, 'DD/MM/YYYY HH24:MI'), '')
			FROM convidados c
			LEFT JOIN grupos g ON g.id = c.grupo_id
			ORDER BY g.nome_grupo, c.nome_completo
		`
	}

	rows, err := h.db.Query(r.Context(), query, args...)
	if err != nil {
		writeError(w, "erro ao exportar", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	filename := fmt.Sprintf("convidados_%s_%s.csv",
		statusFilter,
		time.Now().Format("2006-01-02"),
	)

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	// BOM UTF-8 para compatibilidade com Excel
	w.Write([]byte("\xEF\xBB\xBF"))

	cw := csv.NewWriter(w)
	_ = cw.Write([]string{
		"Nome Completo", "Grupo", "Status", "Restrição Alimentar", "É Criança?", "Data de Confirmação",
	})

	for rows.Next() {
		var nome, grupo, status, restricao, crianca, data string
		if err := rows.Scan(&nome, &grupo, &status, &restricao, &crianca, &data); err != nil {
			continue
		}
		_ = cw.Write([]string{nome, grupo, status, restricao, crianca, data})
	}

	cw.Flush()
}
