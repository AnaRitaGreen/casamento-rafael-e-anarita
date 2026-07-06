package models

import "time"

// Group representa um grupo familiar no banco de dados.
type Group struct {
	ID        int    `json:"id"`
	NomeGrupo string `json:"nome_grupo"`
}

// Guest representa um convidado no banco de dados.
type Guest struct {
	ID                int        `json:"id"`
	GrupoID           *int       `json:"grupo_id"`
	NomeGrupo         string     `json:"nome_grupo,omitempty"`
	NomeCompleto      string     `json:"nome_completo"`
	Confirmado        *bool      `json:"confirmado"`      // nil = pendente
	DataConfirmacao   *time.Time `json:"data_confirmacao,omitempty"`
	RestricaoAlimentar string    `json:"restricao_alimentar"`
	EhCrianca         bool       `json:"eh_crianca"`
}

// GuestSearchResult é o retorno da busca pública por nome.
type GuestSearchResult struct {
	GrupoID   int            `json:"grupo_id"`
	NomeGrupo string         `json:"nome_grupo"`
	Members   []GuestMember  `json:"members"`
}

// GuestMember é um membro de grupo simplificado para o formulário RSVP.
type GuestMember struct {
	ID           int    `json:"id"`
	NomeCompleto string `json:"nome_completo"`
	EhCrianca    bool   `json:"eh_crianca"`
}

// RSVPRequest é o corpo da requisição de confirmação de presença.
type RSVPRequest struct {
	GrupoID           int    `json:"grupo_id"`
	Confirmados       []int  `json:"confirmados"`       // IDs dos convidados que vão
	Recusado          bool   `json:"recusado"`          // true = grupo inteiro recusou
	RestricaoAlimentar string `json:"restricao_alimentar"`
	Mensagem          string `json:"mensagem"`
}

// AddGuestRequest é o corpo para adicionar/editar um convidado.
type AddGuestRequest struct {
	NomeCompleto       string  `json:"nome_completo"`
	GrupoID            *int    `json:"grupo_id"`
	NomeGrupoNovo      string  `json:"nome_grupo_novo"` // cria novo grupo se preenchido
	RestricaoAlimentar string  `json:"restricao_alimentar"`
	EhCrianca          bool    `json:"eh_crianca"`
}

// LoginRequest é o corpo da requisição de login admin.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Message representa uma mensagem deixada por um convidado no RSVP.
type Message struct {
	ID       int       `json:"id"`
	GrupoID  int       `json:"grupo_id"`
	Nome     string    `json:"nome"`
	Mensagem string    `json:"mensagem"`
	Data     time.Time `json:"data"`
}

// GuestListResponse é a resposta paginada da listagem de convidados.
type GuestListResponse struct {
	Guests  []Guest `json:"guests"`
	Total   int     `json:"total"`
	Page    int     `json:"page"`
	PerPage int     `json:"per_page"`
}

// MessageListResponse é a resposta da listagem de mensagens.
type MessageListResponse struct {
	Messages []Message `json:"messages"`
}

// GroupListResponse é a resposta da listagem de grupos.
type GroupListResponse struct {
	Groups []Group `json:"groups"`
}

// ErrorResponse é a estrutura padrão de erro da API.
type ErrorResponse struct {
	Error string `json:"error"`
}

// ── Presentes ─────────────────────────────────────────────────── //

// Presente representa um item da lista de casamento.
type Presente struct {
	ID          int        `json:"id"`
	Nome        string     `json:"nome"`
	Descricao   string     `json:"descricao"`
	Preco       float64    `json:"preco"`
	ImagemURL   string     `json:"imagem_url"`
	Categoria   string     `json:"categoria"`
	Reservado   bool       `json:"reservado"`
	ReservadoPor *string   `json:"reservado_por,omitempty"` // só visível no admin
	DataReserva  *time.Time `json:"data_reserva,omitempty"`
}

// PresenteListResponse é a resposta da listagem de presentes.
type PresenteListResponse struct {
	Presentes []Presente `json:"presentes"`
}

// ReservarPresenteRequest é o corpo da requisição de reserva de presente.
type ReservarPresenteRequest struct {
	Nome string `json:"nome"` // nome de quem presenteia
}

// AddPresenteRequest é o corpo para criar/editar um presente.
type AddPresenteRequest struct {
	Nome      string  `json:"nome"`
	Descricao string  `json:"descricao"`
	Preco     float64 `json:"preco"`
	ImagemURL string  `json:"imagem_url"`
	Categoria string  `json:"categoria"`
}
