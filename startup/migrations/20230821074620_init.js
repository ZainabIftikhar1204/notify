/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.boolean('is_deleted').defaultTo(false);
    table
      .integer('event_id')
      .unsigned()
      .references('id')
      .inTable('events') // Reference the 'events' table
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('templatebody').notNullable();
    table.boolean('is_active').defaultTo(false);
    table.jsonb('tags');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // return knex.schema.dropTable('notifications');
  return knex.schema
    .alterTable('notifications', (table) => {
      table.dropForeign('event_id');
    })
    .dropTable('notifications');
};
