var db_name = process.env.DB_NAME ? process.env.DB_NAME : 'officestore';
console.log(db_name);
var options = {};
var pgp = require("pg-promise")(options);
var connection = {
    user: 'postgres',
    host: 'localhost',
    database: db_name,
    password: "morinokumasan",
    port: 5432
};
var pg_connection = pgp(connection);
module.exports = pg_connection;