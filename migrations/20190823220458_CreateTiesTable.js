/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019 Matthew Holder

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**
 * @param {Knex} knex
 *
 * @returns {Knex.SchemaBuilder}
 */
exports.up = function (knex) {
    return knex.schema.createTable("ties", function (table) {
        table.uuid("guid").notNullable().primary();
        table.uuid("source_guid").notNullable();
        table.uuid("switch_guid").notNullable();
        table.integer("input_channel").notNullable();
        table.integer("video_output_channel");
        table.integer("audio_output_channel");

        table.unique([ "source_guid", "switch_guid" ]);
    });

    // TODO: Parse old PiAvSwitchController settings for relevant values.
};

/**
 * @param {Knex} knex
 *
 * @returns {Knex.SchemaBuilder}
 */
exports.down = function (knex) {
    return knex.schema.dropTable("ties");
};
