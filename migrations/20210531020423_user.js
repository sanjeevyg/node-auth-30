
exports.up = async knex => {
  await knex.schema.createTable('users', (table) => {
      table.increments()
      table.string('username')
      table.string('password_hash')
  })
};

exports.down = async knex => {
  await knex.schema.dropTableIfExists('users')
};
