module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("product", {
      name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      images_url: {
        type: DataTypes.STRING,
      },
      category_id: {
        type: DataTypes.INTEGER,
      },
      price: {
        type: DataTypes.FLOAT,
      },
      disscount: {
        type: DataTypes.FLOAT,
      },
      rating: {
        type: DataTypes.FLOAT,
      },
      ratingList: {
        type: DataTypes.INTEGER,
      },
    });  
    return Product;
  };