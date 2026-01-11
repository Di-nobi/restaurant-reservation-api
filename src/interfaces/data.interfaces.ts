export interface RestuarantDTO {
    name: string;
    openingTime: string;
    closingTime: string;
    peakHourStart?: string;
    peakHourEnd?: string;
    peakHourMaxDuration?: number;
}

export interface TableDTO {
    restaurantId: string;
    tableNumber: string;
    capacity: number;
}

export interface ReservationDTO {
    restaurantId: string;
    customerName: string;
    phone: string;
    partySize: number;
    date: string;
    startTime: string;
    duration: number;
}

export interface WaitlistDTO {
    restaurantId: string;
    customerName: string;
    phone: string;
    partySize: number;
    date: string;
    preferredTime: string;
}

export interface AvailabilityCheckDTO {
    restaurantId: string;
    date: string;
    startTime: string;
    partySize: number;
    duration: number;
}

export interface AvailableTimeSlotsDTO {
    restaurantId: string;
    date: string;
    partySize: number;
    duration?: number;
}