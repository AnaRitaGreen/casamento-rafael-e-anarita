import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("groups", (table) => {
    table.boolean("invite_sent").defaultTo(false).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("groups", (table) => {
    table.dropColumn("invite_sent");
  });
}
