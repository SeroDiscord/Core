module.exports = (sequelize, DataTypes) => {
	const Player = sequelize.define('Player', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
            primaryKey: true
        },
		level: {
			type: DataTypes.INTEGER,
			allowNull: false,
            defaultValue: 1,
		},
		exp: {
			type: DataTypes.INTEGER,
			allowNull: false,
            defaultValue: 0
        },
		health: {
			type: DataTypes.INTEGER,
			allowNull: false,
            defaultValue: 50,
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
		tableName: 'Player',
		timestamps: false
    });

	return Player;
};