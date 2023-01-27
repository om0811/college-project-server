import * as db from "./db.js";
import express from "express";
import auth from "./routes/auth.js";
import attachment from "./routes/attachment.js";
import product from "./routes/product.js";
import order from "./routes/order.js";
import user from "./routes/user.js";
import feedback from "./routes/feedback.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    exposedHeaders: ["auth_token"],
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(auth);
app.use(attachment);
app.use(product);
app.use(order);
app.use(user);
app.use(feedback);

await db.default();

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
