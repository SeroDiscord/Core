module.exports = (sequelize, DataTypes) => {
	const Ability = sequelize.define('Ability', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
            primaryKey: true,
			autoIncrement: true
        },
		name: {
			type: DataTypes.STRING,
			allowNull: false
        },
		description: {
			type: DataTypes.STRING,
			allowNull: false
        },
		attackText: {
			type: DataTypes.STRING,
			allowNull: false
        },
        emoji: {
			type: DataTypes.STRING,
			allowNull: false
        },
        power: {
			type: DataTypes.INTEGER,
			allowNull: false,
            defaultValue: 1,
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
		tableName: 'Ability',
		timestamps: false
    });

	return Ability;
};