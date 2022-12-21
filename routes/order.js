import express from "express";
import auth from "../middlewares/auth.js";

const app = express.Router();
app.use(auth("user"));

app.post("/add_order", async (req, res) => {
  const orderDetails = req.body;
  const product = await db.Product.create({});
  res.send("product has been added");
});

export default app;
