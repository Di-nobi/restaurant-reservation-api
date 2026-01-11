import express from 'express';
import { syncDB } from './config/config';
import router from './routes';
import dotenv from 'dotenv';

dotenv.config();

syncDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);

app.use('/api', router);

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`App is running on port ${port}`); })