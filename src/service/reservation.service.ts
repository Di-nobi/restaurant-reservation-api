import { addMinutes, generateTimeSlots, isTimeBetween, timeToMinutes } from "../utils/time";
import { ReservationDTO } from "../interfaces/data.interfaces";
import Reservations from "../models/reservations.model";
import Restuarant from "../models/restaurant.model";
import Table from "../models/tables.model";
import { Op } from "sequelize";
import { Restaurant, Waitlist } from "../models";

class ReservationService {
    async addReservation(data: ReservationDTO) {

        const verifyRestaurant = await Restuarant.findByPk(data.restaurantId);
        if (!verifyRestaurant) {
            throw Error('Restaurant not found')
        };

        let actualDuration = data.duration;
        if (verifyRestaurant.peakHourStart && verifyRestaurant.peakHourEnd && verifyRestaurant.peakHourMaxDuration) {
            const isPeakHour = isTimeBetween(
                data.startTime,
                verifyRestaurant.peakHourStart,
                verifyRestaurant.peakHourEnd
            );

            if (isPeakHour && data.duration > verifyRestaurant.peakHourMaxDuration) {
                actualDuration = verifyRestaurant.peakHourMaxDuration;
            }
        }

        const endTime = addMinutes(data.startTime, actualDuration);

        const startMinutes = timeToMinutes(data.startTime);
        const endMinutes = timeToMinutes(endTime);
        const openMinutes = timeToMinutes(verifyRestaurant.openingTime);
        const closeMinutes = timeToMinutes(verifyRestaurant.closingTime);


        if (startMinutes < openMinutes || endMinutes > closeMinutes || endMinutes <= startMinutes) {
            throw new Error('Reservation must be within restaurant operating hours');
        }

        const tables = await Table.findAll({
            where: {
                restaurantId: data.restaurantId,
                capacity: { [Op.gte]: data.partySize },
                isActive: true
            },
            order: [['capacity', 'ASC']]
        });

        if (tables.length === 0) {
            throw new Error('No table can accommodate this party size');
        }

        let selectedTable: any = null;

        for (const table of tables) {
            const overlapping = await Reservations.findOne({
                where: {
                    tableId: table.id,
                    date: data.date,
                    status: { [Op.notIn]: ['cancelled'] },
                    [Op.or]: [
                        {
                            startTime: { [Op.lt]: endTime },
                            endTime: { [Op.gt]: data.startTime }
                        }
                    ]
                }
            });

            if (!overlapping) {
                selectedTable = table;
                break;
            }
        }

        if (!selectedTable) {
            throw new Error('No table is available for this time slot');
        }

        const reservation = await Reservations.create({
            restaurantId: data.restaurantId,
            tableId: selectedTable.id,
            customerName: data.customerName,
            phone: data.phone,
            partySize: data.partySize,
            date: data.date,
            startTime: data.startTime,
            endTime: endTime,
            duration: actualDuration,
            status: 'confirmed'
        });

        // Mock confirmation
        this.sendConfirmation(reservation);

        return reservation;
    }

    async checkAvailability(restaurantId: string, date: string, startTime: string, partySize: number, duration: number) {
        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        const endTime = addMinutes(startTime, duration);

        const tables = await Table.findAll({
            where: {
                restaurantId,
                capacity: { [Op.gte]: partySize },
                isActive: true
            }
        });

        if (tables.length === 0) {
            return { available: false, message: 'No tables can accommodate this party size' };
        }

        for (const table of tables) {
            const overlapping = await Reservations.findOne({
                where: {
                    tableId: table.id,
                    date,
                    status: { [Op.notIn]: ['cancelled'] },
                    [Op.or]: [
                        {
                            startTime: { [Op.lt]: endTime },
                            endTime: { [Op.gt]: startTime }
                        }
                    ]
                }
            });

            if (!overlapping) {
                return {
                    available: true,
                    table: {
                        id: table.id,
                        tableNumber: table.tableNumber,
                        capacity: table.capacity
                    }
                };
            }
        }

        return { available: false, message: 'No tables available for this time slot' };
    }

