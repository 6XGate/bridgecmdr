exports.up = function (knex) {
    return knex.schema.createTable("store", function (table) {
        table.string("key").primary().notNullable();
        table.string("value").notNullable();
    });

    // TODO: Parse old PiAvSwitchController settings for relevant values.
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("store");
};
