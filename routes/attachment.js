import express from "express";
import * as db from "../db.js";
import bodyParser from "body-parser";
import uniqueFilename from "unique-filename";
import fs from "fs/promises";
import mime from "mime-types";
import authMid from "../middlewares/auth.js";

const app = express.Router();
app.use(bodyParser.raw({ type: "image/*", limit: "2mb" }));

app.post("/add_attachment", authMid("admin"), async (req, res) => {
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

app.delete("/delete_attachment/:id", authMid("admin"), async (req, res) => {
  const { id } = req.params;
  const attachment = await db.Attachment.findByPk(id);
  await attachment.destroy();
  res.send("attachment has been deleted");
});

app.get("/get_attachments", authMid("admin"), async (req, res) => {
  const attachments = await db.Attachment.findAll({
    attributes: ["id", "name"],
  });
  const attachmentsWithUrl = attachments.map((attachment) => {
    return {
      id: attachment.id,
      name: attachment.name,
      url: "http://localhost:3000/" + attachment.name,
    };
  });
  res.send(attachmentsWithUrl);
});

export default app;
