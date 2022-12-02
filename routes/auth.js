import express from "express";
import bcrypt from "bcrypt";
import * as db from "../db.js";
import jwt from "jsonwebtoken";

const app = express.Router();

app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const hash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await db.User.create({
      username,
      password: hash,
      email,
    });
  } catch (e) {
    return res.status(400).end(e.message);
  }
  console.log("new user registred", user.toJSON());

  res.send("user has been registered");
});

app.post("/login", async (req, res) => {
  let { username, password } = req.body;
  let user;

  if (validateEmail(username)) {
    user = await db.User.findOne({
      where: {
        email: username,
      },
    });
  } else {
    user = await db.User.findOne({
      where: {
        username,
      },
    });
  }

  if (user) {
    const hash = user.password;
    const result = await bcrypt.compare(password, hash);
    if (result) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        "TODOSECRET",
        {
          expiresIn: "20d",
        }
      );
      return res.status(200).send(token);
    } else {
      return res.status(401).send("username or password is wrong");
    }
  } else {
    return res.status(401).send("username or password is wrong");
  }
});

const validateEmail = (email) => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
};

export default app;
