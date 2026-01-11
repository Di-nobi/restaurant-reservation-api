import sequelize from "../config/config";
import { DataTypes, Model } from "sequelize";

export interface IReservation extends Model {
    id: string;
    restaurantId: string;
    tableId: string;
    customerName: string;
    phone: string;
    partySize: number;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const Reservations = sequelize.define<IReservation>('reservation', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },

    customerName: {
        type: DataTypes.STRING,
        allowNull: false
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

    tableId: {
		type: DataTypes.UUID,
		references: {
			model: 'tables',
			key: 'id',
		},
		onDelete: 'CASCADE',
		allowNull: false
	},

    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },

    partySize: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    date: {
        type: DataTypes.STRING,
        allowNull: false
    },

    startTime: {
        type: DataTypes.STRING,
        allowNull: false
    },

    endTime: {
        type: DataTypes.STRING,
        allowNull: false
    },

    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
    }
});

export default Reservations;