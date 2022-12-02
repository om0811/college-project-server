import { Sequelize, DataTypes } from "sequelize";
import * as dotenv from "dotenv";
dotenv.config();

const { DB, UNAME, PASS } = process.env;

const sequelize = new Sequelize(DB, UNAME, PASS, {
  host: "localhost",
  dialect: "mysql",
  sync: true,
  // logging: false,
  timezone: "+05:30",
});

//Models
const Token = sequelize.define("Token", {
  token: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  expire: {
    type: DataTypes.DATE,
    defaultValue: new Date(Date.now() + 5 * 60000),
  },
});

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  slug: {
    type: DataTypes.STRING,
  },
  details: {
    type: DataTypes.STRING,
  },
  productCount: {
    type: DataTypes.INTEGER,
  },
});

const Attachment = sequelize.define(
  "Attachment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
    original: {
      type: DataTypes.STRING,
    },
  },
  {}
);

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  slug: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.INTEGER,
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
  sale_price: {
    type: DataTypes.INTEGER,
  },
  description: {
    type: DataTypes.STRING,
  },
});

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  quantity: {
    type: DataTypes.INTEGER,
  },
});

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  total: {
    type: DataTypes.INTEGER,
  },
  tracking_number: {
    type: DataTypes.STRING,
  },
  shipping_fee: {
    type: DataTypes.INTEGER,
  },
});

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
});

// Relationships
Category.belongsTo(Attachment, {
  foreignKey: "image",
});
Product.belongsTo(Attachment, {
  foreignKey: "image",
});
Product.belongsTo(Category, {
  foreignKey: "categoryid",
});
Product.hasMany(Attachment, {
  foreignKey: "productid",
});
Order.hasMany(OrderItem, {
  foreignKey: "orderid",
});
User.hasMany(Order, {
  foreignKey: "userid",
});
Product.hasMany(OrderItem, {
  foreignKey: "productid",
});
User.hasMany(Token, {
  foreignKey: "userid",
});

export default async function init() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync();
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

export {
  sequelize,
  Attachment,
  Category,
  OrderItem,
  Product,
  User,
  Order,
  Token,
};
