import Restaurant from './restaurant.model';
import Table from './tables.model';
import Reservation from './reservations.model';
import Waitlist from './waitlist.model';

// Restaurant has many Tables
Restaurant.hasMany(Table, { foreignKey: 'restaurantId', as: 'tables' });
Table.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Restaurant has many Reservations
Restaurant.hasMany(Reservation, { foreignKey: 'restaurantId', as: 'reservations' });
Reservation.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

// Table has many Reservations
Table.hasMany(Reservation, { foreignKey: 'tableId', as: 'reservations' });
Reservation.belongsTo(Table, { foreignKey: 'tableId', as: 'table' });

// Restaurant has many Waitlist entries
Restaurant.hasMany(Waitlist, { foreignKey: 'restaurantId', as: 'waitlist' });
Waitlist.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

export { Restaurant, Table, Reservation, Waitlist };