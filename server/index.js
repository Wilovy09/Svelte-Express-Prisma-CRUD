import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(cors({
    "origin":"http://localhost:5173",
    "methods":"GET,HEAD,PUT,POST,DELETE",
}))

app.use(express.json());

app.use('/api', userRoutes);

app.listen(8000)