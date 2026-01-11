import { Op } from 'sequelize';
import { WaitlistDTO } from '../interfaces/data.interfaces';
import Waitlist from '../models/waitlist.model';
import Restaurant from '../models/restaurant.model';

class WaitlistService {
    async addToWaitlist(data: WaitlistDTO) {
        const restaurant = await Restaurant.findByPk(data.restaurantId);
        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        const entry = await Waitlist.create({
            restaurantId: data.restaurantId,
            customerName: data.customerName,
            phone: data.phone,
            partySize: data.partySize,
            date: data.date,
            preferredTime: data.preferredTime,
            status: 'waiting'
        });

        console.log('=== WAITLIST CONFIRMATION ===');
        console.log(`${data.customerName} added to waitlist`);
        console.log(`We'll notify you if a table becomes available`);
        console.log('=============================');

        return entry;
    }

    async getWaitlist(restaurantId: string, date: string) {
        const entries = await Waitlist.findAll({
            where: {
                restaurantId,
                date,
                status: 'waiting'
            },
            order: [['createdAt', 'ASC']]
        });

        return entries;
    }

    async removeFromWaitlist(waitlistId: string) {
        const entry = await Waitlist.findByPk(waitlistId);
        
        if (!entry) {
            throw new Error('Waitlist entry not found');
        }

        entry.status = 'expired';
        await entry.save();

        return entry;
    }
}

const waitlistService = new WaitlistService();
export default waitlistService;