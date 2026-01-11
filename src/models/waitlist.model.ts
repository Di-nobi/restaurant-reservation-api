import sequelize from "../config/config";
import { DataTypes, Model } from "sequelize";

export interface IWaitlist extends Model {
    id: string;
    restaurantId: string;
    customerName: string;
    phone: string;
    partySize: number;
    date: string;
    preferredTime: string;
    status: 'waiting' | 'notified' | 'converted' | 'expired';
    createdAt: Date;
}

const Waitlist = sequelize.define<IWaitlist>('waitlist', {
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
    customerName: {
        type: DataTypes.STRING,
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
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    preferredTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('waiting', 'notified', 'converted', 'expired'),
        defaultValue: 'waiting',
        allowNull: false
    }
});

export default Waitlist;