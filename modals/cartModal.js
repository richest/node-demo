module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define("cart", {
      product_id: {
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      product_price: {
        type: DataTypes.FLOAT,
      },
      total_price: {
        type: DataTypes.FLOAT,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
    });
    return Cart;
  };