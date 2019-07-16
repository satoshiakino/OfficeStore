var options = {};
var pgp = require("pg-promise")(options);
var connection = {
    user: 'postgres',
    host: 'localhost',
    database: 'officestore',
    password: 'morinokumasan',
    port: 5432
};
var pg_connection = pgp(connection);
module.exports = pg_connection;