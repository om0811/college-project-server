import * as db from "./db.js";
import express from "express";
import auth from "./routes/auth.js";
import product from "./routes/product.js";
import order from "./routes/order.js";
import user from "./routes/user.js";
import feedback from "./routes/feedback.js";
import stats from "./routes/stats.js";
import cors from "cors";
import fs from "fs";
const app = express();

app.use(
  cors({
    exposedHeaders: ["auth_token"],
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(auth);
app.use(product);
app.use(order);
app.use(user);
app.use(feedback);
app.use(stats);

app.get("/visit", async (req, res) => {
  const visit = JSON.parse(fs.readFileSync("visit.json", "utf-8"));
  visit.count++;
  fs.writeFileSync("visit.json", JSON.stringify(visit));
  res.send({ message: "success", visit });
});

await db.default();

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
