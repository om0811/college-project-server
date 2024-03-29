import express from "express";
import bcrypt from "bcrypt";
import * as db from "../db.js";
import jwt from "jsonwebtoken";
import queryString from "query-string";

const app = express.Router();

app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const hash = await bcrypt.hash(password, 10);
  let user;

  const userExists = await db.User.findOne({
    where: {
      username,
    },
  });

  const emailExists = await db.User.findOne({
    where: {
      email,
    },
  });

  if (userExists) return res.status(400).send("username already exists");

  if (emailExists) return res.status(400).send("email already exists");

  try {
    user = await db.User.create({
      username,
      password: hash,
      email,
      role: "user",
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
    if (user.isBlocked) return res.status(401).send("user is blocked");

    const hash = user.password;
    const result = await bcrypt.compare(password, hash);
    if (result) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "5d",
        }
      );
      return res.setHeader("auth_token", token).end();
    } else {
      return res.status(401).send("username or password is wrong");
    }
  } else {
    return res.status(401).send("username or password is wrong");
  }
});

app.post("/forgot_password", async (req, res) => {
  const { email } = req.body;
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).send("User not found");
  }
  const token = await db.Token.create();
  await user.addToken(token);
  const json = token.toJSON();
  console.log(
    "Forgot password link generated",
    "http://localhost:5173/resetpassword?" +
      queryString.stringify({ token: json.token, userid: user.id })
  );
  //TODO: send mail with token and userid
  res.status(200).json({ message: "Email sent" });
});

app.post("/reset_password", async (req, res) => {
  const { password, token, userid } = req.body;
  const tokenObj = await db.Token.findOne({
    where: {
      token,
      userid,
    },
  });

  if (!tokenObj) {
    return res.status(400).send("Invalid token");
  }

  if (tokenObj.expire.getTime() < Date.now()) {
    await tokenObj.destroy();
    return res.status(400).send("Token expired");
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await db.User.findByPk(userid);

  user.set("password", hash);

  await user.save();

  await tokenObj.destroy();

  res.send("password updated!");
});

const validateEmail = (email) => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
};

export default app;
