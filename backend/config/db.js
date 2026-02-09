import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: "postgres",
  password: "admin",
  database: "results",
  host: "postgres",
  port: 5432,
});

pool.on("connect", () => console.log("connected to the database"));
