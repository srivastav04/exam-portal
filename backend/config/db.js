import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  user: "postgres",
  password: /*Your Password*/,
  database: /*Your Database */,
  host: "postgres",
  port: 5432,
});

pool.on("connect", () => console.log("connected to the database"));
