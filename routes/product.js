import express from "express";
import * as db from "../db.js";
import authMid from "../middlewares/auth.js";
import formidable from "formidable";
import path from "path";
import { literal, Op } from "sequelize";

const app = express.Router();

const formMid = (req, res, next) => {
  const form = formidable({
    multiples: true,
    filename: function (name, filename) {
      return name + filename;
    },
    keepExtensions: true,
    uploadDir: path.join(process.cwd(), "/public"),
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.end(err.message);
      return;
    }
    req.body = fields;
    req.files = files;
    next();
  });
};

app.get("/product/:slug", async (req, res) => {
  const { slug } = req.params;
  const product = await db.Product.findOne({
    attributes: ["id", "name", "price", "description", "thumbnail", "slug"],
    where: isNaN(parseInt(slug)) ? { slug } : { id: slug },
    include: [
      {
        model: db.Category,
        attributes: ["name"],
      },
      {
        model: db.Attachment,
        attributes: ["id", "url"],
      },
    ],
  });

  if (!product) return res.status(404).send("product not found");

  res.send(product);
});

app.get("/products", async (req, res) => {
  const { category, price, search_query } = req.query;

  const products = await db.Product.findAll({
    attributes: ["id", "name", "price", "description", "thumbnail", "slug"],
    where: [
      { price: { [Op.lte]: price ? price : 100000 } },
      search_query
        ? literal(
            `MATCH(Product.name, Product.description) AGAINST('${search_query}')`
          )
        : null,
    ],
    include: [
      {
        model: db.Category,
        attributes: ["name"],
        where: {
          name: category
            ? {
                [Op.eq]: category,
              }
            : {
                [Op.ne]: null,
              },
        },
      },
    ],
  });

  res.send(products);
});

//TODO: add sort products by number of order placed
app.get("/trending_products", async (req, res) => {
  const products = await db.Product.findAll({
    attributes: ["id", "name", "price", "description", "thumbnail", "slug"],

    order: [["id", "DESC"]],
    limit: 4,
  });

  res.send(products);
});

app.post("/add_product", authMid("admin"), formMid, async (req, res) => {
  const { name, price, description, slug, category } = req.body;

  const thumbnail = req.files.thumbnail.originalFilename;
  const product = await db.Product.create({
    name,
    price,
    description,
    slug,
    thumbnail,
  });

  const categoryObj = await db.Category.findOne({
    where: {
      name: category,
    },
  });

  product.setCategory(categoryObj);

  const attachments = await Promise.all(
    req.files.attachments.map(async (attachment) => {
      const filename = attachment.originalFilename;
      const attachmentObj = await db.Attachment.create({
        url: filename,
      });
      return attachmentObj;
    })
  );

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
