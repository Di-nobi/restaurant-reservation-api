# Restaurant Table Reservation System
## A comprehensive REST API for managing restaurant table reservations, built with Node.js, TypeScript, Express, and MYSQL.

## HOW TO SETUP

1. Clone the repository

`git clone https://github.com/Di-nobi/restaurant-reservation-api.git`

`cd restaurant-reservation-api`

2. Install dependencies

Run:  `npm install`

### Database setup
3. Run: `mysql -u root -p < db/setup.sql`

Then copy `.env.example` to `.env` and update the values.

ps: please ensure mysql is installed and running

## Starting of dev server
4. To start the dev server, run
-   `npm run compile` 

-   `npm run dev`

5. To run tests
- On another terminal; run -    npm run test

## API USAGE EXAMPLES

1. Create a Restaurant

curl -X POST http://localhost:3000/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gourmet Bistro",
    "openingTime": "11:00",
    "closingTime": "23:00",
    "peakHourStart": "18:00",
    "peakHourEnd": "21:00",
    "peakHourMaxDuration": 90
  }'

 {
  "success": true,
  "message": "Restaurant created successfully",
  "data": {
    "id": "c7a3e1f9-9b2e-4d3a-8f4c-5b9a1e2d3f7a",
    "name": "Gourmet Bistro",
    "openingTime": "11:00",
    "closingTime": "23:00"
  }
}

1i. Get Restaurants

  {
    "success": true,
    "data": [
        {
        "id": "c7a3e1f9-9b2e-4d3a-8f4c-5b9a1e2d3f7a",
        "name": "Gourmet Bistro",
        "openingTime": "11:00",
        "closingTime": "23:00"
        "peakHours": {
            "start": "18:00",
            "end": "21:00",
            "maxDuration": 90
        },
        "tables": [
            {
            "id": "f12b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
            "tableNumber": "T1",
            "capacity": 4
            }
        ]
        }
    ]
  }

1ii. Get Restaurants by id

    

2. Add a table

curl -X POST http://localhost:3000/api/restaurants/tables \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "c7a3e1f9-9b2e-4d3a-8f4c-5b9a1e2d3f7a",
    "tableNumber": "T1",
    "capacity": 4
  }'

  {
  "success": true,
  "message": "Table added successfully",
  "data": {
    "id": "f12b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "restaurantId": "c7a3e1f9-9b2e-4d3a-8f4c-5b9a1e2d3f7a",
    "tableNumber": "T1",
    "capacity": 4,
    "isActive": true
  }
}



3. Check Available time slots

curl "http://localhost:3000/api/reservations/available-slots?restaurantId=your-id&date=2026-01-20&partySize=4"

4. Create Reservation

curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "c7a3e1f9-9b2e-4d3a-8f4c-5b9a1e2d3f7a",
    "customerName": "Dinobi",
    "phone": "1234567890",
    "partySize": 4,
    "date": "2026-01-20",
    "startTime": "18:00",
    "duration": 120
  }'

  {
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "id": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "customerName": "John Doe",
    "phone": "1234567890",
    "partySize": 4,
    "date": "2026-01-15",
    "startTime": "18:00",
    "endTime": "20:00",
    "duration": 120,
    "status": "confirmed"
  }
}

5. Check Availability

curl -X POST http://localhost:3000/api/reservations/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "c7a3e1f9-9b2e-4d3a-8f4c-5b9a1e2d3f7a",
    "date": "2026-01-20",
    "startTime": "18:00",
    "partySize": 4,
    "duration": 120
  }'

  {
  "success": true,
  "data": {
    "available": true,
    "table": {
      "id": "f12b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "tableNumber": "T1",
      "capacity": 4
    }
  }
}


## FUTURE ENHANCEMENTS

1. Reservation history
2. Email/SmS for real time notification
3. User authentication and authorization
4. Redis caching for availability checking
5. Payment integration
6. Adding of Joi for validation of inputs

## Design Decisions

1. I decided to put table to be in its own model than setting it as a field in restaurants as it has its own attributes. It makes it possible for normalization and also to checkmate double booking too. It can also scale as the number of tables grows.

2. I separated the there db tables to be in its own folder, with there business logic on the service folder and then the controller which serves as the requests folder for the routers

## Assumptions

1. I assumed that each tables under a restaurant will have a unique table number, meaning no other table can have that table number

2. Each reservation is assigned to exactly one table

3. Restaurants operates at the same opening and closing hours
