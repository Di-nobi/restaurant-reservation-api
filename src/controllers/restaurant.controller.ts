import { Request, Response } from 'express';
import restaurantService from '../service/restuarant.service';
import { RestuarantDTO, TableDTO } from '../interfaces/data.interfaces';

class RestaurantController {
    async createRestaurant(req: Request, res: Response) {
        try {
            const data: RestuarantDTO = req.body;
            const restaurant = await restaurantService.addRestaurant(data);

            return res.status(201).json({
                success: true,
                message: 'Restaurant created successfully',
                data: restaurant
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async addTable(req: Request, res: Response) {
        try {
            const data: TableDTO = req.body;
            const table = await restaurantService.addTableToRestaurant(data);

            return res.status(201).json({
                success: true,
                message: 'Table added successfully',
                data: table
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async getRestaurants(req: Request, res: Response) {
        try {
            const restaurants = await restaurantService.getRestaurantsWithTables();

            return res.status(200).json({
                success: true,
                data: restaurants
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async getRestaurantById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const restaurant = await restaurantService.getRestaurantById(id);

            return res.status(200).json({
                success: true,
                data: restaurant
            });
        } catch (err) {
            return res.status(404).json({
                success: false,
                message: (err as Error).message
            });
        }
    }
}

export default new RestaurantController();