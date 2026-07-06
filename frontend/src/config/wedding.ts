/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          CONFIGURAÇÕES DO CASAMENTO — EDITE AQUI!           ║
 * ║  Este arquivo centraliza todas as informações do evento.    ║
 * ║  Altere os valores abaixo e o site inteiro será atualizado. ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const wedding = {

  // ── Noivos ─────────────────────────────────────────────────── //
  noivo: "Rafael",
  noiva: "Ana Rita",

  // ── Datas ──────────────────────────────────────────────────── //
  /** Data e hora da cerimônia (ISO 8601). Usado no contador regressivo. */
  dataCerimonia: "2026-11-21T17:00:00",

  /** Data limite para confirmar presença (exibida no site). */
  dataLimiteRsvp: "2026-10-31T23:59:59",

  // ── Cerimônia ──────────────────────────────────────────────── //
  cerimonia: {
    nome: "Paróquia São Sebastião",
    cidade: "Novo Horizonte, SP",
    horario: "17:00",
    mapsUrl: "https://maps.app.goo.gl/bhoaDV9iaX84xqWP6",
  },

  // ── Recepção ───────────────────────────────────────────────── //
  recepcao: {
    nome: "Horizonte Eventos",
    cidade: "Novo Horizonte, SP",
    horario: "19:00",
    mapsUrl: "https://maps.app.goo.gl/zvYadvVjMkwkG5Ka7",
  },

  // ── Dress Code ─────────────────────────────────────────────── //
  // dressCode: {
  //   estilo:      "Black Tie Opcional",
  //   dica:        "Tons de lavanda e azul são bem-vindos! ✨",
  //   restricao:   "Evite branco e preto total.",
  // },

  // ── Textos da Página ───────────────────────────────────────── //
  seo: {
    title: "Casamento de Rafael & Ana Rita",
    description: "Celebre conosco o nosso grande dia! Confirme sua presença e fique por dentro de todos os detalhes do casamento de Rafael e Ana Rita.",
  },

  frase_rodape: "\"E não há em mim outro amor — você é sempre o meu mais.\"",

  // ── PIX (Lista de Presentes) ───────────────────────────────── //
  pix: {
    /** Chave PIX (CPF, e-mail, telefone ou chave aleatória) */
    chave: "00000000000",       // ← Coloque sua chave PIX real aqui
    /** Nome exibido na tela de pagamento */
    titular: "Rafael Santos",   // ← Coloque o nome real do titular
  },

} as const;

// ── Helpers ────────────────────────────────────────────────────── //

/** Retorna "Rafael & Ana Rita" */
export const nomesCasal = `${wedding.noivo} & ${wedding.noiva}`;

/** Retorna a data formatada em pt-BR: "21 de novembro de 2026" */
export const dataCerimoniaFormatada = new Date(wedding.dataCerimonia)
  .toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

/** Retorna a data de limite de RSVP formatada em pt-BR: "31 de Outubro de 2026" */
export const dataLimiteRsvpFormatada = new Date(wedding.dataLimiteRsvp)
  .toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }); 
