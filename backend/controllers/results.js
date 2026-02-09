import { pool } from "../config/db.js";
import client from "../config/redis.js";
import os from "os";

export const getResults = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM results "); // Without redis

    // const cacheKey = "results";
    // const data = await client.get(cacheKey);
    // if (data) {
    //   console.log("In cache data");
    //   return res.status(200).json(JSON.parse(data));
    // }
    //await client.setEx(cacheKey, 60, JSON.stringify(response.rows));
    // console.log("Set in Redis");

    res.status(200).json(response.rows);
  } catch (err) {
    console.log("ERROR while getting results", err);
    res.status(500).send({
      message: `ERROR while getting results:${err}`,
    });
  }
};
export const getResultbyId = async (req, res) => {
  try {
    const hallTicket = req.params.hallTicket;

    const data = await client.get(hallTicket);
    if (data) {
      console.log("In cache data");
      return res.status(200).json(JSON.parse(data));
    }
    const response = await pool.query(
      `SELECT * FROM results WHERE hallTicket = $1`,
      [hallTicket],
    );

    res.status(200).json(response.rows);
  } catch (err) {
    console.log("ERROR while getting results", err);
    res.status(500).send({
      message: `ERROR while getting results:${err}`,
    });
  }
};

export const postResults = async (req, res) => {
  try {
    const { name, hallTicket, marks } = req.body;
    await pool.query(
      "INSERT INTO results(name,hallTicket,marks) VALUES ($1,$2,$3) RETURNING *",
      [name, hallTicket, marks],
    );
    const data = {
      name,
      hallTicket,
      marks,
    };
    await client.set(JSON.stringify(hallTicket), JSON.stringify(data));
    res.json({
      message: "Successfully Inserted",
    });
  } catch (err) {
    console.log("ERROR while posting results", err);
  }
};

export const test = (req, res) => {
  res.json({
    container: os.hostname(),
    pid: process.pid,
  });
};

export const createTable = async (req, res) => {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS results (id SERIAL PRIMARY KEY,hallTicket VARCHAR(20) UNIQUE NOT NULL,name VARCHAR(50) NOT NULL,marks JSONB NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    );

    res.json({
      message: "table created successfully",
    });
  } catch (err) {
    console.log("ERROR while creating table", err);
  }
};

export const deleteResults = async (req, res) => {
  const { hallTicket } = req.body;
  try {
    await pool.query(`DELETE FROM results WHERE hallTicket = $1`, [hallTicket]);

    res.json({
      message: "Successfully deleted",
    });
  } catch (err) {
    console.log("ERROR while deleting results", err);
  }
};
