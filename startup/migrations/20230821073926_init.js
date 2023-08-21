/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.boolean('is_deleted').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table
      .integer('application_id')
      .unsigned()
      .references('id')
      .inTable('applications') // Reference the 'applications' table
      .onDelete('CASCADE') // Delete events if the referenced application is deleted
      .onUpdate('CASCADE'); // Update events if the referenced application's ID changes
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('events');
};
