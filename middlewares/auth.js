import jwt from "jsonwebtoken";
import * as db from "../db.js";

async function getUser(token) {
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await db.User.findByPk(id);
  return user;
}

export default (role) => {
  return async (req, res, next) => {
    console.log(req.headers);
    const token = req.headers["auth_token"];
    if (!token) {
      res.status(401).send("Unauthorized");
      return;
    }
    const user = await getUser(token);
    if (user.role === role) {
      req.user = user;
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  };
};
