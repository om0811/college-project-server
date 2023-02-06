import express from "express";
import authMid from "../middlewares/auth.js";
import * as db from "../db.js";

const app = express.Router();

app.get("/get_users", authMid("admin"), async (req, res) => {
  const users = await db.User.findAll({
    attributes: ["id", "username", "email", "role", "isBlocked"],
  });

  res.send(users.map((user) => user.toJSON()));
});

app.post("/block_unblock_user", authMid("admin"), async (req, res) => {
  const { id, isBlocked } = req.body;
  const user = await db.User.findOne({
    where: {
      id,
    },
  });

  if (!user) return res.status(404).send("Not found");
  if (user.role === "admin") return res.status(400).send("Can't block admin");
  user.isBlocked = isBlocked;
  await user.save();
  res.send(user.toJSON());
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
    userInfo.cardnumber = cardnumber;
    userInfo.expirydate = expirydate;
    userInfo.cvv = cvv;
    userInfo.address = address;
    userInfo.city = city;
    userInfo.state = state;
    userInfo.postalcode = postalcode;

    await userInfo.save();
    res.send(userInfo.toJSON());
  } else {
    const userInfo = await db.UserInfo.create({
      name,
      address,
      phone,
      cardnumber,
      expirydate,
      cvv,
      address,
      city,
      state,
      postalcode,
    });
    await user.setUserInfo(userInfo);
    res.send(userInfo.toJSON());
  }
});

app.get("/get_user_info", authMid("user"), async (req, res) => {
  const { user } = req;

  const userInfo = await db.UserInfo.findOne({
    where: {
      userid: user.id,
    },
    attributes: {
      exclude: ["userid", "id"],
    },
  });

  if (!userInfo) return res.status(404).send("Not found");

  res.send(userInfo.toJSON());
});

export default app;
