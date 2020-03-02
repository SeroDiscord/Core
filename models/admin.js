module.exports = (sequelize, DataTypes) => {
	const Admin = sequelize.define('Admin', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW
		}
	}, {
		tableName: 'Admin',
		timestamps: false
	});

	return Admin;
};