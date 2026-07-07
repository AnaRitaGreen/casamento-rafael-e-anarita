import type { Knex } from 'knex'
import bcrypt from 'bcryptjs'

export async function seed(knex: Knex): Promise<void> {
  const [hash1, hash2] = await Promise.all([
    bcrypt.hash('12345678', 12),
    bcrypt.hash('12345678', 12),
  ])

  // Garante idempotência: não duplica se já existir
  await knex('admins')
    .insert([
      { username: 'rafael', password_hash: hash1 },
      { username: 'anarita', password_hash: hash2 },
    ])
    .onConflict('username')
    .ignore()
}
