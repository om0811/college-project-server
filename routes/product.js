import express from "express";
import * as db from "../db.js";
import authMid from "../middlewares/auth.js";

const app = express.Router();

app.post("/add_product", authMid("admin"), async (req, res) => {
  const {
    name,
    price,
    description,
    slug,
    sale_price,
    thumbid,
    categoryid,
    attachmentids,
  } = req.body;

  const product = await db.Product.create({
    name,
    price,
    description,
    slug,
    sale_price,
  });

  const category = await db.Category.findByPk(categoryid);
  const thumb = await db.Attachment.findByPk(thumbid);
  const attachments = await db.Attachment.findAll({
    where: {
      id: attachmentids,
    },
  });

  product.setCategory(category);
  product.setAttachment(thumb);

  if (attachments.length > 0) product.addAttachment(attachments);

  res.send("product has been added");
});

app.post("/delete_product", authMid("admin"), async (req, res) => {
  const { id } = req.body;
  const product = await db.Product.findByPk(id);
  await product.destroy();
  res.send("product has been deleted");
});

app.post("/update_product", authMid("admin"), async (req, res) => {
  const {
    id,
    name,
    price,
    description,
    slug,
    sale_price,
    thumbid,
    categoryid,
    attachmentids,
  } = req.body;

  const product = await db.Product.findByPk(id);

  product.name = name;
  product.price = price;
  product.description = description;
  product.slug = slug;
  product.sale_price = sale_price;

  const category = await db.Category.findByPk(categoryid);
  const thumb = await db.Attachment.findByPk(thumbid);
  const attachments = await db.Attachment.findAll({
    where: {
      id: attachmentids,
    },
  });

  product.setCategory(category);
  product.setAttachment(thumb);

  if (attachments.length > 0) product.addAttachment(attachments);

  await product.save();

  res.send("product has been updated");
});

export default app;
