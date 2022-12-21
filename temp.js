import * as db from "./db.js";

await db.default();

const orderItems = await db.OrderItem.findAll({ where: { orderId: 1 } });

const productItems = orderItems.map(async (item) => {
  const product = await db.Product.findOne({ where: { id: item.productid } });
  return {
    ...item.toJSON(),
    product: product.toJSON(),
  };
});

const att = await db.Attachment.create({
  name: "image",
});

const att2 = await db.Attachment.create({
  name: "image2",
});

const thumb = await db.Attachment.create({
  name: "thumb",
});

const product = await db.Product.create({
  name: "perter eng",
});
const product2 = await db.Product.create({
  name: "peter eng2",
});

const user = await db.User.create({
  username: "asdf",
  password: "asdf",
});

const order = await db.Order.create({
  total: 100,
});

const orderitem1 = await db.OrderItem.create({
  quantity: 10,
});

const orderitem2 = await db.OrderItem.create({
  quantity: 20,
});

product.addOrderItem(orderitem1);
product2.addOrderItem(orderitem2);
order.addOrderItem(orderitem1);
order.addOrderItem(orderitem2);

user.addOrder(order);

product.setCategory(category);
product2.setCategory(category);
product.setAttachment(thumb);
product.addAttachment(att);
product.addAttachment(att2);
