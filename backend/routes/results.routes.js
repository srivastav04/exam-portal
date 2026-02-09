import express from "express";
import {
  getResults,
  postResults,
  test,
  createTable,
  getResultbyId,
  deleteResults,
} from "../controllers/results.js";

const router = express.Router();

router.get("/", getResults);
router.get("/:hallTicket", getResultbyId);
router.post("/", postResults);
router.get("/createTable", createTable);
router.get("/test", test);
router.delete("/", deleteResults);

export default router;
