const dotenv = require('dotenv');
const path = require("path");

if (!process.env.MYSQL_HOST){
  dotenv.config({
    path: path.join(__dirname, "..", ".env")
  })
}

module.exports = {
  host: process.env.HOST,
  username: process.env.USER,
  password: process.env.PASS,
  port: process.env.DB_PORT,
  database: process.env.DB,
  dialect: "postgres"
}