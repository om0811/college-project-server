import express from "express";
import authMid from "../middlewares/auth.js";
import * as db from "../db.js";
import fs from "fs";
import { join } from "path";
const app = express.Router();

app.get("/stats", authMid("admin"), async (req, res) => {
  const stats = {};
  const totalSales = await db.Order.sum("total");
  const totalOrders = await db.Order.count();
  const totalProducts = await db.Product.count();
  const totalUsers = await db.User.count();

  stats["Total Sales"] = "₹ " + totalSales;
  stats["Total Orders"] = totalOrders;
  stats["Total Products"] = totalProducts;
  stats["Total Users"] = totalUsers - 1;
  stats["Total Visitors"] = JSON.parse(
    fs.readFileSync(join(process.cwd(), "visit.json"), "utf-8")
  ).count;
  stats["Total Feedbacks"] = await db.Feedback.count();

  res.json(stats);
});

export default app;
