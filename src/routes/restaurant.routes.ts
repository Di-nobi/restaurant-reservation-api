import { Router } from 'express';
import restaurantController from '../controllers/restaurant.controller';

const router = Router();

// Restaurant routes
router.post('/', restaurantController.createRestaurant);
router.get('/', restaurantController.getRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
//the tabless
router.post('/tables', restaurantController.addTable);

export default router;