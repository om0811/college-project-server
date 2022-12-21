import * as db from "./db.js";
import bcrypt from "bcrypt";

await db.default(true);

const admin = await db.User.create({
  username: "admin",
  password: bcrypt.hashSync("admin", 10),
  email: "",
  role: "admin",
});

const menCat = await db.Category.create({
  name: "men",
});

const womenCat = await db.Category.create({
  name: "women",
});
