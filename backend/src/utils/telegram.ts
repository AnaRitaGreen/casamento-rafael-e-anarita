import { env } from '@/env'

/**
 * Envia uma mensagem de texto para o chat configurado via Telegram Bot API.
 * Falha silenciosamente para não bloquear a resposta HTTP ao convidado.
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = env.TELEGRAM_BOT_TOKEN
  const chatId = env.TELEGRAM_CHAT_ID

  if (!token || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })
  } catch (err) {
    // Silencioso: notificação não pode derrubar a reserva
    console.warn('[Telegram] Falha ao enviar notificação:', err)
  }
}
