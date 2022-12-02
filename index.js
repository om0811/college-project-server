import * as db from "./db.js";
import express from "express";
import auth from "./routes/auth.js";

const app = express();
app.use(express.json());
app.use(auth);

(async function () {
  await db.default();
  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
})();
