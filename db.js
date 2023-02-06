import { Sequelize, DataTypes } from "sequelize";
import * as dotenv from "dotenv";
dotenv.config();

const { DB, UNAME, PASS } = process.env;

const sequelize = new Sequelize(DB, UNAME, PASS, {
  host: "localhost",
  dialect: "mysql",
  sync: true,
  logging: false,
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
});

const Attachment = sequelize.define(
  "Attachment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
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
  description: {
    type: DataTypes.TEXT,
  },
  thumbnail: {
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
  size: {
    type: DataTypes.STRING,
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

  status: {
    type: DataTypes.STRING,
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
  role: {
    type: DataTypes.STRING,
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const UserInfo = sequelize.define("UserInfo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  postalcode: {
    type: DataTypes.STRING,
  },
  cardnumber: {
    type: DataTypes.STRING,
  },
  expirydate: {
    type: DataTypes.DATEONLY,
  },
  cvv: {
    type: DataTypes.STRING,
  },
});

const Feedback = sequelize.define("Feedback", {
  feedback: {
    type: DataTypes.STRING,
  },
});

// Relationships

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
User.hasMany(Feedback, {
  foreignKey: "userid",
});
User.hasOne(UserInfo, {
  foreignKey: "userid",
});

export default async function init(sync) {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    if (sync) {
      await sequelize.sync({
        force: true,
      });
      await sequelize.query(
        `CREATE FULLTEXT INDEX namedesc ON Products(name,description)`
      );
      console.log("All models were synchronized successfully.");
    }
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
  Feedback,
  UserInfo,
};
