import { Router } from 'express';

import authorize from '../middleware/auth.middleware.js';
import {getUsers, getUser} from "../controllers/user.controller.js";
import errorMiddleware from "../middleware/error.middleware.js";

const userRouter = Router();

userRouter.get('/', getUsers);

userRouter.get('/:id',authorize, getUser);


userRouter.post('/', (req, res) => {
    res.send({ title: 'Create new users'});
});

userRouter.put('/:id', (req, res) => {
    res.send({ title: 'update user by id'});
});

userRouter.delete('/:id', (req, res) => {
    res.send({ title: 'delete user by id'});
});

export default userRouter
