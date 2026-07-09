import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("gifts", (table) => {
    table.dropColumn("reserved_by");
  })
  
  await knex.schema.alterTable("gifts", (table) => {
    table.string("reserved_by").nullable().defaultTo(null);
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("gifts", (table) => {
    table.dropColumn("reserved_by");
  })

  await knex.schema.alterTable("gifts", (table) => {
    table.uuid("reserved_by").references("id").inTable("guests").onDelete("CASCADE").onUpdate("CASCADE");
  })
}

