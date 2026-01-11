import sequelize from "../config/config";
import { DataTypes, Model } from "sequelize";

export interface IRestaurant extends Model {
    id: string;
    name: string;
    openingTime: string;
    closingTime: string;
    peakHourStart?: string;
    peakHourEnd?: string;
    peakHourMaxDuration?: number;
}

const Restuarant = sequelize.define<IRestaurant>('restaurant', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    openingTime: {
        type: DataTypes.TIME,
        allowNull: false
    },

    closingTime: {
        type: DataTypes.TIME,
        allowNull: false
    },

    peakHourStart: {
        type: DataTypes.TIME,
        allowNull: true
    },
    
    peakHourEnd: {
        type: DataTypes.TIME,
        allowNull: true
    },

    peakHourMaxDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 90
    }
});

export default Restuarant;