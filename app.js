import express from 'express';
import  cookieParser from 'cookie-parser';

import { PORT } from './config/env.js';
import userRouter from './routes/users.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import connectToDatabase from "./Database/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";
import arcjetMiddleware from "./middleware/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();

app.use(arcjetMiddleware)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

app.use('/api/v1/users', userRouter);
app.use(errorMiddleware);

app.get('/', (req, res) => {
    res.send("Welcome to Subs app");
});

app.listen(PORT, async () => {
    console.log(`subs tracker api is running on http://localhost:${ PORT }`);

    await connectToDatabase()
});

export default app;