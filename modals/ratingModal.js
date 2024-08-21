module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define("rating", {
      rate: {
        type: DataTypes.FLOAT,
      },
      user_id: {
        type: DataTypes.INTEGER,
      },
      description: {
        type: DataTypes.STRING,
      },
      product_id: {
        type: DataTypes.INTEGER,
      },
    });
    return Rating;
  };