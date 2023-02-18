import jwt from "jsonwebtoken";
import * as db from "../db.js";

async function getUser(token) {
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.User.findByPk(id);
    return user;
  } catch (err) {
    return null;
  }
}

export default (role) => {
  return async (req, res, next) => {
    const token = req.headers["auth_token"];
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const user = await getUser(token);
    if (user && user.role === role) {
      req.user = user;
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  };
};
