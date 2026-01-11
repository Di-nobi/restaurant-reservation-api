import { Router } from 'express';
import reservationController from '../controllers/reservation.controller';

const router = Router();

// Reservation routes
router.post('/', reservationController.createReservation);
router.post('/check-availability', reservationController.checkAvailability);
router.get('/available-slots', reservationController.getAvailableTimeSlots);
router.get('/:restaurantId/:date', reservationController.getReservationsByDate);
router.patch('/:id', reservationController.modifyReservation);
router.delete('/:id', reservationController.cancelReservation);

// Waitlist routes
router.post('/waitlist', reservationController.addToWaitlist);
router.get('/waitlist/:restaurantId/:date', reservationController.getWaitlist);
router.delete('/waitlist/:id', reservationController.removeFromWaitlist);

export default router;