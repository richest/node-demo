const dbConfig = require('../config')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./userModal")(sequelize, Sequelize);
db.category = require("./categoryModal")(sequelize, Sequelize);
db.product = require("./productsModal")(sequelize, Sequelize);
db.cart = require("./cartModal")(sequelize, Sequelize);
db.order = require("./ordersModal")(sequelize, Sequelize);
db.address = require("./addressModal")(sequelize, Sequelize);
db.rating = require("./ratingModal")(sequelize, Sequelize);
db.userStrip = require("./stripDetails")(sequelize, Sequelize);
db.product.belongsTo(db.category, { foreignKey: "category_id" })
db.userStrip.belongsTo(db.user, { foreignKey: "userId" })



module.exports = db;