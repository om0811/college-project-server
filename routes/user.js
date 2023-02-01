import express from "express";
import authMid from "../middlewares/auth.js";
import * as db from "../db.js";

const app = express.Router();

app.get("/get_users", authMid("admin"), async (req, res) => {
  const users = await db.User.findAll();

  res.send(users.map((user) => user.toJSON()));
});

app.get("/is_user_info_filled", authMid("user"), async (req, res) => {
  const { user } = req;
  const userInfo = await db.UserInfo.findOne({
    where: {
      userid: user.id,
    },
  });
  if (userInfo) {
    res.send(userInfo.toJSON());
  } else {
    res.status(404).send("Not found");
  }
});

app.post("/update_user_info", authMid("user"), async (req, res) => {
  const { user } = req;
  const {
    email,
    name,
    phone,
    cardnumber,
    expirydate,
    cvv,
    address,
    city,
    state,
    postalcode,
  } = req.body;

  const userInfo = await db.UserInfo.findOne({
    where: {
      userid: user.id,
    },
  });
  if (userInfo) {
    userInfo.name = name;
    userInfo.address = address;
    userInfo.phone = phone;
    await userInfo.save();
    res.send(userInfo.toJSON());
  } else {
    const userInfo = await db.UserInfo.create({
      name,
      address,
      phone,
    });
    await user.setUserInfo(userInfo);
    res.send(userInfo.toJSON());
  }
});

app.get("/me", authMid("user"), async (req, res) => {
  const { user } = req;
  res.send(user.toJSON());
});

export default app;
