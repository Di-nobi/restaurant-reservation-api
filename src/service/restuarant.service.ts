import { RestuarantDTO, TableDTO } from '../interfaces/data.interfaces';
import { Restaurant } from '../models';
import Table from '../models/tables.model';

class RestaurantService {
    async addRestaurant(data: RestuarantDTO) {
        const info = await Restaurant.create({
            name: data.name,
            openingTime: data.openingTime,
            closingTime: data.closingTime,
            peakHourStart: data.peakHourStart,
            peakHourEnd: data.peakHourEnd,
            peakHourMaxDuration: data.peakHourMaxDuration
        });
        return info;
    }

    async addTableToRestaurant(data: TableDTO) {
        const restaurant = await Restaurant.findByPk(data.restaurantId);
        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        const existingTable = await Table.findOne({
            where: {
                restaurantId: data.restaurantId,
                tableNumber: data.tableNumber
            }
        });

        if (existingTable) {
            throw new Error('Table number already exists for this restaurant');
        }

        const info = await Table.create({
            tableNumber: data.tableNumber,
            restaurantId: data.restaurantId,
            capacity: data.capacity,
            isActive: true
        });
        return info;
    }

    async getRestaurantsWithTables() {
        const restaurants = await Restaurant.findAll({
            include: [{
                model: Table,
                as: 'tables',
                where: { isActive: true },
                required: false
            }]
        });

        return restaurants.map((restaurant: any) => ({
            id: restaurant.id,
            name: restaurant.name,
            openingTime: restaurant.openingTime,
            closingTime: restaurant.closingTime,
            peakHours: restaurant.peakHourStart && restaurant.peakHourEnd ? {
                start: restaurant.peakHourStart,
                end: restaurant.peakHourEnd,
                maxDuration: restaurant.peakHourMaxDuration
            } : null,
            tables: restaurant.tables.map((t: any) => ({
                id: t.id,
                tableNumber: t.tableNumber,
                capacity: t.capacity
            }))
        }));
    }

    async getRestaurantById(id: string) {
        const restaurant = await Restaurant.findByPk(id, {
            include: [{
                model: Table,
                as: 'tables',
                where: { isActive: true },
                required: false
            }]
        });

        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        return restaurant;
    }

    async findTable(tableNumber: string, restaurantId: string) {
        const table = await Table.findOne({
            where: {
                tableNumber,
                restaurantId
            }
        });

        return table;
    }
}

const restaurantService = new RestaurantService();
export default restaurantService;