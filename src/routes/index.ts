import { Router } from 'express';
import restaurantRoutes from './restaurant.routes';
import reservationRoutes from './reservation.routes';

const router = Router();

router.use('/restaurants', restaurantRoutes);
router.use('/reservations', reservationRoutes);

export default router;