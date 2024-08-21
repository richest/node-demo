module.exports = (sequelize, DataTypes) => {
	const UserStrip = sequelize.define("userStrip", {
		userId: {
			type: DataTypes.INTEGER,
		},
		name: {
			type: DataTypes.STRING,
		},
		customerId: {
			type: DataTypes.STRING,
		},
		email: {
			type: DataTypes.STRING,
		},
		cardNo: {
			type: DataTypes.STRING,
		},
		expMonth: {
			type: DataTypes.STRING,
		},
		expYear: {
			type: DataTypes.STRING,
		},
	});

	return UserStrip;
};