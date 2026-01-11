// test/services/reservation.service.test.ts
import { expect } from 'chai';
import sinon from 'sinon';
import reservationService from '../../src/service/reservation.service';
import { Restaurant, Table, Reservation } from '../../src/models';

describe('Reservation Service', () => {
    let restaurantFindByPkStub: sinon.SinonStub;
    let tableFindAllStub: sinon.SinonStub;
    let reservationFindOneStub: sinon.SinonStub;
    let reservationCreateStub: sinon.SinonStub;
    let reservationFindAllStub: sinon.SinonStub;

    beforeEach(() => {
        restaurantFindByPkStub = sinon.stub(Restaurant, 'findByPk');
        tableFindAllStub = sinon.stub(Table, 'findAll');
        reservationFindOneStub = sinon.stub(Reservation, 'findOne');
        reservationCreateStub = sinon.stub(Reservation, 'create');
        reservationFindAllStub = sinon.stub(Reservation, 'findAll');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('addReservation', () => {
        it('should create reservation successfully', async () => {
            const reservationData = {
                restaurantId: '123',
                customerName: 'Dinobi Udeh',
                phone: '07066041638',
                partySize: 4,
                date: '2026-01-15',
                startTime: '18:00',
                duration: 120
            };

            const mockRestaurant = {
                id: '123',
                openingTime: '09:00',
                closingTime: '22:00'
            };

            const mockTable = {
                id: '456',
                tableNumber: 'T1',
                capacity: 4
            };

            restaurantFindByPkStub.resolves(mockRestaurant);
            tableFindAllStub.resolves([mockTable]);
            reservationFindOneStub.resolves(null);
            reservationCreateStub.resolves({
                id: '789',
                ...reservationData,
                tableId: '456',
                endTime: '20:00',
                status: 'confirmed'
            });

            const result = await reservationService.addReservation(reservationData);

            expect(result.customerName).to.equal('Dinobi Udeh');
            expect(result.status).to.equal('confirmed');
            expect(reservationCreateStub.calledOnce).to.be.true;
        });

        it('should throw error if restaurant not found', async () => {
            const reservationData = {
                restaurantId: '123',
                customerName: 'Dinobi Udeh',
                phone: '07066041638',
                partySize: 4,
                date: '2026-01-15',
                startTime: '18:00',
                duration: 120
            };

            restaurantFindByPkStub.resolves(null);

            try {
                await reservationService.addReservation(reservationData);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect((err as Error).message).to.equal('Restaurant not found');
            }
        });

        it('should throw error if outside operating hours', async () => {
            const reservationData = {
                restaurantId: '123',
                customerName: 'Dinobi Udeh',
                phone: '07066041638',
                partySize: 4,
                date: '2026-01-15',
                startTime: '23:00',
                duration: 120
            };

            const mockRestaurant = {
                id: '123',
                openingTime: '09:00',
                closingTime: '22:00'
            };

            restaurantFindByPkStub.resolves(mockRestaurant);
            tableFindAllStub.resolves([]);
            try {
                await reservationService.addReservation(reservationData);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect((err as Error).message).to.equal('Reservation must be within restaurant operating hours');
            }
        });

        it('should throw error if no suitable tables', async () => {
            const reservationData = {
                restaurantId: '123',
                customerName: 'Dinobi Udeh',
                phone: '07066041638',
                partySize: 10,
                date: '2026-01-15',
                startTime: '18:00',
                duration: 120
            };

            const mockRestaurant = {
                id: '123',
                openingTime: '09:00',
                closingTime: '22:00'
            };

            restaurantFindByPkStub.resolves(mockRestaurant);
            tableFindAllStub.resolves([]);

            try {
                await reservationService.addReservation(reservationData);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect((err as Error).message).to.equal('No table can accommodate this party size');
            }
        });

        it('should throw error if table is already booked', async () => {
            const reservationData = {
                restaurantId: '123',
                customerName: 'Dinobi Udeh',
                phone: '07066041638',
                partySize: 4,
                date: '2026-01-15',
                startTime: '18:00',
                duration: 120
            };

            const mockRestaurant = {
                id: '123',
                openingTime: '09:00',
                closingTime: '22:00'
            };

            const mockTable = {
                id: '456',
                tableNumber: 'T1',
                capacity: 4
            };

            restaurantFindByPkStub.resolves(mockRestaurant);
            tableFindAllStub.resolves([mockTable]);
            reservationFindOneStub.resolves({ id: '999' }); // Existing reservation

            try {
                await reservationService.addReservation(reservationData);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect((err as Error).message).to.equal('No table is available for this time slot');
            }
        });

        it('should limit duration during peak hours', async () => {
            const reservationData = {
                restaurantId: '123',
                customerName: 'Dinobi Udeh',
                phone: '07066041638',
                partySize: 4,
                date: '2026-01-15',
                startTime: '19:00',
                duration: 180
            };

            const mockRestaurant = {
                id: '123',
                openingTime: '09:00',
                closingTime: '22:00',
                peakHourStart: '18:00',
                peakHourEnd: '21:00',
                peakHourMaxDuration: 90
            };

            const mockTable = {
                id: '456',
                tableNumber: 'T1',
                capacity: 4
            };

            restaurantFindByPkStub.resolves(mockRestaurant);
            tableFindAllStub.resolves([mockTable]);
            reservationFindOneStub.resolves(null);
            reservationCreateStub.resolves({
                id: '789',
                ...reservationData,
                tableId: '456',
                duration: 90, //Limited to only peak hourss
                endTime: '20:30',
                status: 'confirmed'
            });

            const result = await reservationService.addReservation(reservationData);

            expect(result.duration).to.equal(90);
        });
    });

    describe('checkAvailability', () => {
        it('should return available table', async () => {
            const mockRestaurant = {
                id: '123',
                openingTime: '09:00',
                closingTime: '22:00'
            };

            const mockTable = {
                id: '456',
                tableNumber: 'T1',
                capacity: 4
            };

            restaurantFindByPkStub.resolves(mockRestaurant);
            tableFindAllStub.resolves([mockTable]);
            reservationFindOneStub.resolves(null);

            const result = await reservationService.checkAvailability(
                '123',
                '2026-01-15',
                '18:00',
                4,
                120
            );

            expect(result.available).to.be.true;
            expect(result?.table?.tableNumber).to.equal('T1');
        });

        it('should return unavailable if no tables', async () => {
            const mockRestaurant = {
                id: '123',
                openingTime: '09:00',
                closingTime: '22:00'
            };

            restaurantFindByPkStub.resolves(mockRestaurant);
            tableFindAllStub.resolves([]);

            const result = await reservationService.checkAvailability(
                '123',
                '2026-01-15',
                '18:00',
                4,
                120
            );

            expect(result.available).to.be.false;
            expect(result.message).to.equal('No tables can accommodate this party size');
        });
    });

    describe('getAvailableTimeSlots', () => {
        it('should return available time slots', async () => {
            const mockRestaurant = {
                id: '123',
                openingTime: '10:00',
                closingTime: '14:00'
            };

            const mockTable = {
                id: '456',
                tableNumber: 'T1',
                capacity: 4
            };

            restaurantFindByPkStub.resolves(mockRestaurant);
            tableFindAllStub.resolves([mockTable]);
            reservationFindOneStub.resolves(null);

            const result = await reservationService.getAvailableTimeSlots(
                '123',
                '2026-01-15',
                4,
                120
            );

            expect(result).to.be.an('array');
            expect(result.length).to.be.greaterThan(0);
            expect(result[0]).to.have.property('startTime');
            expect(result[0]).to.have.property('endTime');
        });
    });

    describe('cancelReservation', () => {
        it('should cancel reservation successfully', async () => {
            const mockReservation = {
                id: '789',
                status: 'confirmed',
                restaurantId: '123',
                date: '2026-01-15',
                startTime: '18:00',
                partySize: 4,
                save: sinon.stub().resolves()
            };

            const reservationFindByPkStub = sinon.stub(Reservation, 'findByPk').resolves(mockReservation as any);

            const result = await reservationService.cancelReservation('789');

            expect(mockReservation.status).to.equal('cancelled');
            expect(mockReservation.save.calledOnce).to.be.true;

            reservationFindByPkStub.restore();
        });

        it('should throw error if reservation not found', async () => {
            const reservationFindByPkStub = sinon.stub(Reservation, 'findByPk').resolves(null);

            try {
                await reservationService.cancelReservation('789');
                expect.fail('Should have thrown error');
            } catch (err) {
                expect((err as Error).message).to.equal('Reservation not found');
            }

            reservationFindByPkStub.restore();
        });
    });
});