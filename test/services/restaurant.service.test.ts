import { expect } from 'chai';
import sinon from 'sinon';
import restaurantService from '../../src/service/restuarant.service';
import { Restaurant, Table } from '../../src/models';

describe('Restaurant Service', () => {
    let restaurantCreateStub: sinon.SinonStub;
    let restaurantFindByPkStub: sinon.SinonStub;
    let tableCreateStub: sinon.SinonStub;
    let tableFindOneStub: sinon.SinonStub;

    beforeEach(() => {
        restaurantCreateStub = sinon.stub(Restaurant, 'create');
        restaurantFindByPkStub = sinon.stub(Restaurant, 'findByPk');
        tableCreateStub = sinon.stub(Table, 'create');
        tableFindOneStub = sinon.stub(Table, 'findOne');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('addRestaurant', () => {
        it('should create a restaurant successfully', async () => {
            const restaurantData = {
                name: 'Test Restaurant',
                openingTime: '09:00',
                closingTime: '22:00'
            };

            const expectedResult = {
                id: '123',
                ...restaurantData
            };

            restaurantCreateStub.resolves(expectedResult);

            const result = await restaurantService.addRestaurant(restaurantData);

            expect(result).to.deep.equal(expectedResult);
            expect(restaurantCreateStub.calledOnce).to.be.true;
        });

        it('should handle restaurant creation with peak hours', async () => {
            const restaurantData = {
                name: 'Test Restaurant',
                openingTime: '09:00',
                closingTime: '22:00',
                peakHourStart: '18:00',
                peakHourEnd: '21:00',
                peakHourMaxDuration: 90
            };

            restaurantCreateStub.resolves({ id: '123', ...restaurantData });

            const result = await restaurantService.addRestaurant(restaurantData);

            expect(result.peakHourStart).to.equal('18:00');
            expect(result.peakHourMaxDuration).to.equal(90);
        });
    });

    describe('addTableToRestaurant', () => {
        it('should add table successfully', async () => {
            const tableData = {
                restaurantId: '123',
                tableNumber: 'T1',
                capacity: 4
            };

            restaurantFindByPkStub.resolves({ id: '123' });
            tableFindOneStub.resolves(null);
            tableCreateStub.resolves({ id: '456', ...tableData });

            const result = await restaurantService.addTableToRestaurant(tableData);

            expect(result.tableNumber).to.equal('T1');
            expect(tableCreateStub.calledOnce).to.be.true;
        });

        it('should throw error if restaurant does not exist', async () => {
            const tableData = {
                restaurantId: '123',
                tableNumber: 'T1',
                capacity: 4
            };

            restaurantFindByPkStub.resolves(null);

            try {
                await restaurantService.addTableToRestaurant(tableData);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect((err as Error).message).to.equal('Restaurant not found');
            }
        });

        it('should throw error if table number already exists', async () => {
            const tableData = {
                restaurantId: '123',
                tableNumber: 'T1',
                capacity: 4
            };

            restaurantFindByPkStub.resolves({ id: '123' });
            tableFindOneStub.resolves({ id: '456', tableNumber: 'T1' });

            try {
                await restaurantService.addTableToRestaurant(tableData);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect((err as Error).message).to.equal('Table number already exists for this restaurant');
            }
        });
    });
});