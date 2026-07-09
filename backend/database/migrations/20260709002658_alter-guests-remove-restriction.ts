import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('guests', (table) => {
    table.dropColumn('restriction');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('guests', (table) => {
    table.string('restriction');
  });
}

