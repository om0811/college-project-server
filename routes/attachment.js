import express from "express";
import * as db from "../db.js";
import bodyParser from "body-parser";
import uniqueFilename from "unique-filename";
import fs from "fs/promises";
import mime from "mime-types";
import auth from "../middlewares/auth.js";

const app = express.Router();
app.use(bodyParser.raw({ type: "image/*", limit: "2mb" }));
app.use(auth("admin"));

app.post("/add_attachment", async (req, res) => {
  if (req.is("image/*")) {
    const image = req.body;
    const ext = mime.extension(req.headers["content-type"]);
    const filename = uniqueFilename("", "attachment") + "." + ext;
    await fs.writeFile(
      "public/" + filename,
      image.toString("base64"),
      "base64"
    );
    await db.Attachment.create({ name: filename });
    res.send("attachment has been added " + filename);
  } else {
    res.status(400).send("Invalid file type");
  }
});

export default app;
