import * as db from "./db.js";
import bcrypt from "bcrypt";
import fs from "fs";

const products = JSON.parse(fs.readFileSync("./soul.json", "utf8").toString());

await db.default(true);

await db.User.create({
  username: "admin",
  password: bcrypt.hashSync("admin", 10),
  email: "",
  role: "admin",
});

await db.User.create({
  username: "harsh",
  password: bcrypt.hashSync("123456", 10),
  email: "harsh@gmail.com",
  role: "user",
});

await db.Category.create({
  name: "men",
});

await db.Category.create({
  name: "women",
});

await Promise.all(
  products.map(async (product) => {
    const attachments = await Promise.all(
      product.attachments.map(async (attachment) => {
        const attachmentObj = await db.Attachment.create({
          url: attachment.url,
        });
        return attachmentObj;
      })
    );

    const productObj = await db.Product.create({
      name: product.name,
      slug: product.slug,
      price: product.price,
      description: product.description,
      thumbnail: product.thumbnail,
    });

    const categoryObj = await db.Category.findOne({
      where: {
        name: product.category,
      },
    });

    productObj.setCategory(categoryObj);

    productObj.addAttachment(attachments);
  })
);
