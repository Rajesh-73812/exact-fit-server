const { Sequelize } = require("sequelize");

require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectModule: require("mysql2"),
    timezone: process.env.TIMEZONE || "+05:30",
    logging: process.env.NODE_ENV === "development" ? false : console.log,
    pool: {
      max: 10, // Maximum number of connection in pool
      min: 0, // Minimum number of connection in pool
      acquire: 30000, // The maximum time, in ms, that pool will try to get a connection before throwing an error
      idle: 10000, // The maximum time, in ms, a connection can be idle in the pool before being released
    },
  }
);

if (process.env.NODE_ENV !== "test") {
  sequelize
    .authenticate()
    .then(() => console.log("MySQL connection established."))
    .catch((err) => {
      console.error("MySQL connection error:", err);
      process.exit(1);
    });
}

module.exports = sequelize;
