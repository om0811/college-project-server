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

  const total =
    productsWithDetails.reduce((acc, product) => {
      return acc + product.model.price * product.quantity;
    }, 0) + 70;

  const order = await db.Order.create({
    total,
    status: "Placed",
  });

  const orderItems = await Promise.all(
    productsWithDetails.map(async (product) => {
      const orderItem = await db.OrderItem.create({
        quantity: product.quantity,
        size: product.size,
      });
      product.model.addOrderItem(orderItem);
      return orderItem;
    })
  );

  order.addOrderItem(orderItems);

  user.addOrder(order);

  res.json({
    id: order.id,
    message: "order has been placed",
  });
});

app.delete("/cancel_order/", authMid("user"), async (req, res) => {
  const { id } = req.body;
  const { user } = req;
  const order = await db.Order.findByPk(id);

  if (!order) {
    res.status(400).send("order not found");
    return;
  }

  if (order.userid !== user.id) {
    res.status(400).send("you are not allowed to cancel this order");
    return;
  }

  if (order.status === "cancelled") {
    res.status(400).send("order has already been cancelled");
    return;
  }

  order.set("status", "cancelled");
  await order.save();
  res.json({ message: "order has been cancelled" });
});

app.get("/get_orders", authMid("user"), async (req, res) => {
  const { user } = req;

  const orders = await db.Order.findAll({
    where: {
      userid: user.id,
    },
    attributes: ["id", "total", "status", "createdAt"],
  });

  const orderItems = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await db.OrderItem.findAll({
        where: {
          orderid: order.id,
        },
        attributes: ["id", "quantity", "size", "productid"],
      });

      const products = await Promise.all(
        orderItems.map(async (orderItem) => {
          const product = await db.Product.findOne({
            where: {
              id: orderItem.productid,
            },
            attributes: ["id", "name", "price", "thumbnail", "slug"],
          });

          return {
            ...orderItem.toJSON(),
            ...product.toJSON(),
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

app.get("/get_all_orders", authMid("admin"), async (req, res) => {
  const orders = await db.Order.findAll({});

  const orderWithUser = await Promise.all(
    orders.map(async (order) => {
      const user = await db.User.findOne({
        where: {
          id: order.userid,
        },
        attributes: ["username"],
      });

      return {
        ...order.toJSON(),
        user,
      };
    })
  );

  res.send(orderWithUser);
});

app.get("/get_order_items/:id", authMid("admin"), async (req, res) => {
  const { id } = req.params;
  const order = await db.Order.findByPk(id);

  if (!order) {
    res.status(400).send("order not found");
    return;
  }

  const orderItems = await db.OrderItem.findAll({
    where: {
      orderid: order.id,
    },
    attributes: ["id", "quantity", "size", "productid"],
  });

  const products = await Promise.all(
    orderItems.map(async (orderItem) => {
      const product = await db.Product.findOne({
        where: {
          id: orderItem.productid,
        },
        attributes: ["id", "name", "price", "thumbnail", "slug"],
      });

      return {
        ...orderItem.toJSON(),
        ...product.toJSON(),
      };
    })
  );

  res.json(products);
});

export default app;
