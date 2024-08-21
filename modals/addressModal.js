module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define("address", {
        user_id: {
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
        },
        default: {
            type: DataTypes.BOOLEAN,
        },
        email: {
            type: DataTypes.STRING,
        },
        street: {
            type: DataTypes.STRING,
        },
        state: {
            type: DataTypes.STRING,
        },
        country: {
            type: DataTypes.STRING,
        },
        zip: {
            type: DataTypes.INTEGER,
        },
        phone_no: {
            type: DataTypes.STRING,
        },
    });
    return Address;
};