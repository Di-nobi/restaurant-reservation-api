import { Request, Response } from 'express';
import reservationService from '../service/reservation.service';
import waitlistService from '../service/waitlist.service';
import { ReservationDTO, WaitlistDTO, AvailabilityCheckDTO, AvailableTimeSlotsDTO } from '../interfaces/data.interfaces';

class ReservationController {
    async createReservation(req: Request, res: Response) {
        try {
            const data: ReservationDTO = req.body;
            const reservation = await reservationService.addReservation(data);

            return res.status(201).json({
                success: true,
                message: 'Reservation created successfully',
                data: reservation
            });
        } catch (err) {
            const errorMessage = (err as Error).message;

            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }
    }

    async checkAvailability(req: Request, res: Response) {
        try {
            const data: AvailabilityCheckDTO = req.body;
            const availability = await reservationService.checkAvailability(
                data.restaurantId,
                data.date,
                data.startTime,
                data.partySize,
                data.duration
            );

            return res.status(200).json({
                success: true,
                data: availability
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async getAvailableTimeSlots(req: Request, res: Response) {
        try {
            const { restaurantId, date, partySize, duration } = req.query;

            const availableSlots = await reservationService.getAvailableTimeSlots(
                restaurantId as string,
                date as string,
                parseInt(partySize as string),
                duration ? parseInt(duration as string) : 120
            );

            return res.status(200).json({
                success: true,
                data: {
                    date,
                    partySize: parseInt(partySize as string),
                    availableSlots
                }
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async getReservationsByDate(req: Request, res: Response) {
        try {
            const { restaurantId, date } = req.params;
            const reservations = await reservationService.getReservationsByDate(restaurantId, date);

            return res.status(200).json({
                success: true,
                data: reservations
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async cancelReservation(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const reservation = await reservationService.cancelReservation(id);

            return res.status(200).json({
                success: true,
                message: 'Reservation cancelled successfully',
                data: reservation
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async modifyReservation(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const reservation = await reservationService.modifyReservation(id, updates);

            return res.status(200).json({
                success: true,
                message: 'Reservation modified successfully',
                data: reservation
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async addToWaitlist(req: Request, res: Response) {
        try {
            const data: WaitlistDTO = req.body;
            const entry = await waitlistService.addToWaitlist(data);

            return res.status(201).json({
                success: true,
                message: 'Added to waitlist successfully',
                data: entry
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async getWaitlist(req: Request, res: Response) {
        try {
            const { restaurantId, date } = req.params;
            const waitlist = await waitlistService.getWaitlist(restaurantId, date);

            return res.status(200).json({
                success: true,
                data: waitlist
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }

    async removeFromWaitlist(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const entry = await waitlistService.removeFromWaitlist(id);

            return res.status(200).json({
                success: true,
                message: 'Removed from waitlist successfully',
                data: entry
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: (err as Error).message
            });
        }
    }
}

export default new ReservationController();