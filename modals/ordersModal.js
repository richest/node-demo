module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("order", {
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
      payment: {
        type: DataTypes.STRING,
      },
      payment_method: {
        type: DataTypes.STRING,
      },
      rate: {
        type: DataTypes.BOOLEAN,
      },
    });
  
    return Order;
  };