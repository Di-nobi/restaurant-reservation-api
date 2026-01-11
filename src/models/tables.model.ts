import sequelize from "../config/config";
import { DataTypes, Model } from "sequelize";

export interface ITable extends Model {
    id: string;
    restaurantId: string;
    tableNumber: string;
    capacity: number;
    isActive: boolean;
}

const Table = sequelize.define<ITable>('table', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },

    restaurantId: {
		type: DataTypes.UUID,
		references: {
			model: 'restaurants',
			key: 'id',
		},
		onDelete: 'CASCADE',
		allowNull: false
	},

    tableNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },

    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

export default Table;