import express from "express";
import cors from "cors";
import router from "./routes/results.routes.js";
import client from "./config/redis.js";


const app = express();

try {
  await client.connect();
} catch (err) {
  console.log(err);
}

app.use(express.json());
app.use(cors());
app.use(router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
