import express from "express";
import * as db from "../db.js";
import authMid from "../middlewares/auth.js";
import multiparty from "multiparty";
import path from "path";

const app = express.Router();

const formMid = (req, res, next) => {
  const form = new multiparty.Form({
    uploadDir: path.join(process.cwd(), "public"),
  });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).send("Error parsing form");
      return;
    }

    req.body = fields;
    req.files = files;

    next();
  });
};

app.post("/add_product", authMid("admin"), formMid, async (req, res) => {
  const thumbnail = path.basename(req.files.thumbnail[0].path);
  let { name, price, description, slug, sale_price, category } = req.body;

  name = name[0];
  price = price[0];
  description = description[0];
  slug = slug[0];
  sale_price = sale_price[0];
  category = category[0];

  const attachments = await Promise.all(
    req.files.attachments.map(async (attachment) => {
      const filename = path.basename(attachment.path);
      const attachmentObj = await db.Attachment.create({
        url: filename,
      });
      return attachmentObj;
    })
  );

  const product = await db.Product.create({
    name,
    price,
    description,
    slug,
    sale_price,
    thumbnail,
  });

  const categoryObj = await db.Category.findOne({
    where: {
      name: category,
    },
  });

  product.setCategory(categoryObj);

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
    thumbnail,
    category,
  } = req.body;

  const product = await db.Product.findByPk(id);

  product.name = name;
  product.price = price;
  product.description = description;
  product.slug = slug;
  product.sale_price = sale_price;
  product.thumbnail = thumbnail;

  const categoryObj = await db.Category.findOne({
    where: {
      name: category,
    },
  });

  const attachments = await Promise.all(
    req.files.attachments.map(async (attachment) => {
      const filename = path.basename(attachment.path);
      const attachmentObj = await db.Attachment.create({
        url: filename,
      });
      return attachmentObj;
    })
  );

  product.setCategory(categoryObj);
  product.setAttachments([]);

  if (attachments.length > 0) product.addAttachments(attachments);

  await product.save();

  res.send("product has been updated");
});

export default app;
