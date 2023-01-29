import express from "express";
import authMid from "../middlewares/auth.js";
import * as db from "../db.js";

const app = express.Router();

app.get("/get_users", authMid("admin"), async (req, res) => {
  const users = await db.User.findAll();

  res.send(users.map((user) => user.toJSON()));
});

app.get("/me", authMid("user"), async (req, res) => {
  const { user } = req;
  res.send(user.toJSON());
});

export default app;
