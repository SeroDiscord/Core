module.exports = (sequelize, DataTypes) => {
	const Player = sequelize.define('Player', {
		id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		discordId: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		level: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		class: {
			type: DataTypes.STRING,
			allowNull: false
		},
		exp: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		health: {
			type: DataTypes.INTEGER,
			allowNull: false
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