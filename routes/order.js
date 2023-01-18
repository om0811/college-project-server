import express from "express";
import * as db from "../db.js";
import authMid from "../middlewares/auth.js";

const app = express.Router();

app.post("/add_order", authMid("user"), async (req, res) => {
  const products = req.body;
  const { user } = req;

  const productsWithDetails = await Promise.all(
    products.map(async (product) => {
      const productDetails = await db.Product.findByPk(product.productid);
      return {
        ...product,
        model: productDetails,
      };
    })
  );

  const total = productsWithDetails.reduce((acc, product) => {
    return acc + product.model.sale_price * product.quantity;
  }, 0);

  const order = await db.Order.create({
    total,
  });

  const orderItems = await Promise.all(
    productsWithDetails.map(async (product) => {
      const orderItem = await db.OrderItem.create({
        quantity: product.quantity,
        size: product.size,
        color: product.color,
      });
      product.model.addOrderItem(orderItem);
      return orderItem;
    })
  );

  order.addOrderItem(orderItems);

  user.addOrder(order);

  res.send("order has been added");
});

app.get("/get_orders", authMid("user"), async (req, res) => {
  const { user } = req;

  const orders = await db.Order.findAll({
    where: {
      userid: user.id,
    },
  });

  const orderItems = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await db.OrderItem.findAll({
        where: {
          orderid: order.id,
        },
      });

      const products = await Promise.all(
        orderItems.map(async (orderItem) => {
          const product = await db.Product.findOne({
            where: {
              id: orderItem.productid,
            },
          });

          return {
            ...orderItem.toJSON(),
            product,
          };
        })
      );

      return {
        ...order.toJSON(),
        products,
      };
    })
  );

  res.send(orderItems);
});

export default app;