    async getAvailableTimeSlots(restaurantId: string, date: string, partySize: number, duration: number = 120) {
        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        const slots = generateTimeSlots(
            restaurant.openingTime,
            restaurant.closingTime,
            30
        );

        const availableSlots: any = [];

        for (const slot of slots) {
            const endTime = addMinutes(slot, duration);
            
            // This will skip if reservations extends beyond closing time
            if (endTime > restaurant.closingTime) {
                continue;
            }

            const availability = await this.checkAvailability(restaurantId, date, slot, partySize, duration);
            
            if (availability.available) {
                availableSlots.push({
                    startTime: slot,
                    endTime,
                    isPeakHour: restaurant.peakHourStart && restaurant.peakHourEnd
                        ? isTimeBetween(slot, restaurant.peakHourStart, restaurant.peakHourEnd)
                        : false
                });
            }
        }

        return availableSlots;
    }

    async getReservationsByDate(restaurantId: string, date: string) {
        const reservations = await Reservations.findAll({
            where: {
                restaurantId,
                date,
                status: { [Op.notIn]: ['cancelled'] }
            },
            include: [
                {
                    model: Table,
                    as: 'table',
                    attributes: ['tableNumber', 'capacity']
                }
            ],
            order: [['startTime', 'ASC']]
        });

        return reservations.map((r: any) => ({
            id: r.id,
            customerName: r.customerName,
            phone: r.phone,
            partySize: r.partySize,
            date: r.date,
            startTime: r.startTime,
            endTime: r.endTime,
            duration: r.duration,
            status: r.status,
            table: {
                tableNumber: r.table.tableNumber,
                capacity: r.table.capacity
            }
        }));
    }

    async cancelReservation(reservationId: string) {
        const reservation = await Reservations.findByPk(reservationId);
        
        if (!reservation) {
            throw new Error('Reservation not found');
        }

        if (reservation.status === 'cancelled') {
            throw new Error('Reservation already cancelled');
        }

        reservation.status = 'cancelled';
        await reservation.save();

        await this.notifyWaitlist(
            reservation.restaurantId,
            reservation.date,
            reservation.startTime,
            reservation.partySize
        );

        return reservation;
    }

    async modifyReservation(reservationId: string, updates: Partial<ReservationDTO>) {
        const reservation = await Reservations.findByPk(reservationId);
        
        if (!reservation) {
            throw new Error('Reservation not found');
        }

        if (reservation.status === 'cancelled') {
            throw new Error('Cannot modify cancelled reservation');
        }

        if (updates.startTime || updates.date || updates.partySize) {
            const newStartTime = updates.startTime || reservation.startTime;
            const newDate = updates.date || reservation.date;
            const newPartySize = updates.partySize || reservation.partySize;
            const newDuration = updates.duration || reservation.duration;

            const availability = await this.checkAvailability(
                reservation.restaurantId,
                newDate,
                newStartTime,
                newPartySize,
                newDuration
            );

            if (!availability.available) {
                throw new Error('New time slot is not available');
            }

            const endTime = addMinutes(newStartTime, newDuration);
            
            await reservation.update({
                ...updates,
                endTime
            });
        } else {
            await reservation.update(updates);
        }

        return reservation;
    }

    private sendConfirmation(reservation: any) {
        console.log('=== RESERVATION CONFIRMATION ===');
        console.log(`To: ${reservation.customerName} (${reservation.phone})`);
        console.log(`Date: ${reservation.date}`);
        console.log(`Time: ${reservation.startTime} - ${reservation.endTime}`);
        console.log(`Party Size: ${reservation.partySize}`);
        console.log(`Reservation ID: ${reservation.id}`);
        console.log(`Status: ${reservation.status}`);
    }

    private async notifyWaitlist(restaurantId: string, date: string, time: string, partySize: number) {
        
        const waitlistEntries = await Waitlist.findAll({
            where: {
                restaurantId,
                date,
                partySize: { [Op.lte]: partySize },
                status: 'waiting'
            },
            order: [['createdAt', 'ASC']],
            limit: 1
        });

        if (waitlistEntries.length > 0) {
            const entry = waitlistEntries[0];
            entry.status = 'notified';
            await entry.save();

            console.log('=== WAITLIST NOTIFICATION ===');
            console.log(`To: ${entry.customerName} (${entry.phone})`);
            console.log(`A table is now available for ${date} at ${time}`);
            console.log(`Party size: ${entry.partySize}`);
        }
    }
}

const reservationService = new ReservationService();
export default reservationService;