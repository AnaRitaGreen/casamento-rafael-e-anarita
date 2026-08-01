import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('gifts', (table) => {
    table.string('reserved_by_slug').nullable().after('reserved_by');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('gifts', (table) => {
    table.dropColumn('reserved_by_slug');
  });
}

